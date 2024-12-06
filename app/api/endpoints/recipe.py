from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.schemas.recipe import RecipeCreate, RecipeResponse
from app.services.recipe import RecipeService

router = APIRouter()


class RecipeNotFoundException(HTTPException):
    """Exception raised when a requested recipe is not found."""
    def __init__(self, recipe_id: int):
        detail = f"Recipe not found: ID {recipe_id}."
        super().__init__(status_code=404, detail=detail)

@router.post("", response_model=RecipeResponse)
def create_recipe(recipe: RecipeCreate, db: Session = Depends(get_db)):
    try:
        recipe = RecipeService.create_recipe(db=db, recipe_in=recipe)
        return recipe
    except ValueError as e:  # Handle validation errors from RecipeService
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")

@router.get("", response_model=List[RecipeResponse])
def get_recipes(skip: int = 0, limit: int = 25, db: Session = Depends(get_db)):
    try:
        return RecipeService.get_recipes(db=db, skip=skip, limit=limit)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving recipes: {str(e)}")

@router.get("/{recipe_id}", response_model=RecipeResponse)
def get_recipe(recipe_id: int, db: Session = Depends(get_db)):
    recipe = RecipeService.get_recipe(db=db, recipe_id=recipe_id)
    if not recipe:
        raise RecipeNotFoundException(recipe_id)
    return recipe
    
@router.delete("/{recipe_id}")
def delete_recipe(recipe_id: int, db: Session = Depends(get_db)):
    success = RecipeService.delete_recipe(db=db, recipe_id=recipe_id)
    if not success:
        raise RecipeNotFoundException(recipe_id)
    return {"message": "Recipe deleted successfully"}
