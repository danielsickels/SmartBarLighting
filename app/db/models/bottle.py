# app/db/models/bottle.py

from sqlalchemy import Column, Integer, String
from app.db.base import Base

class Bottle(Base):
    __tablename__ = "bottles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    brand = Column(String, nullable=True)  # New field for brand
    flavor_profile = Column(String, nullable=True)  # New field for flavor profile
    material = Column(String, nullable=True)
    capacity_ml = Column(Integer, nullable=True)
