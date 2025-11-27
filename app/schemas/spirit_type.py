from pydantic import BaseModel, ConfigDict

class SpiritTypeBase(BaseModel):
    name: str  # Spirit type name (e.g., Whiskey, Vodka)

class SpiritTypeCreate(SpiritTypeBase):
    pass

class SpiritTypeResponse(SpiritTypeBase):
    id: int

    model_config = ConfigDict(from_attributes=True)
