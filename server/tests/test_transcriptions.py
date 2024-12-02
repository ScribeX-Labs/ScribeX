import pytest
import os
from unittest.mock import MagicMock, patch
from transcribe import TranscriptionService

@pytest.fixture
def mock_firebase():
    """
    Fixture to mock Firebase interactions
    """
    mock_db = MagicMock()
    mock_file_ref = MagicMock()
    mock_ai_text_doc = MagicMock()

    # Setup Firestore document chains
    mock_db.collection.return_value.document.return_value.collection.return_value.document.return_value = mock_file_ref
    mock_file_ref.collection.return_value.document.return_value = mock_ai_text_doc
    
    # Mock document methods
    mock_file_ref.update = MagicMock()
    mock_ai_text_doc.set = MagicMock()

    # Patch the db import
    with patch('server.transcribe.db', mock_db), \
         patch('server.transcribe.firestore.SERVER_TIMESTAMP', 'mock_timestamp'):
        yield {
            'db': mock_db,
            'file_ref': mock_file_ref,
            'ai_text_doc': mock_ai_text_doc
        }

class TestTranscriptionService:
    def test_initialization_default(self):
        """
        Test that TranscriptionService can be initialized with default method
        """
        service = TranscriptionService()
        assert service.transcription_method is not None

    def test_initialization_custom_method(self):
        """
        Test that TranscriptionService can be initialized with a custom transcription method
        """
        def custom_transcribe(file_path):
            return f"Custom transcription of {file_path}"
        
        service = TranscriptionService(transcription_method=custom_transcribe)
        assert service.transcription_method is not None

    def test_transcribe_successful(self, tmp_path, mock_firebase):
        test_file = tmp_path / "test_media.mp3"
        test_file.write_text("Dummy media content")

        mock_ai_text_doc = mock_firebase['ai_text_doc']

        service = TranscriptionService()
        result = service.transcribe(
            file_path=str(test_file),
            user_id="user123",
            file_id="file456",
            file_type="audio"
        )

        # Verify set was called
        mock_ai_text_doc.set.assert_called_once()
        mock_set_call = mock_ai_text_doc.set.call_args[0][0]

        assert 'text_id' in result
        assert 'transcription' in result
        assert result['file_type'] == 'audio'
        assert 'Placeholder transcription for test_media.mp3' in result['transcription']
        assert mock_set_call['text'].startswith('Placeholder transcription for')
        assert mock_set_call['user_id'] == 'user123'


    def test_transcribe_invalid_file_type(self, tmp_path):
        """
        Test that an invalid file type raises a ValueError
        """
        service = TranscriptionService()
        
        with pytest.raises(ValueError, match="Invalid file type"):
            service.transcribe(
                file_path=str(tmp_path / "test.mp3"), 
                user_id="user123", 
                file_id="file456", 
                file_type="invalid_type"
            )

    def test_transcribe_file_not_found(self):
        """
        Test that a non-existent file raises a FileNotFoundError
        """
        service = TranscriptionService()
        
        with pytest.raises(FileNotFoundError):
            service.transcribe(
                file_path="/path/to/nonexistent/file.mp3", 
                user_id="user123", 
                file_id="file456", 
                file_type="audio"
            )

    def test_transcribe_custom_method(self, tmp_path, mock_firebase):
        def custom_transcribe(file_path):
            return f"Custom transcription of {os.path.basename(file_path)}"

        service = TranscriptionService(transcription_method=custom_transcribe)

        test_file = tmp_path / "test_media.mp3"
        test_file.write_text("Dummy media content")

        result = service.transcribe(
            file_path=str(test_file),
            user_id="user123",
            file_id="file456",
            file_type="audio"
        )

        mock_file_ref = mock_firebase['file_ref']
        mock_file_ref.update.assert_called_once_with({"text_id": result["text_id"]})
        assert result['transcription'] == 'Custom transcription of test_media.mp3'
