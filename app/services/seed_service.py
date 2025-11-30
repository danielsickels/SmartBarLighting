"""
Seed service for populating new user accounts with default recipes and spirit types.
"""
import json
import logging
from pathlib import Path
from typing import Dict, List
from sqlalchemy.orm import Session

from app.db.models.recipe import Recipe
from app.db.models.spirit_type import SpiritType

logger = logging.getLogger(__name__)


class SeedService:
    """Service for seeding default data to new user accounts"""
    
    # Path to the seed data JSON file
    SEED_DATA_PATH = Path(__file__).parent.parent / "db" / "seed_data" / "default_recipes.json"
    
    @staticmethod
    def load_seed_data() -> Dict:
        """Load the seed data from JSON file"""
        try:
            with open(SeedService.SEED_DATA_PATH, 'r', encoding='utf-8') as f:
                return json.load(f)
        except FileNotFoundError:
            logger.error(f"Seed data file not found at {SeedService.SEED_DATA_PATH}")
            raise
        except json.JSONDecodeError as e:
            logger.error(f"Error parsing seed data JSON: {e}")
            raise
    
    @staticmethod
    def seed_user_spirit_types(db: Session, user_id: int, spirit_type_names: List[str]) -> Dict[str, int]:
        """
        Create default spirit types for a user.
        Returns a mapping of spirit type names to their database IDs.
        """
        spirit_type_map = {}
        
        for spirit_name in spirit_type_names:
            # Check if this spirit type already exists for the user
            existing = db.query(SpiritType).filter(
                SpiritType.name == spirit_name,
                SpiritType.user_id == user_id
            ).first()
            
            if existing:
                spirit_type_map[spirit_name] = existing.id
                logger.debug(f"Spirit type '{spirit_name}' already exists for user {user_id}")
            else:
                # Create new spirit type
                spirit_type = SpiritType(
                    name=spirit_name,
                    user_id=user_id
                )
                db.add(spirit_type)
                db.flush()  # Flush to get the ID without committing
                spirit_type_map[spirit_name] = spirit_type.id
                logger.debug(f"Created spirit type '{spirit_name}' for user {user_id}")
        
        return spirit_type_map
    
    @staticmethod
    def seed_user_recipes(
        db: Session,
        user_id: int,
        recipes_data: List[Dict],
        spirit_type_map: Dict[str, int]
    ) -> int:
        """
        Create default recipes for a user.
        Returns the number of recipes created.
        """
        recipes_created = 0
        
        for recipe_data in recipes_data:
            # Check if recipe already exists for user (by name)
            existing = db.query(Recipe).filter(
                Recipe.name == recipe_data['name'],
                Recipe.user_id == user_id
            ).first()
            
            if existing:
                logger.debug(f"Recipe '{recipe_data['name']}' already exists for user {user_id}")
                continue
            
            # Get spirit type objects for this recipe
            spirit_types = []
            for spirit_name in recipe_data.get('spirit_types', []):
                if spirit_name in spirit_type_map:
                    spirit_type = db.query(SpiritType).filter(
                        SpiritType.id == spirit_type_map[spirit_name]
                    ).first()
                    if spirit_type:
                        spirit_types.append(spirit_type)
                else:
                    logger.warning(f"Spirit type '{spirit_name}' not found in map for recipe '{recipe_data['name']}'")
            
            # Create the recipe
            recipe = Recipe(
                name=recipe_data['name'],
                instructions=recipe_data['instructions'],
                ingredients=recipe_data.get('ingredients', []),  # Already in dict format from JSON
                user_id=user_id,
                spirit_types=spirit_types
            )
            
            db.add(recipe)
            recipes_created += 1
            logger.debug(f"Created recipe '{recipe_data['name']}' for user {user_id}")
        
        return recipes_created
    
    @staticmethod
    def seed_user_data(db: Session, user_id: int) -> Dict[str, int]:
        """
        Seed a new user account with default spirit types and recipes.
        
        Args:
            db: Database session
            user_id: ID of the user to seed data for
            
        Returns:
            Dict with counts of created items: {'spirit_types': int, 'recipes': int}
        """
        try:
            logger.info(f"Starting data seeding for user {user_id}")
            
            # Load seed data
            seed_data = SeedService.load_seed_data()
            
            # Create spirit types
            spirit_type_names = seed_data.get('spirit_types', [])
            spirit_type_map = SeedService.seed_user_spirit_types(db, user_id, spirit_type_names)
            
            # Create recipes
            recipes_data = seed_data.get('recipes', [])
            recipes_created = SeedService.seed_user_recipes(db, user_id, recipes_data, spirit_type_map)
            
            # Commit all changes
            db.commit()
            
            result = {
                'spirit_types': len(spirit_type_map),
                'recipes': recipes_created
            }
            
            logger.info(f"Successfully seeded user {user_id} with {result['spirit_types']} spirit types and {result['recipes']} recipes")
            return result
            
        except Exception as e:
            logger.error(f"Error seeding data for user {user_id}: {e}")
            db.rollback()
            raise
    
    @staticmethod
    def is_user_seeded(db: Session, user_id: int) -> bool:
        """
        Check if a user has already been seeded with default data.
        A user is considered seeded if they have any recipes.
        """
        recipe_count = db.query(Recipe).filter(Recipe.user_id == user_id).count()
        return recipe_count > 0

