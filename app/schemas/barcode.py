from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class BarcodeRegistryBase(BaseModel):
    """Base schema for barcode registry entries"""
    barcode: str
    name: str
    brand: Optional[str] = None
    flavor_profile: Optional[str] = None
    capacity_ml: Optional[int] = None
    spirit_type_name: Optional[str] = None


class BarcodeRegistryCreate(BarcodeRegistryBase):
    """Schema for creating a new barcode registry entry"""
    pass


class BarcodeRegistryResponse(BarcodeRegistryBase):
    """Schema for barcode registry response"""
    id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class BarcodeLookupResponse(BaseModel):
    """Response for barcode lookup"""
    found: bool
    data: Optional[BarcodeRegistryResponse] = None
    message: Optional[str] = None

