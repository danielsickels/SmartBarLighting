from fastapi import APIRouter
from app.api.endpoints import bottle, recipe, spirit_type, auth

api_router = APIRouter()
api_router.include_router(bottle.router, prefix="/bottles", tags=["Bottles"])
api_router.include_router(recipe.router, prefix="/recipes", tags=["Recipes"])
api_router.include_router(spirit_type.router, prefix="/spirit_types", tags=["spirit_types"])
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
