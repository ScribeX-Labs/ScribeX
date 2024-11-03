from fastapi import FastAPI
from contextlib import asynccontextmanager
from starlette.middleware.cors import CORSMiddleware


# Define the lifespan event using @asynccontextmanager
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Code that runs at startup

    # Yield control to the application
    yield

    # Code that runs on shutdown (if needed)
    # You can add cleanup code here if necessary


# Pass the lifespan handler to the FastAPI instance
app = FastAPI(lifespan=lifespan)
# Enable CORS for all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)


@app.get("/")
async def read_root():
    return {"Hello": "World"}