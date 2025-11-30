from pydantic import BaseModel, ConfigDict
from typing import List, Optional, Dict, Any

from app.schemas.bottle import BottleResponse
from app.schemas.spirit_type import SpiritTypeResponse

class Ingredient(BaseModel):
    """Structured ingredient model"""
    name: str
    quantity: str
    unit: str

class RecipeBase(BaseModel):
    name: str
    instructions: str
    ingredients: Optional[List[Ingredient]] = None  # Structured list of ingredients

class RecipeCreate(RecipeBase):
    spirit_type_ids: List[int]  # List of spirit type IDs

class RecipeUpdate(BaseModel):
    name: Optional[str] = None
    instructions: Optional[str] = None
    ingredients: Optional[List[Ingredient]] = None
    spirit_type_ids: Optional[List[int]] = None

class RecipeResponse(RecipeBase):
    id: int
    spirit_types: List[SpiritTypeResponse]  # Many-to-many relationship with spirit types

    model_config = ConfigDict(from_attributes=True)
