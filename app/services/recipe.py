from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.models.recipe import Recipe
from app.db.models.bottle import Bottle  # Import Bottle for correct relationship handling
from app.schemas.recipe import RecipeCreate
import logging

class RecipeService:
    @staticmethod
    def create_recipe(db: Session, recipe_in: RecipeCreate) -> Recipe:
        try:
            # Fetch bottles by ID to establish the relationship
            bottles = db.query(Bottle).filter(Bottle.id.in_(recipe_in.bottle_ids)).all()
            if len(bottles) != len(recipe_in.bottle_ids):
                raise ValueError("Some bottle IDs do not exist in the database.")

            recipe = Recipe(
                name=recipe_in.name,
                instructions=recipe_in.instructions,
                ingredients=recipe_in.ingredients,
                bottles=bottles  # Assign bottles to the recipe
            )
            db.add(recipe)
            db.commit()
            db.refresh(recipe)
            return recipe
        except Exception as e:
            logging.error(f"Error creating recipe: {str(e)}")
            raise

    @staticmethod
    def get_recipes(db: Session, skip: int = 0, limit: int = 25) -> List[Recipe]:
        try:
            recipes = db.query(Recipe).offset(skip).limit(limit).all()
            logging.info(f"Retrieved recipes: {recipes}")  # Log the retrieved recipes
            return recipes
        except Exception as e:
            logging.error(f"Error retrieving recipes: {str(e)}")
            raise

    @staticmethod
    def get_recipe(db: Session, recipe_id: int) -> Optional[Recipe]:
        try:
            recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
            logging.info(f"Retrieved recipe: {recipe}")  # Log the retrieved recipe
            return recipe
        except Exception as e:
            logging.error(f"Error retrieving recipe: {str(e)}")
            raise
