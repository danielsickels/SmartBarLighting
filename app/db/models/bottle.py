from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.db.base import Base
from app.db.models.recipe import recipe_bottle

class Bottle(Base):
    __tablename__ = "bottles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)  # Added index for faster lookups
    brand = Column(String, nullable=True)  # Brand of the bottle
    flavor_profile = Column(String, nullable=True)  # Flavor profile (e.g., sweet, bitter)
    spirit_type = Column(String, nullable=True)  # Updated field to classify types (e.g., whiskey, vodka)
    capacity_ml = Column(Integer, nullable=True)  # Capacity in milliliters

    # Relationship to recipes through the association table
    recipes = relationship(
        "Recipe",
        secondary=recipe_bottle,
        back_populates="bottles"
    )

    def __repr__(self):
        return (
            f"<Bottle(id={self.id}, name='{self.name}', brand='{self.brand}', "
            f"spirit_type='{self.spirit_type}', flavor_profile='{self.flavor_profile}', "
            f"capacity_ml={self.capacity_ml})>"
        )
