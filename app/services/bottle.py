import logging
from typing import Optional
from sqlalchemy.orm import Session
from app.db.models.bottle import Bottle
from app.db.models.spirit_type import SpiritType
from app.schemas.bottle import BottleCreate, BottleUpdate
from app.services.storage import get_storage_service, UploadResult

logger = logging.getLogger(__name__)


def _is_base64_data(data: str) -> bool:
    """Check if the string is base64 data (vs a URL)"""
    if not data:
        return False
    # Base64 data URLs start with "data:" or are raw base64
    return data.startswith('data:') or (
        not data.startswith('http://') and 
        not data.startswith('https://') and
        len(data) > 100  # Base64 data is typically much longer than URLs
    )


class BottleService:
    @staticmethod
    def _process_image(image_data: Optional[str], user_id: int) -> Optional[str]:
        """
        Process image data - upload to MinIO if it's base64, return URL otherwise.
        
        Args:
            image_data: Either base64 data or an existing URL
            user_id: User ID for organizing uploads
            
        Returns:
            MinIO URL if uploaded, original URL if already a URL, or None
        """
        if not image_data:
            return None
        
        # If it's already a URL (not base64), return as-is
        if not _is_base64_data(image_data):
            return image_data
        
        # Upload base64 data to MinIO
        try:
            storage = get_storage_service()
            result = storage.upload_image_from_base64(image_data, user_id)
            
            if result.success:
                logger.info(f"Uploaded image to MinIO: {result.url}")
                return result.url
            else:
                logger.error(f"Failed to upload image to MinIO: {result.error}")
                # Return None on failure - don't store base64 in DB
                return None
        except Exception as e:
            logger.error(f"Error processing image upload: {e}")
            return None
    
    @staticmethod
    def _cleanup_old_image(old_url: Optional[str]) -> None:
        """
        Delete old image from MinIO if it exists.
        
        Args:
            old_url: The URL of the old image to delete
        """
        if not old_url:
            return
        
        try:
            storage = get_storage_service()
            if storage.is_minio_url(old_url):
                object_name = storage.extract_object_name_from_url(old_url)
                if object_name:
                    storage.delete_image(object_name)
                    logger.info(f"Deleted old image from MinIO: {object_name}")
        except Exception as e:
            logger.error(f"Error cleaning up old image: {e}")
    
    @staticmethod
    def create_bottle(db: Session, bottle_in: BottleCreate, user_id: int) -> Bottle:
        spirit_type = db.query(SpiritType).filter(SpiritType.id == bottle_in.spirit_type_id, SpiritType.user_id == user_id).first()
        if not spirit_type:
            raise ValueError(f"Spirit type with ID {bottle_in.spirit_type_id} does not exist.")
        
        # Convert to dict and process image
        bottle_data = bottle_in.model_dump()
        
        # Process image - upload to MinIO if base64
        if bottle_data.get('image_url'):
            bottle_data['image_url'] = BottleService._process_image(
                bottle_data['image_url'], 
                user_id
            )
        
        bottle = Bottle(**bottle_data, user_id=user_id)
        db.add(bottle)
        db.commit()
        db.refresh(bottle)
        return bottle

    @staticmethod
    def get_bottles(db: Session, user_id: int, spirit_type_id: Optional[int] = None):
        bottles = db.query(Bottle).filter(Bottle.user_id == user_id).all()
        return bottles

    @staticmethod
    def get_bottle(db: Session, bottle_id: int, user_id: int = None):
        query = db.query(Bottle).filter(Bottle.id == bottle_id)
        if user_id is not None:
            query = query.filter(Bottle.user_id == user_id)
        return query.first()

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
        
        # Get update data
        update_data = bottle_in.model_dump(exclude_unset=True)
        
        # Process image update
        if 'image_url' in update_data and update_data['image_url']:
            new_image_url = BottleService._process_image(
                update_data['image_url'], 
                user_id
            )
            
            # If we successfully uploaded a new image, delete the old one
            if new_image_url and bottle.image_url:
                BottleService._cleanup_old_image(bottle.image_url)
            
            update_data['image_url'] = new_image_url
        
        # Update only provided fields
        for field, value in update_data.items():
            setattr(bottle, field, value)

        db.commit()
        db.refresh(bottle)
        return bottle

    @staticmethod
    def delete_bottle(db: Session, bottle_id: int, user_id: int):
        bottle = db.query(Bottle).filter(Bottle.id == bottle_id, Bottle.user_id == user_id).first()
        if bottle:
            # Clean up image from MinIO
            if bottle.image_url:
                BottleService._cleanup_old_image(bottle.image_url)
            
            db.delete(bottle)
            db.commit()
            return True
        return False
    
    @staticmethod
    def upload_bottle_image(image_base64: str, user_id: int) -> UploadResult:
        """
        Upload a bottle image to MinIO without associating it with a bottle yet.
        
        Useful for uploading images before creating/updating a bottle,
        or for the AI import flow.
        
        Args:
            image_base64: Base64 encoded image data
            user_id: User ID for organizing uploads
            
        Returns:
            UploadResult with success status, URL, and object name
        """
        storage = get_storage_service()
        return storage.upload_image_from_base64(image_base64, user_id)
