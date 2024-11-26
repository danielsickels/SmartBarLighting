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
    def get_bottles(db: Session, skip: int = 0, limit: int = 25):
        return db.query(Bottle).offset(skip).limit(limit).all()

    @staticmethod
    def get_bottle(db: Session, bottle_id: int):
        return db.query(Bottle).filter(Bottle.id == bottle_id).first()

    @staticmethod
    def get_bottle_by_name(db: Session, name: str):
        return db.query(Bottle).filter(Bottle.name.ilike(f"%{name}%")).first()

    @staticmethod
    def update_bottle(db: Session, bottle_id: int, bottle_in: BottleUpdate):
        bottle = db.query(Bottle).filter(Bottle.id == bottle_id).first()
        if not bottle:
            return None
        for field, value in bottle_in.dict(exclude_unset=True).items():
            setattr(bottle, field, value)
        db.commit()
        db.refresh(bottle)
        return bottle

    @staticmethod
    def delete_bottle(db: Session, bottle_id: int):
        bottle = db.query(Bottle).filter(Bottle.id == bottle_id).first()
        if bottle:
            db.delete(bottle)
            db.commit()
            return True
        return False
