from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.db.session import get_db
from app.schemas.bottle import BottleCreate, BottleUpdate, BottleResponse
from app.schemas.bottle_import import BottleImportRequest, BottleImportResponse
from app.services.bottle import BottleService
from app.services.ollama import ollama_service
from app.core.dependencies import get_current_user
from app.db.models.user import User

router = APIRouter()

@router.post("", response_model=BottleResponse)
def create_bottle(
    bottle: BottleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        # Attach the user's ID to the bottle before creation
        # bottle_data = bottle.dict()
        return BottleService.create_bottle(db=db, bottle_in=bottle, user_id=current_user.id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating bottle: {str(e)}")

@router.get("", response_model=List[BottleResponse])
def get_bottles(
    spirit_type_id: Optional[int] = None,
    # name: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Fetch bottles created by the logged-in user with optional filters for spirit_type_id and name.
    Supports pagination with skip and limit.
    """
    try:
        return BottleService.get_bottles(
            db=db,
            user_id=current_user.id,
            spirit_type_id=spirit_type_id,
            # Filter by the current user's ID
        )
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=f"Error retrieving bottles: {str(e)}")

@router.get("/{bottle_id}", response_model=BottleResponse)
def get_bottle(
    bottle_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db_bottle = BottleService.get_bottle(db=db, bottle_id=bottle_id)
    if not db_bottle or db_bottle.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Bottle not found")
    return db_bottle

@router.put("/{bottle_id}", response_model=BottleResponse)
def update_bottle(
    bottle_id: int,
    bottle: BottleUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    updated_bottle = BottleService.update_bottle(
        db=db, bottle_id=bottle_id, bottle_in=bottle, user_id=current_user.id
    )
    if not updated_bottle:
        raise HTTPException(status_code=404, detail="Bottle not found")
    return updated_bottle

@router.delete("/{bottle_id}")
def delete_bottle(
    bottle_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    success = BottleService.delete_bottle(
        db=db, bottle_id=bottle_id, user_id=current_user.id
    )
    if not success:
        raise HTTPException(status_code=404, detail="Bottle not found")
    return {"message": "Bottle deleted successfully"}


@router.post("/import", response_model=BottleImportResponse)
async def import_bottle_from_image(
    request: BottleImportRequest,
    current_user: User = Depends(get_current_user),
):
    """
    Analyze a bottle image using AI and extract bottle information.
    Returns the extracted data for user review before saving.
    Always returns 200 with success flag - check success field for result status.
    """
    try:
        result = await ollama_service.analyze_bottle_image(request.image_base64)
        
        if result.success and result.data:
            return BottleImportResponse(
                success=True,
                name=result.data.name,
                brand=result.data.brand,
                flavor_profile=result.data.flavor_profile,
                capacity_ml=result.data.capacity_ml,
                spirit_type=result.data.spirit_type,
                llm_response=result.llm_response
            )
        else:
            # Return failure with LLM response for context
            return BottleImportResponse(
                success=False,
                llm_response=result.llm_response,
                error=result.error
            )
    except Exception as e:
        return BottleImportResponse(
            success=False,
            error=f"Error analyzing bottle image: {str(e)}"
        )
