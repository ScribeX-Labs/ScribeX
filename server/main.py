import time
from fastapi import FastAPI, File, UploadFile, HTTPException
from contextlib import asynccontextmanager
from starlette.middleware.cors import CORSMiddleware
from firebase_admin import firestore
import uuid
import os
from dotenv import load_dotenv
import tempfile
from moviepy.editor import VideoFileClip
from mutagen import File as MutagenFile
from ai import ai_router
from aws_service import (
    upload_file_to_s3,
    generate_presigned_url,
)
from firebase import db

load_dotenv()

# Configuration constants
MAX_FILE_SIZE = 500 * 1024 * 1024  # 500 MB in bytes
MAX_DURATION_SECONDS = 120  # 2 minutes in seconds
TESTING_MODE = False  # Global flag for testing mode

def get_audio_duration(file_path: str) -> float:
    """Get audio file duration using mutagen."""
    audio = MutagenFile(file_path)
    if audio is None:
        raise ValueError("Could not determine audio file duration")
    return audio.info.length


async def validate_media_file(file: UploadFile, testing_mode: bool = False) -> None:
    """Validate uploaded media file."""
    if not file:
        raise HTTPException(status_code=400, detail="File size is required.")

    # Validate file type
    if not (
        file.content_type.startswith("audio/") or file.content_type.startswith("video/")
    ):
        raise HTTPException(
            status_code=400,
            detail="Invalid file type. Only audio and video files are allowed.",
        )

    # Check file size first
    file_contents = await file.read()
    file_size = len(file_contents)

    if file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"File size exceeds {MAX_FILE_SIZE / (1024 * 1024):.0f} MB limit",
        )

    # Create temporary file for duration check
    with tempfile.NamedTemporaryFile(
        delete=False, suffix=os.path.splitext(file.filename)[1]
    ) as temp_file:
        temp_file.write(file_contents)
        temp_file_path = temp_file.name

    try:
        # Check duration based on file type
        duration = None
        try:
            if file.content_type.startswith("video/"):
                with VideoFileClip(temp_file_path) as video:
                    duration = video.duration
            elif file.content_type.startswith("audio/"):
                duration = get_audio_duration(temp_file_path)
        except Exception as e:
            print(f"Error reading duration: {str(e)}")
            duration = None

        if duration is None:
            raise HTTPException(status_code=400, detail="File duration is required.")

        if duration > MAX_DURATION_SECONDS:
            raise HTTPException(
                status_code=400,
                detail=f"File duration exceeds {MAX_DURATION_SECONDS / 60:.0f}-minute limit",
            )

    finally:
        # Clean up temporary file
        try:
            os.unlink(temp_file_path)
        except:
            pass
        # Reset file position for subsequent operations
        file.file.seek(0)

    # Reset file position after reading
    await file.seek(0)


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

app.include_router(ai_router, prefix="/ai")

@app.get("/")
async def read_root():
    return {
        "message": "Welcome to the Scribe API",
    }


@app.post("/upload-media/")
async def upload_media(user_id: str, file: UploadFile = File(...)):
    print(f"Uploading file: {file.filename}")
    print(f"User ID: {user_id}")
    print(f"Testing mode: {TESTING_MODE}")

    # Pass testing mode to validate_media_file
    await validate_media_file(file, testing_mode=TESTING_MODE)

    unique_filename = f"{uuid.uuid4()}_{file.filename}"
    media_type = "audio" if file.content_type.startswith("audio/") else "video"
    s3_path = f"{user_id}/{media_type}/{unique_filename}"

    try:
        # For testing mode, skip actual upload and return mock response
        if TESTING_MODE:
            return {
                "filename": unique_filename,
                "file_url": f"http://test-url/{s3_path}",
            }

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
        doc_id = doc_ref.id
        doc_ref.set(
            {
                "id": doc_id,
                "filename": unique_filename,
                "original_filename": file.filename,
                "file_url": file_url,
                "user_id": user_id,
                "content_type": file.content_type,
                "upload_timestamp": firestore.SERVER_TIMESTAMP,
            }
        )

        return {"id": doc_id, "filename": unique_filename, "file_url": file_url}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


@app.post("/update-media-url")
async def update_media_url(body: dict):
    user_id = body.get("user_id")
    file_url = body.get("file_url")

    expires = file_url.split("Expires=")[-1]

    # if not expired, return the same URL
    if int(expires) > int(time.time()):
        return {"new_file_url": file_url}

    if not user_id or not file_url:
        raise HTTPException(
            status_code=422, detail="user_id or file_url cannot be empty"
        )

    try:
        # Determine media type based on file_url
        if "audio" in file_url:
            media_type = "audio"
        elif "video" in file_url:
            media_type = "video"
        else:
            raise HTTPException(status_code=400, detail="Invalid media type in URL")

        # Search for the document in Firestore by file_url
        collection_ref = (
            db.collection("uploads").document(user_id).collection(f"{media_type}_files")
        )
        query = collection_ref.where("file_url", "==", file_url).limit(1)
        docs = query.stream()

        doc = next(docs, None)
        if not doc:
            raise HTTPException(status_code=404, detail="File not found")
        # check if its still valid by checking the file_url Expires query param
        # Get the S3 path from the document
        file_data = doc.to_dict()
        s3_path = file_data.get("file_url").split("amazonaws.com/")[-1]
        # remove stuff after ? in the URL
        s3_path = s3_path.split("?")[0]

        # Generate a new presigned URL
        new_file_url = generate_presigned_url(s3_path)

        # Update the Firestore document with the new URL
        doc.reference.update({"file_url": new_file_url})

        return {"id": doc.id, "new_file_url": new_file_url}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")
