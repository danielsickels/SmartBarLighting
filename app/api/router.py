from fastapi import APIRouter
from app.api.endpoints import bottle, recipe

api_router = APIRouter()
api_router.include_router(bottle.router, prefix="/bottles", tags=["Bottles"])
api_router.include_router(recipe.router, prefix="/recipes", tags=["Recipes"])
