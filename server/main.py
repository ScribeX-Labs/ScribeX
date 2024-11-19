from fastapi import FastAPI, File, UploadFile, HTTPException
from contextlib import asynccontextmanager
from starlette.middleware.cors import CORSMiddleware
import firebase_admin
from firebase_admin import credentials, firestore
import uuid
import os
from dotenv import load_dotenv
import tempfile
from moviepy.editor import VideoFileClip
from mutagen import File as MutagenFile

from aws_service import (
    upload_file_to_s3,
    generate_presigned_url,
)

load_dotenv()

# Configuration constants
MAX_FILE_SIZE = 500 * 1024 * 1024  # 500 MB in bytes
MAX_DURATION_SECONDS = 120  # 2 minutes in seconds
TESTING_MODE = False  # Global flag for testing mode

# Firebase configuration from .env variables
firebase_credentials = {
    "type": os.getenv("FIREBASE_TYPE"),
    "project_id": os.getenv("FIREBASE_PROJECT_ID"),
    "private_key_id": os.getenv("FIREBASE_PRIVATE_KEY_ID"),
    "private_key": os.getenv("FIREBASE_PRIVATE_KEY").replace("\\n", "\n"),
    "client_email": os.getenv("FIREBASE_CLIENT_EMAIL"),
    "client_id": os.getenv("FIREBASE_CLIENT_ID"),
    "auth_uri": os.getenv("FIREBASE_AUTH_URI"),
    "token_uri": os.getenv("FIREBASE_TOKEN_URI"),
    "auth_provider_x509_cert_url": os.getenv("FIREBASE_AUTH_PROVIDER_CERT_URL"),
    "client_x509_cert_url": os.getenv("FIREBASE_CLIENT_CERT_URL"),
}

# Initialize Firebase Admin SDK with environment-based credentials
cred = credentials.Certificate(firebase_credentials)
firebase_admin.initialize_app(cred)
db = firestore.client()


def get_audio_duration(file_path: str) -> float:
    """Get audio file duration using mutagen."""
    audio = MutagenFile(file_path)
    if audio is None:
        raise ValueError("Could not determine audio file duration")
    return audio.info.length


async def validate_media_file(file: UploadFile, testing_mode: bool = False) -> None:
    # Validate file type
    if not (
        file.content_type.startswith("audio/") or file.content_type.startswith("video/")
    ):
        raise HTTPException(
            status_code=400,
            detail="Invalid file type. Only audio and video files are allowed.",
        )

    # Check file size
    file_size = 0
    chunk_size = 1024 * 1024  # 1 MB
    content = b""

    while True:
        chunk = await file.read(chunk_size)
        if not chunk:
            break
        content += chunk
        file_size += len(chunk)
        if file_size > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=400,
                detail=f"File size exceeds the limit of {MAX_FILE_SIZE / (1024 * 1024):.0f} MB",
            )

    # Skip duration check in testing mode
    if not testing_mode:
        # Create temporary file for duration check
        with tempfile.NamedTemporaryFile(
            delete=False, suffix=os.path.splitext(file.filename)[1]
        ) as temp_file:
            temp_file.write(content)
            temp_file_path = temp_file.name

        try:
            # Check duration based on file type
            duration = 0
            if file.content_type.startswith("video/"):
                with VideoFileClip(temp_file_path) as video:
                    duration = video.duration
            elif file.content_type.startswith("audio/"):
                duration = get_audio_duration(temp_file_path)

            if duration > MAX_DURATION_SECONDS:
                raise HTTPException(
                    status_code=400,
                    detail=f"Media duration exceeds the limit of {MAX_DURATION_SECONDS / 60:.0f} minutes",
                )

        finally:
            # Clean up temporary file
            os.unlink(temp_file_path)

    # Reset file position for subsequent operations
    file.file.seek(0)


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield


app = FastAPI(lifespan=lifespan)

# Enable CORS for all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def read_root():
    return {
        "message": "Welcome to the Scribe API",
    }


@app.post("/upload-media/")
async def upload_media(user_id: str, file: UploadFile = File(...)):
    print(f"Uploading file: {file.filename}")
    print(f"User ID: {user_id}")

    # Validate file type and size/duration
    await validate_media_file(file, testing_mode=TESTING_MODE)

    unique_filename = f"{uuid.uuid4()}_{file.filename}"
    media_type = "audio" if file.content_type.startswith("audio/") else "video"
    s3_path = f"{user_id}/{media_type}/{unique_filename}"

    try:
        # Upload file to S3
        upload_file_to_s3(file.file, s3_path, file.content_type)

        # Generate presigned URL
        file_url = generate_presigned_url(s3_path)

        # Save metadata to Firestore
        doc_ref = (
            db.collection("uploads")
            .document(user_id)
            .collection(f"{media_type}_files")
            .document()
        )
        doc_ref.set(
            {
                "filename": unique_filename,
                "file_url": file_url,
                "user_id": user_id,
                "content_type": file.content_type,
                "upload_timestamp": firestore.SERVER_TIMESTAMP,
            }
        )

        return {"filename": unique_filename, "file_url": file_url}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")
