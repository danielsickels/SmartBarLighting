# Contains the API endpoints (routes) that handle requests such as creating, updating, and deleting bottles

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.db.session import get_db
from app.schemas.bottle import BottleCreate, BottleUpdate, BottleResponse
from app.services.bottle import BottleService

router = APIRouter()

@router.post("/", response_model=BottleResponse)
def create_bottle(bottle: BottleCreate, db: Session = Depends(get_db)):
    return BottleService.create_bottle(db=db, bottle_in=bottle)

@router.get("/", response_model=List[BottleResponse])
def get_bottles(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    return BottleService.get_bottles(db=db, skip=skip, limit=limit)

@router.get("/{bottle_id}", response_model=BottleResponse)
def get_bottle(bottle_id: int, db: Session = Depends(get_db)):
    db_bottle = BottleService.get_bottle(db=db, bottle_id=bottle_id)
    if not db_bottle:
        raise HTTPException(status_code=404, detail="Bottle not found")
    return db_bottle

@router.put("/{bottle_id}", response_model=BottleResponse)
def update_bottle(bottle_id: int, bottle: BottleUpdate, db: Session = Depends(get_db)):
    return BottleService.update_bottle(db=db, bottle_id=bottle_id, bottle_in=bottle)

@router.delete("/{bottle_id}")
def delete_bottle(bottle_id: int, db: Session = Depends(get_db)):
    BottleService.delete_bottle(db=db, bottle_id=bottle_id)
    return {"message": "Bottle deleted"}
