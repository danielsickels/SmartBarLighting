from pydantic import BaseModel
from typing import List, Optional

from app.schemas.bottle import BottleBase

class RecipeBase(BaseModel):
    name: str
    instructions: str
    ingredients: Optional[str]  # A list or string representation of ingredients

class RecipeCreate(RecipeBase):
    bottle_ids: List[int]  # List of related bottle IDs

class RecipeResponse(RecipeBase):
    id: int
    bottles: List[BottleBase]  

    class Config:
        orm_mode = True

