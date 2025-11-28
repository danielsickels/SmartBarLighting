from typing import Optional
from sqlalchemy.orm import Session
from app.db.models.bottle import Bottle
from app.db.models.spirit_type import SpiritType
from app.schemas.bottle import BottleCreate, BottleUpdate

class BottleService:
    @staticmethod
    def create_bottle(db: Session, bottle_in: BottleCreate, user_id: int) -> Bottle:
        spirit_type = db.query(SpiritType).filter(SpiritType.id == bottle_in.spirit_type_id, SpiritType.user_id == user_id).first()
        if not spirit_type:
            raise ValueError(f"Spirit type with ID {bottle_in.spirit_type_id} does not exist.")
        
        bottle = Bottle(**bottle_in.dict(), user_id=user_id)
        db.add(bottle)
        db.commit()
        db.refresh(bottle)
        return bottle

    @staticmethod
    def get_bottles(db: Session, user_id: int, spirit_type_id: Optional[int] = None):
        bottles = db.query(Bottle).filter(Bottle.user_id == user_id).all()
        return bottles

    @staticmethod
    def get_bottle(db: Session, bottle_id: int, user_id: int):
        return db.query(Bottle).filter(Bottle.id == bottle_id, Bottle.user_id == user_id).first()

    @staticmethod
    def update_bottle(db: Session, bottle_id: int, bottle_in: BottleUpdate, user_id: int):
        bottle = db.query(Bottle).filter(Bottle.id == bottle_id, Bottle.user_id == user_id).first()
        if not bottle:
            return None
        
        # Validate spirit_type_id if being updated
        if bottle_in.spirit_type_id is not None:
            spirit_type = db.query(SpiritType).filter(
                SpiritType.id == bottle_in.spirit_type_id, 
                SpiritType.user_id == user_id
            ).first()
            if not spirit_type:
                raise ValueError(f"Spirit type with ID {bottle_in.spirit_type_id} does not exist.")
        
        # Update only provided fields
        for field, value in bottle_in.dict(exclude_unset=True).items():
            setattr(bottle, field, value)

        db.commit()
        db.refresh(bottle)
        return bottle

    @staticmethod
    def delete_bottle(db: Session, bottle_id: int, user_id: int):
        bottle = db.query(Bottle).filter(Bottle.id == bottle_id, Bottle.user_id == user_id).first()
        if bottle:
            db.delete(bottle)
            db.commit()
            return True
        return False
