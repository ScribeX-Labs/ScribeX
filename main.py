# pg

from fastapi import FastAPI
from routes import anime, animals

app = FastAPI()

app.include_router(animals.router)
app.include_router(anime.router)


@app.get("/")
async def root():
    return {"message": "Scribe Test API"} 
