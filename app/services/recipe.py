from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.models.recipe import Recipe
from app.db.models.spirit_type import SpiritType
from app.schemas.recipe import RecipeCreate

class RecipeService:
    @staticmethod
    def create_recipe(db: Session, recipe_in: RecipeCreate) -> Recipe:
        # Fetch the SpiritType object(s)
        spirit_types = db.query(SpiritType).filter(SpiritType.id.in_(recipe_in.spirit_type_ids)).all()
        if len(spirit_types) != len(recipe_in.spirit_type_ids):
            raise ValueError("Some spirit type IDs do not exist in the database.")

        # Create the Recipe object
        recipe = Recipe(
            name=recipe_in.name,
            instructions=recipe_in.instructions,
            ingredients=recipe_in.ingredients,
            spirit_types=spirit_types,  # Associating spirit type(s)
        )

        # Save to the database
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