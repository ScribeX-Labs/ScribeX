from fastapi import APIRouter
import requests

router = APIRouter()


@router.get("/dogfacts")
async def get_dog_facts():
    url = "https://dog-facts-api.herokuapp.com/api/v1/resources/dogs?number=1"
    response = requests.get(url)
    quote = response.json()
    return quote
