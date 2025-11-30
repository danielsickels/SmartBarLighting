from sqlalchemy import Column, Integer, String, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.db.base import Base
from app.db.models.shared_table import recipes_to_spirits

class Recipe(Base):
    __tablename__ = "recipes"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    instructions = Column(String, nullable=False)
    ingredients = Column(JSON, nullable=True)  # Structured JSON for ingredients

    # Many-to-many relationship with SpiritType
    spirit_types = relationship(
        "SpiritType",
        secondary=recipes_to_spirits,
        back_populates="recipes",
    )

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    user = relationship("User", back_populates="recipes")