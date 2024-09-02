from fastapi import APIRouter
import requests

router = APIRouter()


@router.get("/anime")
async def get_anime_quote():
    url = "https://animechan.io/api/v1/quotes/random"
    response = requests.get(url)
    quote = response.json()
    return quote
