from pydantic import BaseModel

class BottleBase(BaseModel):
    name: str
    material: str
    capacity_ml: int

class BottleCreate(BottleBase):
    pass

class BottleUpdate(BottleBase):
    pass

class BottleResponse(BottleBase):
    id: int

    class Config:
        orm_mode = True
