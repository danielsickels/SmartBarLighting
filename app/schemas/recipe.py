from pydantic import BaseModel, ConfigDict
from typing import List, Optional

from app.schemas.bottle import BottleResponse
from app.schemas.spirit_type import SpiritTypeResponse

class RecipeBase(BaseModel):
    name: str
    instructions: str
    ingredients: Optional[str] = None  # Optional list of ingredients as a string or JSON

class RecipeCreate(RecipeBase):
    spirit_type_ids: List[int]  # List of spirit type IDs

class RecipeResponse(RecipeBase):
    id: int
    spirit_types: List[SpiritTypeResponse]  # Many-to-many relationship with spirit types

    model_config = ConfigDict(from_attributes=True)
