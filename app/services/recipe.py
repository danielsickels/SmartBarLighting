from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.models.recipe import Recipe
from app.db.models.spirit_type import SpiritType
from app.schemas.recipe import RecipeCreate, RecipeUpdate

class RecipeService:
    @staticmethod
    def create_recipe(db: Session, recipe_in: RecipeCreate, user_id: int) -> Recipe:
        # Fetch the SpiritType object(s)
        spirit_types = db.query(SpiritType).filter(SpiritType.id.in_(recipe_in.spirit_type_ids), SpiritType.user_id == user_id).all()
        if len(spirit_types) != len(recipe_in.spirit_type_ids):
            raise ValueError("Some spirit type IDs do not exist in the database.")

        # Create the Recipe object
        recipe = Recipe(
            name=recipe_in.name,
            instructions=recipe_in.instructions,
            ingredients=recipe_in.ingredients,
            spirit_types=spirit_types,  # Associating spirit type(s)
            user_id=user_id,
        )

        # Save to the database
        db.add(recipe)
        db.commit()
        db.refresh(recipe)
        return recipe

    @staticmethod
    def get_recipes(db: Session, user_id: int) -> List[Recipe]:
        recipes = db.query(Recipe).filter(Recipe.user_id == user_id).all()
        return recipes

    @staticmethod
    def get_recipe(db: Session, recipe_id: int, user_id: int) -> Optional[Recipe]:
        return db.query(Recipe).filter(Recipe.id == recipe_id, Recipe.user_id == user_id).first()

    @staticmethod
    def update_recipe(db: Session, recipe_id: int, recipe_in: RecipeUpdate, user_id: int) -> Optional[Recipe]:
        recipe = db.query(Recipe).filter(Recipe.id == recipe_id, Recipe.user_id == user_id).first()
        if not recipe:
            return None
        
        # Update spirit types if provided
        if recipe_in.spirit_type_ids is not None:
            spirit_types = db.query(SpiritType).filter(
                SpiritType.id.in_(recipe_in.spirit_type_ids),
                SpiritType.user_id == user_id
            ).all()
            if len(spirit_types) != len(recipe_in.spirit_type_ids):
                raise ValueError("Some spirit type IDs do not exist in the database.")
            recipe.spirit_types = spirit_types
        
        # Update other fields
        for field, value in recipe_in.dict(exclude_unset=True, exclude={'spirit_type_ids'}).items():
            setattr(recipe, field, value)
        
        db.commit()
        db.refresh(recipe)
        return recipe

    @staticmethod
    def delete_recipe(db: Session, recipe_id: int, user_id: int) -> bool:
        recipe = db.query(Recipe).filter(Recipe.id == recipe_id, Recipe.user_id == user_id).first()
        if recipe:
            db.delete(recipe)
            db.commit()
            return True
        return False