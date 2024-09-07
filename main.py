from fastapi import FastAPI

from routes import oxalotl, anime, animals, dogfacts, dogs, animefacts

app = FastAPI()

app.include_router(animals.router)
app.include_router(anime.router)
app.include_router(oxalotl.router)
app.include_router(dogs.router)
app.include_router(dogfacts.router)
app.include_router(animefacts.router)
@app.get("/")
async def root():
    return {"message": "Scribe Test API"}

