import time
from fastapi import FastAPI, File, UploadFile, HTTPException, Depends
from contextlib import asynccontextmanager
from starlette.middleware.cors import CORSMiddleware
from firebase_admin import firestore
import uuid
import os
import sys
import argparse
from dotenv import load_dotenv
import tempfile
from moviepy.editor import VideoFileClip
from mutagen import File as MutagenFile
from ai import ai_router
from aws_service import (
    upload_file_to_s3,
    generate_presigned_url,
    start_transcription_job,
    get_transcription_job_status,
    get_transcription_result,
)
from firebase import db
from models import SubscriptionTier
import subscription_service as subscription
from migration import migrate_user_subscriptions

load_dotenv()

# Configuration constants
# Free tier limits
MAX_FILE_SIZE = 500 * 1024 * 1024  # 500 MB in bytes
MAX_DURATION_SECONDS = 120  # 2 minutes in seconds

# Pro tier limits (unlimited)
PRO_MAX_FILE_SIZE = (
    5 * 1024 * 1024 * 1024
)  # 5 GB in bytes (effectively unlimited for most audio/video)
PRO_MAX_DURATION_SECONDS = (
    14400  # 4 hours in seconds (effectively unlimited for most transcriptions)
)
TESTING_MODE = False  # Global flag for testing mode
MIGRATE_ON_STARTUP = os.getenv("MIGRATE_ON_STARTUP", "false").lower() == "true"

def get_audio_duration(file_path: str) -> float:
    """Get audio file duration using mutagen."""
    audio = MutagenFile(file_path)
    if audio is None:
        raise ValueError("Could not determine audio file duration")
    return audio.info.length


