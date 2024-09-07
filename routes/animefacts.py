from fastapi import APIRouter
import requests

router = APIRouter()


@router.get("/anime-facts")
async def get_anime_fact():
    url = "anime-facts.local"
    response = requests.get(url)
    quote = response.json()
    return quote
