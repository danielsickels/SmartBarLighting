from pydantic import BaseModel
from typing import Optional


class BottleImportRequest(BaseModel):
    """Request schema for bottle import from image"""
    image_base64: str  # Base64 encoded image data


class BottleImportResponse(BaseModel):
    """Response schema for bottle import analysis"""
    success: bool
    # Extracted bottle data (only present if success=True)
    name: Optional[str] = None
    brand: Optional[str] = None
    flavor_profile: Optional[str] = None
    capacity_ml: Optional[int] = None
    spirit_type: Optional[str] = None
    # LLM response info
    llm_response: Optional[str] = None  # Raw text response from the LLM
    error: Optional[str] = None  # Error message if failed
