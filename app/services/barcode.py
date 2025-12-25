from typing import Optional
from sqlalchemy.orm import Session
from app.db.models.barcode_registry import BarcodeRegistry
from app.schemas.barcode import BarcodeRegistryCreate


class BarcodeService:
    """Service for managing barcode registry operations"""
    
    @staticmethod
    def lookup_barcode(db: Session, barcode: str) -> Optional[BarcodeRegistry]:
        """
        Look up a barcode in the registry.
        
        Args:
            db: Database session
            barcode: Barcode string to look up
            
        Returns:
            BarcodeRegistry entry if found, None otherwise
        """
        return db.query(BarcodeRegistry).filter(
            BarcodeRegistry.barcode == barcode
        ).first()
    
    @staticmethod
    def register_barcode(
        db: Session, 
        barcode_data: BarcodeRegistryCreate,
        user_id: Optional[int] = None
    ) -> BarcodeRegistry:
        """
        Register a new barcode in the registry.
        
        Args:
            db: Database session
            barcode_data: Barcode registration data
            user_id: Optional user ID who registered this barcode
            
        Returns:
            Created BarcodeRegistry entry
        """
        # Check if barcode already exists
        existing = db.query(BarcodeRegistry).filter(
            BarcodeRegistry.barcode == barcode_data.barcode
        ).first()
        
        if existing:
            # Update existing entry
            existing.name = barcode_data.name
            existing.brand = barcode_data.brand
            existing.flavor_profile = barcode_data.flavor_profile
            existing.capacity_ml = barcode_data.capacity_ml
            existing.spirit_type_name = barcode_data.spirit_type_name
            db.commit()
            db.refresh(existing)
            return existing
        
        # Create new entry
        registry_entry = BarcodeRegistry(
            barcode=barcode_data.barcode,
            name=barcode_data.name,
            brand=barcode_data.brand,
            flavor_profile=barcode_data.flavor_profile,
            capacity_ml=barcode_data.capacity_ml,
            spirit_type_name=barcode_data.spirit_type_name,
            created_by_user_id=user_id
        )
        
        db.add(registry_entry)
        db.commit()
        db.refresh(registry_entry)
        return registry_entry

