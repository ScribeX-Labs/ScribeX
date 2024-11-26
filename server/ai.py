from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from anthropic import Anthropic
from typing import Dict, List, Optional
from datetime import datetime
import os

# Create router
ai_router = APIRouter()

# Initialize Anthropic client
anthropic = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

# In-memory storage
text_storage: Dict[str, str] = {}
conversation_history: Dict[str, List[Dict]] = {}


class TextUpload(BaseModel):
    text: str
    text_id: Optional[str] = None


class Question(BaseModel):
    text_id: str
    question: str


class Response(BaseModel):
    answer: str
    text_id: str


@ai_router.post("/upload")
async def upload_text(text_upload: TextUpload):
    """Upload text and get a text_id for future reference"""
    if not text_upload.text_id:
        text_upload.text_id = f"text_{datetime.now().strftime('%Y%m%d_%H%M%S')}"

    text_storage[text_upload.text_id] = text_upload.text
    conversation_history[text_upload.text_id] = []

    return {"text_id": text_upload.text_id, "message": "Text uploaded successfully"}


@ai_router.post("/ask", response_model=Response)
async def ask_question(question: Question):
    """Ask a question about previously uploaded text"""
    if question.text_id not in text_storage:
        raise HTTPException(status_code=404, detail="Text ID not found")

    text = text_storage[question.text_id]
    history = conversation_history[question.text_id]

    # Construct messages with the correct format
    messages = [
        {"role": "user", "content": f"Here's the text content to analyze:\n\n{text}"},
        {
            "role": "assistant",
            "content": "I'll help you analyze this text. What would you like to know?",
        },
    ]

    # Add previous conversation turns
    for turn in history:
        messages.append({"role": "user", "content": turn["question"]})
        messages.append({"role": "assistant", "content": turn["answer"]})

    # Add the current question
    messages.append({"role": "user", "content": question.question})

    try:
        # Get response from Claude with system prompt as parameter
        response = anthropic.messages.create(
            model="claude-3-sonnet-20240229",
            max_tokens=1000,
            system="You are a helpful AI assistant. Answer questions based only on the provided text content. Be concise and accurate.",
            messages=messages,
        )

        answer = response.content[0].text

        # Store the new question-answer pair in conversation history
        conversation_history[question.text_id].append(
            {"question": question.question, "answer": answer}
        )

        return Response(answer=answer, text_id=question.text_id)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@ai_router.get("/conversation/{text_id}")
async def get_conversation(text_id: str):
    """Retrieve the conversation history for a specific text"""
    if text_id not in conversation_history:
        raise HTTPException(status_code=404, detail="Text ID not found")

    return {
        "text_id": text_id,
        "text": text_storage[text_id],
        "conversation": conversation_history[text_id],
    }
