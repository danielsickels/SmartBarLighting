from fastapi import FastAPI
from app.api.router import api_router
from app.db.session import engine
from app.db.base import Base

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI()

app.include_router(api_router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Bottle API"}
