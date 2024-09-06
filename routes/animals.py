from fastapi import APIRouter
import requests

router = APIRouter()


@router.get("/animals")
async def get_anime_quote():
    url = "https://documenter.getpostman.com/view/664302/S1ENwy59"
    response = requests.get(url)
    quote = response.json()
    return quote