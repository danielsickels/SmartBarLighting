from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base

class Bottle(Base):
    __tablename__ = "bottles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    brand = Column(String, nullable=True)
    flavor_profile = Column(String, nullable=True)
    capacity_ml = Column(Integer, nullable=True)

    spirit_type_id = Column(Integer, ForeignKey("spirit_types.id"), nullable=True)
    spirit_type = relationship("SpiritType")

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    user = relationship("User", back_populates="bottles")
