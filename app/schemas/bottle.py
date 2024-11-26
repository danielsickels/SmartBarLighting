# app/schemas/bottle.py

from pydantic import BaseModel
from typing import Optional

class BottleBase(BaseModel):
    name: str
    brand: Optional[str] = None  # New field for brand
    flavor_profile: Optional[str] = None  # New field for flavor profile
    spirit_type: Optional[str] = None
    capacity_ml: Optional[int] = None

class BottleCreate(BottleBase):
    pass

class BottleUpdate(BottleBase):
    pass

class BottleResponse(BottleBase):
    id: int

    class Config:
        orm_mode = True
