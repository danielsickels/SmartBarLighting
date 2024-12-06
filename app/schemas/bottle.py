from pydantic import BaseModel
from typing import Optional

class BottleBase(BaseModel):
    name: str
    brand: Optional[str] = None  # Brand of the bottle
    flavor_profile: Optional[str] = None  # Flavor profile (e.g., sweet, bitter)
    capacity_ml: Optional[int] = None  # Capacity in milliliters
    spirit_type_id: int  # Reference to spirit type ID

class BottleCreate(BottleBase):
    pass

class BottleUpdate(BottleBase):
    name: Optional[str] = None
    brand: Optional[str] = None
    flavor_profile: Optional[str] = None
    capacity_ml: Optional[int] = None
    spirit_type_id: Optional[int] = None
    
class BottleResponse(BottleBase):
    id: int

    class Config:
        orm_mode = True
