import os
from firebase import db
from firebase_admin import firestore
from datetime import datetime

class TranscriptionService:
    def __init__(self, transcription_method=None):
        """
        Initialize the transcription service with an optional transcription method.
        
        Args:
            transcription_method (callable, optional): A function to perform transcription
        """
        self.transcription_method = transcription_method or self._default_transcription
    
    def _default_transcription(self, file_path):
        """
        Default transcription method that returns a placeholder transcription.
        
        Args:
            file_path (str): Path to the file to be transcribed
        
        Returns:
            str: A placeholder transcription
        """
        return f"Placeholder transcription for {os.path.basename(file_path)}"
    
    def transcribe(self, file_path: str, user_id: str, file_id: str, file_type: str):
        """
        Transcribe a file and store the transcription in Firestore.
        
        Args:
            file_path (str): Path to the file
            user_id (str): ID of the user who owns the file
            file_id (str): Unique identifier for the file
            file_type (str): Type of file ('audio', 'video', 'text')
        
        Returns:
            dict: Transcription result with text and metadata
        """
        # Validate file type
        if file_type not in ['audio', 'video', 'text']:
            raise ValueError(f"Invalid file type: {file_type}")
        
        # Check file exists
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File not found: {file_path}")
        
        # Perform transcription
        try:
            transcription_text = self.transcription_method(file_path)
            
            # Generate unique text_id
            text_id = f"text_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            
            # Reference to the file document
            collection_name = f"{file_type}_files"
            file_ref = (
                db.collection("uploads")
                .document(user_id)
                .collection(collection_name)
                .document(file_id)
            )
            
            # Create AI texts subcollection
            ai_text_ref = file_ref.collection("ai_texts").document(text_id)
            
            # Store transcription
            ai_text_ref.set({
                "text": transcription_text,
                "user_id": user_id,
                "created_at": firestore.SERVER_TIMESTAMP,
                "conversation_history": [],
                "last_accessed": firestore.SERVER_TIMESTAMP,
                "file_type": file_type,
                "original_file_path": file_path
            })
            
            # Update file document with text_id
            file_ref.update({"text_id": text_id})
            
            return {
                "text_id": text_id,
                "transcription": transcription_text,
                "file_type": file_type
            }
        
        except Exception as e:
            raise RuntimeError(f"Transcription failed: {str(e)}")