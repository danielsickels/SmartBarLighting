from fastapi import APIRouter
from app.api.endpoints import bottle

api_router = APIRouter()
api_router.include_router(bottle.router, prefix="/bottles", tags=["Bottles"])
