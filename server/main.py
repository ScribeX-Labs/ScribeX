from fastapi import FastAPI
from contextlib import asynccontextmanager
from starlette.middleware.cors import CORSMiddleware
from fastapi import File, UploadFile,HTTPException 
import boto3
from botocore.exceptions import NoCredentialsError, ClientError
import uuid
import os


# Define the lifespan event using @asynccontextmanager
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Code that runs at startup

    # Yield control to the application
    yield

    # Code that runs on shutdown (if needed)
    # You can add cleanup code here if necessary


# Pass the lifespan handler to the FastAPI instance
app = FastAPI(lifespan=lifespan)
# Enable CORS for all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)


@app.get("/")
async def read_root():
    return {"Hello": "World"}

#fill in 
AWS_REGION = '?'
S3_BUCKET_NAME = '?'
S3_CLIENT = boto3.client('?', region_name=AWS_REGION)

MAX_FILE_SIZE = 500 * 1024 * 1024  # 500 MB in bytes

@app.post("/upload-audio/")
async def upload_audio(file: UploadFile = File(...)):
    # Make sure audio file type
    if not file.content_type.startswith('audio/'):
        raise HTTPException(status_code=400, detail="Invalid file type. Only audio files are allowed.")

    # Generate a filename when it goes to bucket
    unique_filename = f"{uuid.uuid4()}_{file.filename}"

    try:# Get file size
        file_size = 0
        chunk_size = 1024*1024 
        while True:
            chunk=file.file.read(chunk_size)
            if not chunk:
                break
            file_size += len(chunk)
            if file_size > MAX_FILE_SIZE:
                raise HTTPException(status_code=400, detail="File size exceeds the limit of 500 MB.")
        file.file.seek(0)# Reset the file pointer

        # Upload file to bucket
        S3_CLIENT.upload_fileobj(
            file.file,
            S3_BUCKET_NAME,
            unique_filename,
            ExtraArgs={'ContentType': file.content_type}
        )

        # Generate a presigned URL
        file_url = S3_CLIENT.generate_presigned_url(
            'get_object',
            Params={'Bucket': S3_BUCKET_NAME, 'Key': unique_filename},
            ExpiresIn = 3600  # 1 hour
        )

        return {"filename": unique_filename, "file_url": file_url}

    except NoCredentialsError:
        raise HTTPException(status_code=500, detail="AWS credentials not found.")
    except ClientError as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload to S3: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")
    