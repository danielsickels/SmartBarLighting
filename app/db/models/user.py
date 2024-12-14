from sqlalchemy import Column, Integer, String
from app.db.base import Base
from sqlalchemy.orm import relationship

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    is_admin = Column(Integer, default=0) 

    bottles = relationship("Bottle", back_populates="user")
    recipes = relationship("Recipe", back_populates="user")
    spirit_types = relationship("SpiritType", back_populates="user")
