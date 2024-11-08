# aws_service.py
import boto3
from botocore.exceptions import NoCredentialsError, ClientError
import os
from dotenv import load_dotenv

load_dotenv()  # Load environment variables from .env

# AWS Configuration
AWS_REGION = os.getenv("AWS_REGION")
S3_BUCKET_NAME = os.getenv("S3_BUCKET_NAME")
AWS_ACCESS_KEY = os.getenv("AWS_ACCESS_KEY")
AWS_SECRET_KEY = os.getenv("AWS_SECRET_KEY")

# Initialize an S3 client
s3_client = boto3.client(
    "s3",
    aws_access_key_id=AWS_ACCESS_KEY,
    aws_secret_access_key=AWS_SECRET_KEY,
    region_name=AWS_REGION,
)


def upload_file_to_s3(file_obj, filename, content_type):
    try:
        # Upload file to S3
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
