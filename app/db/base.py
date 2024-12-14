from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

# Import models here to avoid circular imports
# def import_models():
#     from app.db.models.bottle import Bottle
#     from app.db.models.recipe import Recipe
#     from app.db.models.spirit_type import SpiritType
#     from app.db.models.shared_table import recipes_to_spirits
#     from app.db.models.user import User
    # Add other models if needed

