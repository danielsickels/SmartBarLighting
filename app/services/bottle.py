from sqlalchemy.orm import Session
from app.db.models.bottle import Bottle
from app.schemas.bottle import BottleCreate, BottleUpdate

class BottleService:
    @staticmethod
    def create_bottle(db: Session, bottle_in: BottleCreate):
        bottle = Bottle(**bottle_in.dict())
        db.add(bottle)
        db.commit()
        db.refresh(bottle)
        return bottle

    @staticmethod
    def get_bottles(db: Session, skip: int = 0, limit: int = 10):
        return db.query(Bottle).offset(skip).limit(limit).all()

    @staticmethod
    def get_bottle(db: Session, bottle_id: int):
        return db.query(Bottle).filter(Bottle.id == bottle_id).first()

    @staticmethod
    def update_bottle(db: Session, bottle_id: int, bottle_in: BottleUpdate):
        db_bottle = db.query(Bottle).filter(Bottle.id == bottle_id).first()
        if not db_bottle:
            return None
        for key, value in bottle_in.dict().items():
            setattr(db_bottle, key, value)
        db.commit()
        db.refresh(db_bottle)
        return db_bottle

    @staticmethod
    def delete_bottle(db: Session, bottle_id: int):
        db_bottle = db.query(Bottle).filter(Bottle.id == bottle_id).first()
        if db_bottle:
            db.delete(db_bottle)
            db.commit()
