from fastapi import APIRouter
import requests

router = APIRouter()


@router.get("/oxalotl")
async def get_oxalotl_fact():
    url = "https://theaxolotlapi.netlify.app/"
    response = requests.get(url)
    quote = response.json()
    return quote