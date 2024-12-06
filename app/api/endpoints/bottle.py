from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.db.session import get_db
from app.schemas.bottle import BottleCreate, BottleUpdate, BottleResponse
from app.services.bottle import BottleService

router = APIRouter()

@router.post("", response_model=BottleResponse)
def create_bottle(bottle: BottleCreate, db: Session = Depends(get_db)):
    try:
        return BottleService.create_bottle(db=db, bottle_in=bottle)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating bottle: {str(e)}")

@router.get("", response_model=List[BottleResponse])
def get_bottles(
    skip: int = 0,
    limit: int = 25,
    spirit_type_id: Optional[int] = None,
    name: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Fetch bottles with optional filters for spirit_type_id and name.
    Supports pagination with skip and limit.
    """
    try:
        return BottleService.get_bottles(
            db=db,
            skip=skip,
            limit=limit,
            spirit_type_id=spirit_type_id,
            name=name  # Pass the name filter to the service
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving bottles: {str(e)}")
    
@router.get("/{bottle_id}", response_model=BottleResponse)
def get_bottle(bottle_id: int, db: Session = Depends(get_db)):
    db_bottle = BottleService.get_bottle(db=db, bottle_id=bottle_id)
    if not db_bottle:
        raise HTTPException(status_code=404, detail="Bottle not found")
    return db_bottle

@router.put("/{bottle_id}", response_model=BottleResponse)
def update_bottle(bottle_id: int, bottle: BottleUpdate, db: Session = Depends(get_db)):
    updated_bottle = BottleService.update_bottle(db=db, bottle_id=bottle_id, bottle_in=bottle)
    if not updated_bottle:
        raise HTTPException(status_code=404, detail="Bottle not found")
    return updated_bottle

@router.delete("/{bottle_id}")
def delete_bottle(bottle_id: int, db: Session = Depends(get_db)):
    success = BottleService.delete_bottle(db=db, bottle_id=bottle_id)
    if not success:
        raise HTTPException(status_code=404, detail="Bottle not found")
    return {"message": "Bottle deleted successfully"}
