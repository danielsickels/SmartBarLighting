from sqlalchemy import Table, Column, Integer, ForeignKey
from app.db.base import Base

# Define the shared association table
recipes_to_spirits = Table(
    "recipes_to_spirits",
    Base.metadata,
    Column("spirit_type_id", Integer, ForeignKey("spirit_types.id"), primary_key=True),
    Column("recipe_id", Integer, ForeignKey("recipes.id"), primary_key=True),
)
