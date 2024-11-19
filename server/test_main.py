import pytest
from fastapi.testclient import TestClient
from httpx import AsyncClient
from io import BytesIO
from main import app, MAX_FILE_SIZE, MAX_DURATION_SECONDS
from unittest.mock import patch, MagicMock
import tempfile

# Constants
MB = 1024 * 1024  # 1 MB in bytes


def mock_video_clip():
    """Create a mock VideoFileClip"""
    mock = MagicMock()
    mock.__enter__ = MagicMock(return_value=mock)
    mock.__exit__ = MagicMock(return_value=None)
    return mock


@pytest.fixture
def mock_dependencies():
    """Mock all external dependencies"""
    # Create VideoFileClip mock with context manager support
    video_clip_mock = mock_video_clip()
    video_clip_mock.duration = 119  # Default duration

    # Create the patches
    patches = [
        patch("moviepy.editor.VideoFileClip", return_value=video_clip_mock),
        patch("main.VideoFileClip", return_value=video_clip_mock),
        patch("main.get_audio_duration", return_value=119),
    ]

    # Start all patches
    mocks = [patcher.start() for patcher in patches]
    yield mocks

    # Stop all patches
    for patcher in patches:
        patcher.stop()


@pytest.fixture
def client():
    return TestClient(app)


def create_file_with_size(size_mb: float) -> BytesIO:
    """Create a BytesIO object with specified size in MB"""
    chunk_size = min(10 * MB, int(size_mb * MB))  # Use smaller chunks for large files
    file = BytesIO()
    remaining_bytes = int(size_mb * MB)

    while remaining_bytes > 0:
        current_chunk = min(chunk_size, remaining_bytes)
        file.write(b"0" * current_chunk)
        remaining_bytes -= current_chunk

    file.seek(0)
    return file


@pytest.mark.asyncio
async def test_case_1_valid_file(mock_dependencies):
    """Test Case 1: 499 MB, 1:59 - Should accept"""
    file = create_file_with_size(499)
    mock_dependencies[0].return_value.duration = 119  # 1:59 in seconds

    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.post(
            "/upload-media/",
            params={"user_id": "test_user"},
            files={"file": ("valid_file.mp4", file, "video/mp4")},
        )

        print(f"Response status: {response.status_code}")
        if response.status_code != 200:
            print(f"Response content: {response.content}")

        assert response.status_code == 200
        assert "filename" in response.json()
        assert "file_url" in response.json()


@pytest.mark.asyncio
async def test_case_2_exceeds_duration(mock_dependencies):
    """Test Case 2: 500 MB, 2:01 - Should fail duration check"""
    file = create_file_with_size(500)
    mock_dependencies[0].return_value.duration = 121  # 2:01 in seconds

    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.post(
            "/upload-media/",
            params={"user_id": "test_user"},
            files={"file": ("duration_exceed.mp4", file, "video/mp4")},
        )

        assert response.status_code == 400
        assert "duration exceeds" in response.json()["detail"]


@pytest.mark.asyncio
async def test_case_3_exceeds_size(mock_dependencies):
    """Test Case 3: 501 MB, 2:00 - Should fail size check"""
    file = create_file_with_size(501)
    mock_dependencies[0].return_value.duration = 120  # 2:00 in seconds

    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.post(
            "/upload-media/",
            params={"user_id": "test_user"},
            files={"file": ("size_exceed.mp4", file, "video/mp4")},
        )

        assert response.status_code == 400
        assert "size exceeds" in response.json()["detail"]


@pytest.mark.asyncio
async def test_case_4_exceeds_both(mock_dependencies):
    """Test Case 4: 501 MB, 2:01 - Should fail size check first"""
    file = create_file_with_size(501)
    mock_dependencies[0].return_value.duration = 121  # 2:01 in seconds

    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.post(
            "/upload-media/",
            params={"user_id": "test_user"},
            files={"file": ("both_exceed.mp4", file, "video/mp4")},
        )

        assert response.status_code == 400
        assert "size exceeds" in response.json()["detail"]


@pytest.mark.asyncio
async def test_case_5_null_file():
    """Test Case 5: Null file - Should fail with required error"""
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.post(
            "/upload-media/",
            params={"user_id": "test_user"},
        )

        assert response.status_code == 422
        assert "field required" in response.text.lower()


@pytest.mark.asyncio
async def test_case_6_null_duration(mock_dependencies):
    """Test Case 6: 499 MB, Null duration - Should fail with required error"""
    file = create_file_with_size(499)
    mock_dependencies[0].return_value.duration = None

    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.post(
            "/upload-media/",
            params={"user_id": "test_user"},
            files={"file": ("null_duration.mp4", file, "video/mp4")},
        )

        assert response.status_code == 400
        assert "duration is required" in response.json()["detail"].lower()


def test_root_endpoint(client):
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Welcome to the Scribe API"}
