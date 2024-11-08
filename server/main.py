# main.py
from fastapi import FastAPI, File, UploadFile, HTTPException
from contextlib import asynccontextmanager
from starlette.middleware.cors import CORSMiddleware
import firebase_admin
from firebase_admin import credentials, firestore
import uuid
import os
from dotenv import load_dotenv

from aws_service import (
    upload_file_to_s3,
    generate_presigned_url,
)  # Import AWS functions

load_dotenv()  # Load environment variables from .env

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

# File size limit
MAX_FILE_SIZE = 500 * 1024 * 1024  # 500 MB in bytes


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
    # Validate file type
    if not (
        file.content_type.startswith("audio/") or file.content_type.startswith("video/")
    ):
        raise HTTPException(
            status_code=400,
            detail="Invalid file type. Only audio and video files are allowed.",
        )

    unique_filename = f"{uuid.uuid4()}_{file.filename}"
    media_type = "audio" if file.content_type.startswith("audio/") else "video"
    s3_path = f"{user_id}/{media_type}/{unique_filename}"  # Path with user ID

    try:
        # Calculate file size and validate
        file_size = 0
        chunk_size = 1024 * 1024  # 1 MB
        while True:
            chunk = file.file.read(chunk_size)
            if not chunk:
                break
            file_size += len(chunk)
            if file_size > MAX_FILE_SIZE:
                raise HTTPException(
                    status_code=400, detail="File size exceeds the limit of 500 MB."
                )
        file.file.seek(0)  # Reset file pointer

        # Use the AWS service module to upload the file
        upload_file_to_s3(file.file, s3_path, file.content_type)  # Pass the full path

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

    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")
