from sqlalchemy import Column, Integer, String, Table, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base  # This defines the base for all models.

# Association table for many-to-many relationship between recipes and bottles.
recipe_bottle = Table(
    "recipe_bottle",  # Table name in the database
    Base.metadata,  # Links it to the database metadata
    Column("recipe_id", Integer, ForeignKey("recipes.id"), primary_key=True),
    Column("bottle_id", Integer, ForeignKey("bottles.id"), primary_key=True),
)

# Recipe model
class Recipe(Base):
    __tablename__ = "recipes"  # Table name in the database

    id = Column(Integer, primary_key=True, index=True)  # Primary key
    name = Column(String, nullable=False)  # Recipe name
    instructions = Column(String, nullable=False)  # Recipe instructions
    ingredients = Column(String, nullable=True)  # Optional list of ingredients

    # Many-to-many relationship with bottles
    bottles = relationship("Bottle", secondary=recipe_bottle, back_populates="recipes")
