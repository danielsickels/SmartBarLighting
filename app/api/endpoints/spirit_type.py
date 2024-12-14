from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel

from app.db.session import get_db
from app.schemas.spirit_type import SpiritTypeCreate, SpiritTypeResponse
from app.services.spirit_type import SpiritTypeService
from app.core.dependencies import get_current_user
from app.db.models.user import User

class SpiritTypeUpdate(BaseModel):
    name: str

router = APIRouter()

@router.post("", response_model=SpiritTypeResponse)
def create_spirit_type(
    spirit_type: SpiritTypeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create a new spirit type for the current user.
    """
    try:
        return SpiritTypeService.create_spirit_type(
            db=db, spirit_type_in=spirit_type, user_id=current_user.id
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating spirit type: {str(e)}")

@router.get("", response_model=List[SpiritTypeResponse])
def get_spirit_types(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Fetch spirit types for the current user.
    """
    try:
        return SpiritTypeService.get_spirit_types(
            db=db, user_id=current_user.id,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving spirit types: {str(e)}")


@router.get("/{spirit_type_id}", response_model=SpiritTypeResponse)
def get_spirit_type(
    spirit_type_id: int, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    """
    Retrieve a single spirit type by ID.
    """
    spirit_type = SpiritTypeService.get_spirit_type(db=db, spirit_type_id=spirit_type_id)
    if not spirit_type or spirit_type.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden: Not your spirit type")
    return spirit_type

@router.put("/{spirit_type_id}", response_model=SpiritTypeResponse)
def update_spirit_type(
    spirit_type_id: int, 
    spirit_type: SpiritTypeUpdate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    """
    Update an existing spirit type.
    """
    existing_spirit_type = SpiritTypeService.get_spirit_type(db=db, spirit_type_id=spirit_type_id)
    if not existing_spirit_type or existing_spirit_type.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden: Not your spirit type")
    
    try:
        updated_spirit_type = SpiritTypeService.update_spirit_type(
            db=db, spirit_type_id=spirit_type_id, name=spirit_type.name
        )
        return updated_spirit_type
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")
    
@router.delete("/{spirit_type_id}")
def delete_spirit_type(
    spirit_type_id: int, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    """
    Delete a spirit type by ID.
    """
    spirit_type = SpiritTypeService.get_spirit_type(db=db, spirit_type_id=spirit_type_id)
    if not spirit_type or spirit_type.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden: Not your spirit type")
    
    success = SpiritTypeService.delete_spirit_type(db=db, spirit_type_id=spirit_type_id)
    if not success:
        raise HTTPException(status_code=404, detail="Spirit type not found")
    return {"message": "Spirit type deleted successfully"}
