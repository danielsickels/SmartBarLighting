from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base
from app.db.models.shared_table import recipes_to_spirits

class SpiritType(Base):
    __tablename__ = "spirit_types"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, unique=True)

    # Relationships
    recipes = relationship(
        "Recipe",
        secondary=recipes_to_spirits,
        back_populates="spirit_types",
    )

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    user = relationship("User", back_populates="spirit_types")
