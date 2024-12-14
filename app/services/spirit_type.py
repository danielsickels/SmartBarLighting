from sqlalchemy.orm import Session
from app.db.models.spirit_type import SpiritType
from app.schemas.spirit_type import SpiritTypeCreate

class SpiritTypeService:
    @staticmethod
    def create_spirit_type(db: Session, spirit_type_in: SpiritTypeCreate, user_id: int) -> SpiritType:
        spirit_type = SpiritType(**spirit_type_in.dict(), user_id=user_id)
        existing = db.query(SpiritType).filter(SpiritType.name.ilike(spirit_type_in.name), SpiritType.user_id == user_id).first()
        if existing:
            raise ValueError(f"Spirit type '{spirit_type_in.name}' already exists.")
        db.add(spirit_type)
        db.commit()
        db.refresh(spirit_type)
        return spirit_type

    @staticmethod
    def get_spirit_types(db: Session, user_id: int = None):
        query = db.query(SpiritType)
        if user_id:
            query = query.filter(SpiritType.user_id == user_id)
        return query.all()

    @staticmethod
    def get_spirit_type(db: Session, spirit_type_id: int, user_id: int):
        return db.query(SpiritType).filter(SpiritType.id == spirit_type_id, SpiritType.user_id == user_id).first()

    @staticmethod
    def update_spirit_type(db: Session, spirit_type_id: int, name: str, user_id: int):
        print(f"Attempting to update SpiritType ID {spirit_type_id} to name '{name}'")  # Debug log
        spirit_type = db.query(SpiritType).filter(SpiritType.id == spirit_type_id, SpiritType.user_id == user_id).first()
        if not spirit_type:
            raise ValueError(f"Spirit type with ID {spirit_type_id} does not exist.")

        existing = db.query(SpiritType).filter(SpiritType.name.ilike(name), SpiritType.id != spirit_type_id, SpiritType.user_id == user_id).first()
        if existing:
            raise ValueError(f"Spirit type '{name}' already exists.")

        spirit_type.name = name
        db.commit()
        db.refresh(spirit_type)  # Refresh the object with the updated state from the database

        print(f"Successfully updated SpiritType ID {spirit_type_id} to name '{name}'")  # Debug log
        return spirit_type

    @staticmethod
    def delete_spirit_type(db: Session, spirit_type_id: int, user_id: int) -> bool:
        spirit_type = db.query(SpiritType).filter(SpiritType.id == spirit_type_id, SpiritType.user_id == user_id).first()
        if spirit_type:
            db.delete(spirit_type)
            db.commit()
            return True
        return False
