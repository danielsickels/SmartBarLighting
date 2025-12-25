from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.barcode import (
    BarcodeRegistryCreate,
    BarcodeRegistryResponse,
    BarcodeLookupResponse,
)
from app.services.barcode import BarcodeService
from app.core.dependencies import get_current_user
from app.db.models.user import User

router = APIRouter()


@router.get("/lookup/{barcode}", response_model=BarcodeLookupResponse)
def lookup_barcode(
    barcode: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Look up a barcode in the global registry.
    Returns bottle information if the barcode has been registered.
    """
    result = BarcodeService.lookup_barcode(db, barcode)
    
    if result:
        return BarcodeLookupResponse(
            found=True,
            data=BarcodeRegistryResponse(
                id=result.id,
                barcode=result.barcode,
                name=result.name,
                brand=result.brand,
                flavor_profile=result.flavor_profile,
                capacity_ml=result.capacity_ml,
                spirit_type_name=result.spirit_type_name,
                created_at=result.created_at,
            ),
            message="Barcode found in registry"
        )
    else:
        return BarcodeLookupResponse(
            found=False,
            data=None,
            message="Barcode not found. Please take a photo of the bottle to register it."
        )


@router.post("/register", response_model=BarcodeRegistryResponse)
def register_barcode(
    barcode_data: BarcodeRegistryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Register a barcode with bottle information.
    This makes the bottle data available to all users who scan this barcode.
    """
    try:
        result = BarcodeService.register_barcode(
            db=db,
            barcode_data=barcode_data,
            user_id=current_user.id
        )
        return BarcodeRegistryResponse(
            id=result.id,
            barcode=result.barcode,
            name=result.name,
            brand=result.brand,
            flavor_profile=result.flavor_profile,
            capacity_ml=result.capacity_ml,
            spirit_type_name=result.spirit_type_name,
            created_at=result.created_at,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error registering barcode: {str(e)}")

