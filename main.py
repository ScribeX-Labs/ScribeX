from fastapi import FastAPI
from routes import oxalotl, anime, dogs

app = FastAPI()

app.include_router(anime.router)
app.include_router(oxalotl.router)
app.include_router(dogs.router)

@app.get("/")
async def root():
    return {"message": "Scribe Test API"} 