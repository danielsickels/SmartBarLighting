from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from app.api.router import api_router
from app.db.session import engine
from app.db.base import Base
from app.core.settings import settings

# Import models to ensure they're registered with Base.metadata
from app.db.models.barcode_registry import BarcodeRegistry  # noqa: F401

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI()

allowed_origins = [
    settings.FRONTEND_URL,  # Development: http://localhost:3000
    "https://barapp.dannysickels.com",  # Production frontend
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,  # Only allow specific origins
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],  # Explicitly allow these methods
    allow_headers=["Content-Type", "Authorization"],  # Explicitly allow these headers
)

# Include the API router
app.include_router(api_router)

# Add middleware to log requests and responses
@app.middleware("http")
async def log_requests(request: Request, call_next):
    try:
        print(f"Incoming request: {request.method} {request.url}")
        response = await call_next(request)
        print(f"Response status: {response.status_code}")
        return response
    except Exception as e:
        print(f"Error processing request: {request.method} {request.url}, Error: {e}")
        raise e

@app.get("/")
def read_root():
    return {"message": "Welcome to the Bottle API"}
