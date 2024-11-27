from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from anthropic import Anthropic
from datetime import datetime
import os
from firebase import db
from firebase_admin import firestore

# Create router
ai_router = APIRouter()
anthropic = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))


class TextUpload(BaseModel):
    text: str
    file_id: str  # This is the file_id (video or audio)
    user_id: str
    file_type: str  # "video" or "audio"


class Question(BaseModel):
    text_id: str
    question: str
    user_id: str
    file_id: str  # file_id (video or audio)
    file_type: str  # "video" or "audio"


class Response(BaseModel):
    answer: str
    text_id: str


def get_collection_name(file_type: str) -> str:
    """Helper function to get the correct collection name"""
    if file_type not in ["video", "audio"]:
        raise HTTPException(status_code=400, detail="Invalid file type")
    return f"{file_type}_files"


@ai_router.post("/upload")
async def upload_text(text_upload: TextUpload):
    """Upload text and get a text_id for future reference"""
    text_id = f"text_{datetime.now().strftime('%Y%m%d_%H%M%S')}"

    try:
        collection_name = get_collection_name(text_upload.file_type)

        # Check if the file exists in the correct path
        file_ref = (
            db.collection("uploads")
            .document(text_upload.user_id)
            .collection(collection_name)
            .document(text_upload.file_id)
        )
        file_doc = file_ref.get()

        if not file_doc.exists:
            raise HTTPException(
                status_code=404,
                detail=f"{text_upload.file_type.title()} file not found",
            )

        # Verify user has access to this file
        file_data = file_doc.to_dict()
        if file_data["user_id"] != text_upload.user_id:
            raise HTTPException(
                status_code=403, detail="Not authorized to access this file"
            )

        # add text_id to the file document
        file_ref.update(
            {
                "text_id": text_id,
            }
        )

        # Create ai_texts subcollection under the file document
        ai_text_ref = file_ref.collection("ai_texts").document(text_id)

        ai_text_ref.set(
            {
                "text": text_upload.text,
                "user_id": text_upload.user_id,
                "created_at": firestore.SERVER_TIMESTAMP,
                "conversation_history": [],
                "last_accessed": firestore.SERVER_TIMESTAMP,
                "file_type": text_upload.file_type,  # Store file type for future reference
            }
        )

        return {"text_id": text_id, "message": "Text uploaded successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to store text: {str(e)}")


@ai_router.post("/ask", response_model=Response)
async def ask_question(question: Question):
    """Ask a question about previously uploaded text"""
    try:
        collection_name = get_collection_name(question.file_type)

        # Get the AI text document from the correct path
        ai_text_ref = (
            db.collection("uploads")
            .document(question.user_id)
            .collection(collection_name)
            .document(question.file_id)
            .collection("ai_texts")
            .document(question.text_id)
        )

        ai_text_doc = ai_text_ref.get()

        if not ai_text_doc.exists:
            raise HTTPException(status_code=404, detail="Text ID not found")

        doc_data = ai_text_doc.to_dict()

        if doc_data["user_id"] != question.user_id:
            raise HTTPException(
                status_code=403, detail="Not authorized to access this text"
            )

        text = doc_data["text"]
        history = doc_data.get("conversation_history", [])

        messages = [
            {
                "role": "user",
                "content": f"Here's the text content to analyze, answer any question I have:\n\n{text}",
            },
        ]

        for turn in history:
            messages.append({"role": "user", "content": turn["question"]})
            messages.append({"role": "assistant", "content": turn["answer"]})

        messages.append({"role": "user", "content": question.question})

        try:
            response = anthropic.messages.create(
                model="claude-3-sonnet-20240229",
                max_tokens=1000,
                system=(
                    "You are a helpful AI assistant named Scribe. You take a transcription "
                    "in for a video or audio file and you answer questions if the user has "
                    "any. Answer questions based only on the provided text content. Be concise "
                    "and accurate. Talk to the user like a friend with proper greetings. Don't "
                    "start giving the summary; let only answer what the user asks about it. "
                    "Make it like a conversation."
                ),
                messages=messages,
            )

            answer = response.content[0].text

            new_history_entry = {
                "question": question.question,
                "answer": answer,
                "timestamp": datetime.now().isoformat(),
            }

            history.append(new_history_entry)

            ai_text_ref.update(
                {
                    "conversation_history": history,
                    "last_accessed": firestore.SERVER_TIMESTAMP,
                }
            )

            return Response(answer=answer, text_id=question.text_id)

        except Exception as e:
            raise HTTPException(status_code=500, detail=f"AI service error: {str(e)}")

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@ai_router.get("/conversation/{text_id}")
async def get_conversation(text_id: str, user_id: str, file_id: str, file_type: str):
    """Retrieve the conversation history for a specific text"""
    try:
        collection_name = get_collection_name(file_type)

        ai_text_ref = (
            db.collection("uploads")
            .document(user_id)
            .collection(collection_name)
            .document(file_id)
            .collection("ai_texts")
            .document(text_id)
        )

        ai_text_doc = ai_text_ref.get()

        if not ai_text_doc.exists:
            raise HTTPException(status_code=404, detail="Text ID not found")

        doc_data = ai_text_doc.to_dict()

        if doc_data["user_id"] != user_id:
            raise HTTPException(
                status_code=403, detail="Not authorized to access this text"
            )

        ai_text_ref.update({"last_accessed": firestore.SERVER_TIMESTAMP})

        return {
            "text_id": text_id,
            "text": doc_data["text"],
            "conversation": doc_data.get("conversation_history", []),
            "created_at": doc_data.get("created_at"),
            "last_accessed": doc_data.get("last_accessed"),
            "file_type": doc_data.get("file_type"),
        }

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to retrieve conversation: {str(e)}"
        )
