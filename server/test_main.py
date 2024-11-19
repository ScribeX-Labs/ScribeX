import pytest
from fastapi.testclient import TestClient
from httpx import AsyncClient
from io import BytesIO
from main import app, TESTING_MODE


@pytest.fixture(autouse=True)
def setup_testing_mode():
    """Automatically enable testing mode for all tests in this file"""
    global TESTING_MODE
    TESTING_MODE = True
    yield
    TESTING_MODE = False


@pytest.fixture
def client():
    return TestClient(app)


@pytest.mark.asyncio
async def test_upload_media_valid_file():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        # Test Case 1: Valid file (499 MB)
        file = BytesIO(b"0" * (499 * 1024 * 1024))  # 499 MB file
        response = await ac.post(
            "/upload-media/",
            params={"user_id": "test_user"},
            files={"file": ("valid_file.mp4", file, "video/mp4")},
        )
        assert response.status_code == 200
        assert "filename" in response.json()
        assert "file_url" in response.json()


@pytest.mark.asyncio
async def test_upload_media_file_size_exceeds_limit():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        # Test Case 2: File size exceeds limit (501 MB)
        file = BytesIO(b"0" * (501 * 1024 * 1024))  # 501 MB file
        response = await ac.post(
            "/upload-media/",
            params={"user_id": "test_user"},
            files={"file": ("exceed_size.mp4", file, "video/mp4")},
        )
        assert response.status_code == 400
        assert "File size exceeds the limit" in response.json()["detail"]


@pytest.mark.asyncio
async def test_upload_media_invalid_file_type():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        # Test Case 3: Invalid file type
        file = BytesIO(b"test data")
        response = await ac.post(
            "/upload-media/",
            params={"user_id": "test_user"},
            files={"file": ("test.txt", file, "text/plain")},
        )
        assert response.status_code == 400
        assert "Invalid file type" in response.json()["detail"]


@pytest.mark.asyncio
async def test_missing_user_id():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        # Test Case 4: Missing user_id
        file = BytesIO(b"test data")
        response = await ac.post(
            "/upload-media/",
            files={"file": ("test.mp4", file, "video/mp4")},
        )
        assert response.status_code == 422  # Validation error


@pytest.mark.asyncio
async def test_missing_file():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        # Test Case 5: Missing file
        response = await ac.post(
            "/upload-media/",
            params={"user_id": "test_user"},
        )
        assert response.status_code == 422  # Validation error


def test_root_endpoint(client):
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Welcome to the Scribe API"}
