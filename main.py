from fastapi import FastAPI
from routes import oxalotl

app = FastAPI()


app.include_router(oxalotl.router)


@app.get("/")
async def root():
    return {"message": "Scribe Test API"} 