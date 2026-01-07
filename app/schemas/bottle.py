from pydantic import BaseModel, ConfigDict
from typing import Optional

class SpiritTypeResponse(BaseModel):
    id: int
    name: str

    model_config = ConfigDict(from_attributes=True)

class BottleBase(BaseModel):
    name: str
    brand: Optional[str] = None  # Brand of the bottle
    flavor_profile: Optional[str] = None  # Flavor profile (e.g., sweet, bitter)
    capacity_ml: Optional[int] = None  # Capacity in milliliters
    spirit_type_id: int  # Reference to spirit type ID
    image_url: Optional[str] = None  # MinIO object storage URL for bottle image
    barcode: Optional[str] = None  # Barcode number

class BottleCreate(BottleBase):
    pass

class BottleUpdate(BottleBase):
    name: Optional[str] = None
    brand: Optional[str] = None
    flavor_profile: Optional[str] = None
    capacity_ml: Optional[int] = None
    spirit_type_id: Optional[int] = None
    image_url: Optional[str] = None
    barcode: Optional[str] = None

class BottleResponse(BottleBase):
    id: int
    spirit_type: Optional[SpiritTypeResponse]  # Include nested spirit type object

    model_config = ConfigDict(from_attributes=True)


class ImageUploadRequest(BaseModel):
    """Request schema for uploading an image to MinIO"""
    image_base64: str  # Base64 encoded image data (with or without data URL prefix)


class ImageUploadResponse(BaseModel):
    """Response schema for image upload"""
    success: bool
    url: Optional[str] = None  # Public URL of the uploaded image
    object_name: Optional[str] = None  # MinIO object name/path
    error: Optional[str] = None
