from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.models.recipe import Recipe
from app.db.models.bottle import Bottle
from app.schemas.recipe import RecipeCreate

class RecipeService:
    @staticmethod
    def create_recipe(db: Session, recipe_in: RecipeCreate) -> Recipe:
        # Validate that all provided bottle_ids exist in the database
        bottles = db.query(Bottle).filter(Bottle.id.in_(recipe_in.bottle_ids)).all()
        if len(bottles) != len(recipe_in.bottle_ids):
            raise ValueError("Some bottle IDs do not exist in the database.")

        # Create a new Recipe instance
        recipe = Recipe(
            name=recipe_in.name,
            instructions=recipe_in.instructions,
            ingredients=recipe_in.ingredients,
            bottles=bottles,  # Associate bottles with the recipe
        )
        db.add(recipe)
        db.commit()
        db.refresh(recipe)
        return recipe

    @staticmethod
    def get_recipes(db: Session, skip: int = 0, limit: int = 25) -> List[Recipe]:
        return db.query(Recipe).offset(skip).limit(limit).all()

    @staticmethod
    def get_recipe(db: Session, recipe_id: int) -> Optional[Recipe]:
        return db.query(Recipe).filter(Recipe.id == recipe_id).first()

    @staticmethod
    def delete_recipe(db: Session, recipe_id: int) -> bool:
        recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
        if recipe:
            db.delete(recipe)
            db.commit()
            return True
        return False
