from fastapi import APIRouter
import requests

router = APIRouter()


@router.get("/dogs")
async def get_oxalotl_fact():
    url = "https://dog.ceo/api/breeds/image/random/"
    response = requests.get(url)
    quote = response.json()
    return quote