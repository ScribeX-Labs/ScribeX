# test_main.py
import pytest
from httpx import AsyncClient
from main import app
from fastapi import status
from io import BytesIO


@pytest.mark.asyncio
async def test_upload_media_valid_file():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        # Test Case 1: Valid file (499 MB, 1:59)
        file = BytesIO(b"0" * (499 * 1024 * 1024))  # 499 MB file
        response = await ac.post(
            "/upload-media/",
            params={"user_id": "test_user"},
            files={"file": ("valid_file.mp4", file, "video/mp4")},
        )
        assert response.status_code == status.HTTP_200_OK
        assert response.json().get("filename") is not None


@pytest.mark.asyncio
async def test_upload_media_file_duration_exceeds_limit():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        # Test Case 2: File duration exceeds limit (500 MB, 2:01)
        file = BytesIO(b"0" * (500 * 1024 * 1024))  # 500 MB file
        response = await ac.post(
            "/upload-media/",
            params={"user_id": "test_user"},
            files={"file": ("large_file.mp4", file, "video/mp4")},
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert response.json() == {"detail": "File Duration exceeds 2-minute limit"}


@pytest.mark.asyncio
async def test_upload_media_file_size_exceeds_limit():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        # Test Case 3: File size exceeds limit (501 MB, 2:00)
        file = BytesIO(b"0" * (501 * 1024 * 1024))  # 501 MB file
        response = await ac.post(
            "/upload-media/",
            params={"user_id": "test_user"},
            files={"file": ("exceed_size.mp4", file, "video/mp4")},
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert response.json() == {"detail": "File size exceeds 500 MB limit"}


@pytest.mark.asyncio
async def test_upload_media_file_size_and_duration_exceed_limits():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        # Test Case 4: Both file size and duration exceed limits (501 MB, 2:01)
        file = BytesIO(b"0" * (501 * 1024 * 1024))  # 501 MB file
        response = await ac.post(
            "/upload-media/",
            params={"user_id": "test_user"},
            files={"file": ("exceed_both.mp4", file, "video/mp4")},
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert response.json() == {"detail": "File size and duration exceed limits."}


@pytest.mark.asyncio
async def test_upload_media_null_file_size():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        # Test Case 5: Null file size (should raise an error for missing file)
        response = await ac.post(
            "/upload-media/",
            params={"user_id": "test_user"},
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert response.json() == {"detail": "File size is required."}


@pytest.mark.asyncio
async def test_upload_media_null_file_duration():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        # Test Case 6: Null duration (missing duration info in metadata)
        file = BytesIO(b"0" * (499 * 1024 * 1024))  # 499 MB file
        response = await ac.post(
            "/upload-media/",
            params={"user_id": "test_user"},
            files={"file": ("valid_file.mp4", file, "video/mp4")},
        )
        # Assuming the backend has a mechanism to check duration (simulated here)
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert response.json() == {"detail": "File duration is required."}
