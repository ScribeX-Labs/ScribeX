import pytest
from fastapi.testclient import TestClient
from unittest.mock import MagicMock
from ai import app, db  

# Create a test client
client = TestClient(app)

@pytest.fixture
def mock_firebase_collection(mocker):
    """
    Fixture to mock Firebase database collections.
    """
    mock_collection = MagicMock()
    mocker.patch("ai.db.collection", return_value=mock_collection)
    return mock_collection


### Tests for /upload endpoint ###
# Test case for successfully uploading a question and answer
def test_upload_successful(mocker, mock_firebase_collection):
    """
    Test case to verify successful upload of transcription data to Firebase.
    Mocks Firebase document retrieval and update operations. Checks if
    the correct response is returned upon successful upload.
    """
    # Mock Firebase document retrieval
    mock_file_ref = MagicMock()
    mock_file_ref.get.return_value.exists = True
    mock_file_ref.get.return_value.to_dict.return_value = {"user_id": "user123"}
    mock_firebase_collection.return_value.document.return_value = mock_file_ref

    # Mock Firebase update and set operations
    mock_ai_text_ref = MagicMock()
    mock_file_ref.collection.return_value.document.return_value = mock_ai_text_ref
    mock_ai_text_ref.set.return_value = None

    # Call the API
    response = client.post("/upload", json={
        "text": "Sample transcription",
        "file_id": "file123",
        "user_id": "user123",
        "file_type": "video"
    })

    # Assert that the response is as expected
    assert response.status_code == 200
    assert response.json()["message"] == "Text uploaded successfully"
    assert "text_id" in response.json()

# Test case for invalid file type in upload request
def test_upload_invalid_file_type():
    """
    Test case to verify that an invalid file type in the upload request
    returns a 400 status with the correct error message.
    """
    response = client.post("/upload", json={
        "text": "Sample transcription",
        "file_id": "file123",
        "user_id": "user123",
        "file_type": "unsupported"
    })

    # Assert that the response is as expected for an invalid file type
    assert response.status_code == 400
    assert response.json()["detail"] == "Invalid file type"

# Test case for unauthorized upload attempt
def test_upload_unauthorized_access(mocker, mock_firebase_collection):
    """
    Test case to verify that a user who is not authorized to access the
    file receives a 403 status with the appropriate error message.
    """
    mock_file_ref = MagicMock()
    mock_file_ref.get.return_value.exists = True
    mock_file_ref.get.return_value.to_dict.return_value = {"user_id": "other_user"}
    mock_firebase_collection.return_value.document.return_value = mock_file_ref

    response = client.post("/upload", json={
        "text": "Sample transcription",
        "file_id": "file123",
        "user_id": "user123",
        "file_type": "video"
    })

    # Assert that the response is as expected for unauthorized access
    assert response.status_code == 403
    assert response.json()["detail"] == "Not authorized to access this file"


### Tests for /ask endpoint ###

# Test case for successfully asking a question
def test_ask_question_successful(mocker, mock_firebase_collection):
    """
    Test case to verify that asking a question returns a valid response
    with an answer generated by the mocked Anthropic client.
    """
    # Mock Firebase retrieval
    mock_ai_text_ref = MagicMock()
    mock_ai_text_ref.get.return_value.exists = True
    mock_ai_text_ref.get.return_value.to_dict.return_value = {
        "text": "Sample transcription",
        "user_id": "user123",
        "conversation_history": []
    }
    mock_firebase_collection.return_value.document.return_value = mock_ai_text_ref

    # Mock Anthropic response
    mock_anthropic_client = mocker.patch("ai.AnthropicClient")
    mock_anthropic_client.return_value.complete.return_value = {"completion": "Mock answer"}

    response = client.post("/ask", json={
        "text_id": "text123",
        "question": "What is this about?",
        "user_id": "user123",
        "file_id": "file123",
        "file_type": "video"
    })

    # Assert that the response is as expected
    assert response.status_code == 200
    assert response.json()["answer"] == "Mock answer"
    assert response.json()["text_id"] == "text123"

# Test case for invalid text_id
def test_ask_invalid_text_id(mocker, mock_firebase_collection):
    """
    Test case to verify that an invalid text_id returns a 404 status with
    the correct error message.
    """
    mock_ai_text_ref = MagicMock()
    mock_ai_text_ref.get.return_value.exists = False
    mock_firebase_collection.return_value.document.return_value = mock_ai_text_ref

    response = client.post("/ask", json={
        "text_id": "invalid_text_id",
        "question": "What is this about?",
        "user_id": "user123",
        "file_id": "file123",
        "file_type": "video"
    })

    # Assert that the response is as expected for an invalid text_id
    assert response.status_code == 404
    assert response.json()["detail"] == "Text ID not found"


### Tests for /conversation/{text_id} endpoint ###

# Test case for successfully retrieving conversation history
def test_get_conversation_successful(mocker, mock_firebase_collection):
    """
    Test case to verify that retrieving conversation history works
    when the user is authorized and the text exists in the database.
    """
    mock_ai_text_ref = MagicMock()
    mock_ai_text_ref.get.return_value.exists = True
    mock_ai_text_ref.get.return_value.to_dict.return_value = {
        "text": "Sample transcription",
        "user_id": "user123",
        "conversation_history": [
            {"question": "What is this about?", "answer": "Mock answer"}
        ],
        "created_at": "2024-11-01T00:00:00",
        "last_accessed": "2024-11-10T00:00:00"
    }
    mock_firebase_collection.return_value.document.return_value = mock_ai_text_ref

    response = client.get("/conversation/text123", params={
        "user_id": "user123",
        "file_id": "file123",
        "file_type": "video"
    })

    # Assert that the response contains the expected conversation history
    assert response.status_code == 200
    assert response.json()["text"] == "Sample transcription"
    assert len(response.json()["conversation"]) == 1

# Test case for unauthorized access to conversation
def test_get_conversation_unauthorized_access(mocker, mock_firebase_collection):
    """
    Test case to verify that unauthorized access to a conversation
    returns a 403 status with the appropriate error message.
    """
    mock_ai_text_ref = MagicMock()
    mock_ai_text_ref.get.return_value.exists = True
    mock_ai_text_ref.get.return_value.to_dict.return_value = {"user_id": "other_user"}
    mock_firebase_collection.return_value.document.return_value = mock_ai_text_ref

    response = client.get("/conversation/text123", params={
        "user_id": "user123",
        "file_id": "file123",
        "file_type": "video"
    })

    # Assert that the response is as expected for unauthorized access
    assert response.status_code == 403
    assert response.json()["detail"] == "Not authorized to access this text"

