from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.db.models.recipe import Recipe
from app.db.session import get_db
from app.schemas.recipe import RecipeCreate, RecipeResponse
from app.services.recipe import RecipeService

router = APIRouter()


@router.post("", response_model=RecipeResponse)
def create_recipe(recipe: RecipeCreate, db: Session = Depends(get_db)):
    try:
        return RecipeService.create_recipe(db=db, recipe_in=recipe)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error creating recipe: {str(e)}")

@router.get("", response_model=List[RecipeResponse])
def get_recipes(skip: int = 0, limit: int = 25, db: Session = Depends(get_db)):
    try:
        return RecipeService.get_recipes(db=db, skip=skip, limit=limit)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error retrieving recipes: {str(e)}")

@router.get("/{recipe_id}", response_model=RecipeResponse)
def get_recipe(recipe_id: int, db: Session = Depends(get_db)):
    try:
        recipe = RecipeService.get_recipe(db=db, recipe_id=recipe_id)
        if not recipe:
            raise HTTPException(status_code=404, detail="Recipe not found")
        return recipe
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error retrieving recipe: {str(e)}")
    
@router.delete("/{recipe_id}")
def delete_recipe(recipe_id: int, db: Session = Depends(get_db)):
    try:
        success = RecipeService.delete_recipe(db=db, recipe_id=recipe_id)
        if not success:
            raise HTTPException(status_code=404, detail="Recipe not found")
        return {"message": "Recipe deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error deleting recipe: {str(e)}")
