from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.schemas.recipe import RecipeCreate, RecipeUpdate, RecipeResponse
from app.services.recipe import RecipeService
from app.core.dependencies import get_current_user
from app.db.models.user import User

router = APIRouter()

class RecipeNotFoundException(HTTPException):
    """Exception raised when a requested recipe is not found."""
    def __init__(self, recipe_id: int):
        detail = f"Recipe not found: ID {recipe_id}."
        super().__init__(status_code=404, detail=detail)

@router.post("", response_model=RecipeResponse)
def create_recipe(
    recipe: RecipeCreate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    try:
        # Attach the user's ID to the recipe before creation
        return RecipeService.create_recipe(db=db, recipe_in=recipe, user_id=current_user.id)
    except ValueError as e:  # Handle validation errors from RecipeService
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")

@router.get("", response_model=List[RecipeResponse])
def get_recipes(
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    try:
        # Fetch only recipes belonging to the current user
        return RecipeService.get_recipes(db=db, user_id=current_user.id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving recipes: {str(e)}")

@router.get("/{recipe_id}", response_model=RecipeResponse)
def get_recipe(
    recipe_id: int, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    recipe = RecipeService.get_recipe(db=db, recipe_id=recipe_id)
    if not recipe or recipe.user_id != current_user.id:
        raise RecipeNotFoundException(recipe_id)
    return recipe

@router.put("/{recipe_id}", response_model=RecipeResponse)
def update_recipe(
    recipe_id: int,
    recipe: RecipeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        updated_recipe = RecipeService.update_recipe(
            db=db, recipe_id=recipe_id, recipe_in=recipe, user_id=current_user.id
        )
        if not updated_recipe:
            raise RecipeNotFoundException(recipe_id)
        return updated_recipe
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")

@router.delete("/{recipe_id}")
def delete_recipe(
    recipe_id: int, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    success = RecipeService.delete_recipe(db=db, recipe_id=recipe_id, user_id=current_user.id)
    if not success:
        raise RecipeNotFoundException(recipe_id)
    return {"message": "Recipe deleted successfully"}
