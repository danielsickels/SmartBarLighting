from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from app.db.base import Base


class BarcodeRegistry(Base):
    """
    Global registry of barcodes to bottle information.
    This allows users to scan a barcode and get pre-filled bottle data.
    Data is shared across all users - once one user registers a barcode,
    all users can benefit from it.
    """
    __tablename__ = "barcode_registry"

    id = Column(Integer, primary_key=True, index=True)
    barcode = Column(String, unique=True, nullable=False, index=True)
    
    # Bottle template data
    name = Column(String, nullable=False)
    brand = Column(String, nullable=True)
    flavor_profile = Column(String, nullable=True)
    capacity_ml = Column(Integer, nullable=True)
    spirit_type_name = Column(String, nullable=True)  # Store name, not ID (for cross-user compatibility)
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    created_by_user_id = Column(Integer, nullable=True)  # Optional: track who added it

