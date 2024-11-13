from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.db.session import get_db
from app.schemas.bottle import BottleCreate, BottleUpdate, BottleResponse
from app.services.bottle import BottleService

router = APIRouter()

@router.post("/", response_model=BottleResponse)
def create_bottle(bottle: BottleCreate, db: Session = Depends(get_db)):
    return BottleService.create_bottle(db=db, bottle_in=bottle)

@router.get("/", response_model=List[BottleResponse])
def get_bottles(skip: int = 0, limit: int = 25, name: Optional[str] = Query(None), db: Session = Depends(get_db)):
    if name:
        # Fetch bottle by name if the name query parameter is provided
        bottle = BottleService.get_bottle_by_name(db=db, name=name)
        if not bottle:
            raise HTTPException(status_code=404, detail="Bottle not found")
        return [bottle]  # Return the found bottle in a list to match the response model
    # Otherwise, return the list of bottles with pagination
    return BottleService.get_bottles(db=db, skip=skip, limit=limit)

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
