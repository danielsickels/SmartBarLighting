from sqlalchemy import Column, Integer, String
from app.db.base import Base

class Bottle(Base):
    __tablename__ = "bottles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    material = Column(String)
    capacity_ml = Column(Integer)
