from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from anthropic import Anthropic
from typing import Dict, List, Optional
from datetime import datetime
import os
from firebase import db
from firebase_admin import firestore

# Create router
ai_router = APIRouter()
anthropic = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))


class TextUpload(BaseModel):
    text: str
    text_id: Optional[str] = None
    user_id: str


class Question(BaseModel):
    text_id: str
    question: str
    user_id: str


class Response(BaseModel):
    answer: str
    text_id: str


@ai_router.post("/upload")
async def upload_text(text_upload: TextUpload):
    """Upload text and get a text_id for future reference"""
    if not text_upload.text_id:
        text_upload.text_id = f"text_{datetime.now().strftime('%Y%m%d_%H%M%S')}"

    try:
        doc_ref = db.collection("ai_texts").document(text_upload.text_id)
        doc_ref.set(
            {
                "text": text_upload.text,
                "user_id": text_upload.user_id,
                "created_at": firestore.SERVER_TIMESTAMP,
                "conversation_history": [],
                "last_accessed": firestore.SERVER_TIMESTAMP,
            }
        )

        return {"text_id": text_upload.text_id, "message": "Text uploaded successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to store text: {str(e)}")


@ai_router.post("/ask", response_model=Response)
async def ask_question(question: Question):
    """Ask a question about previously uploaded text"""
    try:
        doc_ref = db.collection("ai_texts").document(question.text_id)
        doc = doc_ref.get()

        if not doc.exists:
            raise HTTPException(status_code=404, detail="Text ID not found")

        doc_data = doc.to_dict()

        if doc_data["user_id"] != question.user_id:
            raise HTTPException(
                status_code=403, detail="Not authorized to access this text"
            )

        text = doc_data["text"]
        history = doc_data.get("conversation_history", [])

        messages = [
            {
                "role": "user",
                "content": f"Here's the text content to analyze:\n\n{text}",
            },
            {
                "role": "assistant",
                "content": "I'll help you analyze this text. What would you like to know?",
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
                system="You are a helpful AI assistant. Answer questions based only on the provided text content. Be concise and accurate.",
                messages=messages,
            )

            answer = response.content[0].text

            # First update the conversation history
            new_history_entry = {
                "question": question.question,
                "answer": answer,
                # Use a regular datetime string instead of SERVER_TIMESTAMP
                "timestamp": datetime.now().isoformat(),
            }

            # Append the new entry to history
            history.append(new_history_entry)

            # Then update the document with both history and last_accessed
            doc_ref.update(
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
async def get_conversation(text_id: str, user_id: str):
    """Retrieve the conversation history for a specific text"""
    try:
        doc_ref = db.collection("ai_texts").document(text_id)
        doc = doc_ref.get()

        if not doc.exists:
            raise HTTPException(status_code=404, detail="Text ID not found")

        doc_data = doc.to_dict()

        if doc_data["user_id"] != user_id:
            raise HTTPException(
                status_code=403, detail="Not authorized to access this text"
            )

        # Update last_accessed timestamp in a separate operation
        doc_ref.update({"last_accessed": firestore.SERVER_TIMESTAMP})

        return {
            "text_id": text_id,
            "text": doc_data["text"],
            "conversation": doc_data.get("conversation_history", []),
            "created_at": doc_data.get("created_at"),
            "last_accessed": doc_data.get("last_accessed"),
        }

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to retrieve conversation: {str(e)}"
        )
