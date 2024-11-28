# aws_service.py
import boto3
from botocore.exceptions import NoCredentialsError, ClientError
import os
from dotenv import load_dotenv

load_dotenv()

# AWS Configuration
AWS_REGION = os.getenv("AWS_REGION")
S3_BUCKET_NAME = os.getenv("S3_BUCKET_NAME")
AWS_ACCESS_KEY = os.getenv("AWS_ACCESS_KEY")
AWS_SECRET_KEY = os.getenv("AWS_SECRET_KEY")

# Initialize AWS clients
s3_client = boto3.client(
    "s3",
    aws_access_key_id=AWS_ACCESS_KEY,
    aws_secret_access_key=AWS_SECRET_KEY,
    region_name=AWS_REGION,
)

transcribe_client = boto3.client(
    "transcribe",
    aws_access_key_id=AWS_ACCESS_KEY,
    aws_secret_access_key=AWS_SECRET_KEY,
    region_name=AWS_REGION,
)


def upload_file_to_s3(file_obj, filename, content_type):
    try:
        s3_client.upload_fileobj(
            file_obj,
            S3_BUCKET_NAME,
            filename,
            ExtraArgs={"ContentType": content_type},
        )
    except NoCredentialsError:
        raise ValueError("AWS credentials not found.")
    except ClientError as e:
        raise ValueError(f"Failed to upload to S3: {str(e)}")


def generate_presigned_url(filename, expiration=3600):
    try:
        return s3_client.generate_presigned_url(
            "get_object",
            Params={"Bucket": S3_BUCKET_NAME, "Key": filename},
            ExpiresIn=expiration,
        )
    except ClientError as e:
        raise ValueError(f"Could not generate presigned URL: {str(e)}")


def start_transcription_job(
    file_path: str, job_name: str, language_code: str = "en-US"
):
    """Start an AWS Transcribe job for the given S3 file."""
    try:
        s3_uri = f"s3://{S3_BUCKET_NAME}/{file_path}"
        response = transcribe_client.start_transcription_job(
            TranscriptionJobName=job_name,
            Media={"MediaFileUri": s3_uri},
            MediaFormat=file_path.split(".")[-1].lower(),
            LanguageCode=language_code,
            Settings={
                "ShowSpeakerLabels": True,
                "MaxSpeakerLabels": 2,
            },
        )
        return response["TranscriptionJob"]["TranscriptionJobName"]
    except ClientError as e:
        raise ValueError(f"Failed to start transcription job: {str(e)}")


def get_transcription_job_status(job_name: str):
    """Get the status of a transcription job."""
    try:
        response = transcribe_client.get_transcription_job(
            TranscriptionJobName=job_name
        )
        job = response["TranscriptionJob"]

        status = {
            "status": job["TranscriptionJobStatus"],
            "job_name": job_name,
        }

        if job["TranscriptionJobStatus"] == "COMPLETED":
            status["transcript_uri"] = job["Transcript"]["TranscriptFileUri"]
        elif job["TranscriptionJobStatus"] == "FAILED":
            status["failure_reason"] = job.get("FailureReason", "Unknown error")

        return status
    except ClientError as e:
        raise ValueError(f"Failed to get transcription job status: {str(e)}")


def get_transcription_result(transcript_uri: str):
    """Get the transcription result from the provided URI."""
    import requests

    try:
        response = requests.get(transcript_uri)
        return response.json()
    except Exception as e:
        raise ValueError(f"Failed to get transcription result: {str(e)}")