async def validate_media_file(
    file: UploadFile, user_id: str, testing_mode: bool = False
) -> None:
    """Validate uploaded media file, with different limits for Pro users."""
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

    # Check if user has Pro subscription
    is_pro = await subscription.is_pro_user(user_id)

    # Set limits based on subscription tier
    file_size_limit = PRO_MAX_FILE_SIZE if is_pro else MAX_FILE_SIZE
    duration_limit = PRO_MAX_DURATION_SECONDS if is_pro else MAX_DURATION_SECONDS

    # Check file size first
    file_contents = await file.read()
    file_size = len(file_contents)

    if file_size > file_size_limit:
        if is_pro:
            limit_display = f"{file_size_limit / (1024 * 1024 * 1024):.1f} GB"
        else:
            limit_display = f"{file_size_limit / (1024 * 1024):.0f} MB"

        raise HTTPException(
            status_code=400, detail=f"File size exceeds {limit_display} limit"
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

        if duration > duration_limit:
            if is_pro:
                limit_display = f"{duration_limit / 3600:.0f}-hour"
            else:
                limit_display = f"{duration_limit / 60:.0f}-minute"

            raise HTTPException(
                status_code=400, detail=f"File duration exceeds {limit_display} limit"
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
    # Run migration on startup if enabled
    if MIGRATE_ON_STARTUP:
        print("Running subscription migration on startup...")
        await migrate_user_subscriptions()
    yield


# Add a command line parser for migrations
def parse_args():
    parser = argparse.ArgumentParser(description="Scribe API Server")
    parser.add_argument(
        "--migrate",
        action="store_true",
        help="Migrate existing users to have subscription tiers",
    )
    return parser.parse_args()


# Main entry point
if __name__ == "__main__":
    args = parse_args()

    if args.migrate:
        import asyncio

        print("Running subscription migration...")
        asyncio.run(migrate_user_subscriptions())
        print("Migration complete. Exiting.")
        sys.exit(0)

    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)


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

    await validate_media_file(file, user_id, testing_mode=TESTING_MODE)

    unique_filename = f"{uuid.uuid4()}_{file.filename}"
    media_type = "audio" if file.content_type.startswith("audio/") else "video"
    s3_path = f"{user_id}/{media_type}/{unique_filename}"

    try:
        if TESTING_MODE:
            return {
                "filename": unique_filename,
                "file_url": f"http://test-url/{s3_path}",
            }

        # Upload file to S3
        upload_file_to_s3(file.file, s3_path, file.content_type)
        file_url = generate_presigned_url(s3_path)

        # Start transcription job
        job_name = f"transcribe_{uuid.uuid4()}"
        transcription_job_name = start_transcription_job(s3_path, job_name)

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
                "transcription_job_name": transcription_job_name,
                "transcription_status": "IN_PROGRESS",
            }
        )

        return {
            "id": doc_id,
            "filename": unique_filename,
            "file_url": file_url,
            "transcription_job_name": transcription_job_name,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


@app.get("/transcription-status/{user_id}/{doc_id}")
async def get_transcription_status(user_id: str, doc_id: str):
    try:
        # Get the document from Firestore
        media_types = ["audio_files", "video_files"]
        doc = None

        for media_type in media_types:
            doc_ref = (
                db.collection("uploads")
                .document(user_id)
                .collection(media_type)
                .document(doc_id)
            )
            doc = doc_ref.get()
            if doc.exists:
                break

        if not doc or not doc.exists:
            raise HTTPException(status_code=404, detail="Document not found")

        doc_data = doc.to_dict()
        job_name = doc_data.get("transcription_job_name")

        if not job_name:
            raise HTTPException(status_code=404, detail="No transcription job found")

        # Get status from AWS Transcribe
        status = get_transcription_job_status(job_name)

        # Update status in Firestore if completed
        if status["status"] == "COMPLETED":
            doc.reference.update(
                {
                    "transcription_status": "COMPLETED",
                    "transcript_uri": status["transcript_uri"],
                }
            )
        elif status["status"] == "FAILED":
            doc.reference.update(
                {
                    "transcription_status": "FAILED",
                    "failure_reason": status.get("failure_reason", "Unknown error"),
                }
            )

        return status

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


@app.get("/transcription/{user_id}/{doc_id}")
async def get_transcription(user_id: str, doc_id: str):
    try:
        # Get the document from Firestore
        media_types = ["audio_files", "video_files"]
        doc = None

        for media_type in media_types:
            doc_ref = (
                db.collection("uploads")
                .document(user_id)
                .collection(media_type)
                .document(doc_id)
            )
            doc = doc_ref.get()
            if doc.exists:
                break

        if not doc or not doc.exists:
            raise HTTPException(status_code=404, detail="Document not found")

        doc_data = doc.to_dict()
        transcript_uri = doc_data.get("transcript_uri")

        if not transcript_uri:
            raise HTTPException(
                status_code=404,
                detail="Transcription not available. Check status first.",
            )

        # Get transcription result
        transcription = get_transcription_result(transcript_uri)
        return transcription

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


# Add a new endpoint to manage user subscriptions
@app.post("/subscriptions/{user_id}")
async def update_subscription(user_id: str, tier: SubscriptionTier):
    """Update a user's subscription tier (admin access only)"""
    try:
        # In a production environment, this endpoint should be protected
        # with proper authentication to ensure only admins can update subscriptions
        subscription_data = await subscription.update_user_subscription(user_id, tier)
        return {
            "user_id": user_id,
            "subscription": subscription_data,
            "message": f"Subscription updated to {tier} successfully",
        }
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to update subscription: {str(e)}"
        )


@app.get("/subscriptions/{user_id}")
async def get_subscription(user_id: str):
    """Get a user's current subscription details"""
    try:
        subscription_data = await subscription.get_user_subscription(user_id)
        is_pro = subscription_data.get("tier") == SubscriptionTier.PRO.value

        limits = {
            "file_size": PRO_MAX_FILE_SIZE if is_pro else MAX_FILE_SIZE,
            "duration": PRO_MAX_DURATION_SECONDS if is_pro else MAX_DURATION_SECONDS,
            "file_size_display": (
                f"{PRO_MAX_FILE_SIZE / (1024 * 1024 * 1024):.1f} GB"
                if is_pro
                else f"{MAX_FILE_SIZE / (1024 * 1024):.0f} MB"
            ),
            "duration_display": (
                f"{PRO_MAX_DURATION_SECONDS / 3600:.0f} hours"
                if is_pro
                else f"{MAX_DURATION_SECONDS / 60:.0f} minutes"
            ),
        }

        return {"user_id": user_id, "subscription": subscription_data, "limits": limits}
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to get subscription: {str(e)}"
        )
