from pydantic import BaseModel

class SpiritTypeBase(BaseModel):
    name: str  # Spirit type name (e.g., Whiskey, Vodka)

class SpiritTypeCreate(SpiritTypeBase):
    pass

class SpiritTypeResponse(SpiritTypeBase):
    id: int

    class Config:
        orm_mode = True
