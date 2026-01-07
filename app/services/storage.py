"""
MinIO Object Storage Service for handling bottle image uploads.

This service manages file uploads to MinIO, generates unique object names,
and provides URLs for accessing stored images.
"""
import logging
import uuid
import base64
from io import BytesIO
from typing import Optional, Tuple
from dataclasses import dataclass
from minio import Minio
from minio.error import S3Error

from app.core.settings import settings

logger = logging.getLogger(__name__)


@dataclass
class UploadResult:
    """Result of an image upload operation"""
    success: bool
    object_name: Optional[str] = None
    url: Optional[str] = None
    error: Optional[str] = None


class StorageService:
    """Service for handling MinIO object storage operations"""
    
    def __init__(self):
        """Initialize the MinIO client and ensure bucket exists"""
        self.client = Minio(
            endpoint=settings.MINIO_ENDPOINT,
            access_key=settings.MINIO_ACCESS_KEY,
            secret_key=settings.MINIO_SECRET_KEY,
            secure=settings.MINIO_SECURE
        )
        self.bucket_name = settings.MINIO_BUCKET_NAME
        self._ensure_bucket_exists()
        logger.info(f"Initialized MinIO storage service with bucket: {self.bucket_name}")
    
    def _ensure_bucket_exists(self) -> None:
        """Create the bucket if it doesn't exist and set public read policy"""
        try:
            if not self.client.bucket_exists(self.bucket_name):
                self.client.make_bucket(self.bucket_name)
                logger.info(f"Created bucket: {self.bucket_name}")
                
                # Set bucket policy to allow public read access for images
                policy = {
                    "Version": "2012-10-17",
                    "Statement": [
                        {
                            "Effect": "Allow",
                            "Principal": {"AWS": "*"},
                            "Action": ["s3:GetObject"],
                            "Resource": [f"arn:aws:s3:::{self.bucket_name}/*"]
                        }
                    ]
                }
                import json
                self.client.set_bucket_policy(self.bucket_name, json.dumps(policy))
                logger.info(f"Set public read policy on bucket: {self.bucket_name}")
        except S3Error as e:
            logger.error(f"Error ensuring bucket exists: {e}")
            raise
    
    def _generate_object_name(self, user_id: int, file_extension: str = "jpg") -> str:
        """
        Generate a unique object name for the uploaded file.
        
        Format: bottles/{user_id}/{uuid}.{extension}
        """
        unique_id = uuid.uuid4().hex
        return f"bottles/{user_id}/{unique_id}.{file_extension}"
    
    def _detect_image_type(self, data: bytes) -> str:
        """Detect image type from magic bytes"""
        if data[:8] == b'\x89PNG\r\n\x1a\n':
            return 'png'
        elif data[:2] == b'\xff\xd8':
            return 'jpg'
        elif data[:6] in (b'GIF87a', b'GIF89a'):
            return 'gif'
        elif data[:4] == b'RIFF' and data[8:12] == b'WEBP':
            return 'webp'
        return 'jpg'  # Default to jpg
    
    def _get_content_type(self, extension: str) -> str:
        """Get MIME type for file extension"""
        content_types = {
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'gif': 'image/gif',
            'webp': 'image/webp'
        }
        return content_types.get(extension.lower(), 'image/jpeg')
    
    def get_public_url(self, object_name: str) -> str:
        """
        Get the public URL for an object.
        
        Uses MINIO_PUBLIC_URL if configured, otherwise constructs from endpoint.
        """
        if settings.MINIO_PUBLIC_URL:
            base_url = settings.MINIO_PUBLIC_URL.rstrip('/')
            return f"{base_url}/{self.bucket_name}/{object_name}"
        
        protocol = "https" if settings.MINIO_SECURE else "http"
        return f"{protocol}://{settings.MINIO_ENDPOINT}/{self.bucket_name}/{object_name}"
    
    def upload_image_from_base64(
        self, 
        base64_data: str, 
        user_id: int
    ) -> UploadResult:
        """
        Upload an image from base64 encoded data.
        
        Args:
            base64_data: Base64 encoded image data (with or without data URL prefix)
            user_id: ID of the user uploading the image
            
        Returns:
            UploadResult with success status, object name, and public URL
        """
        try:
            # Handle data URL format (e.g., "data:image/jpeg;base64,...")
            if ',' in base64_data:
                # Extract content type from data URL if present
                header, base64_data = base64_data.split(',', 1)
            
            # Decode base64 data
            image_data = base64.b64decode(base64_data)
            
            # Detect image type and generate object name
            file_extension = self._detect_image_type(image_data)
            object_name = self._generate_object_name(user_id, file_extension)
            content_type = self._get_content_type(file_extension)
            
            # Upload to MinIO
            data_stream = BytesIO(image_data)
            self.client.put_object(
                bucket_name=self.bucket_name,
                object_name=object_name,
                data=data_stream,
                length=len(image_data),
                content_type=content_type
            )
            
            url = self.get_public_url(object_name)
            logger.info(f"Uploaded image: {object_name} for user {user_id}")
            
            return UploadResult(
                success=True,
                object_name=object_name,
                url=url
            )
            
        except Exception as e:
            logger.error(f"Error uploading image: {e}")
            return UploadResult(
                success=False,
                error=str(e)
            )
    
    def upload_image_from_bytes(
        self,
        image_data: bytes,
        user_id: int,
        file_extension: Optional[str] = None
    ) -> UploadResult:
        """
        Upload an image from raw bytes.
        
        Args:
            image_data: Raw image bytes
            user_id: ID of the user uploading the image
            file_extension: Optional file extension (auto-detected if not provided)
            
        Returns:
            UploadResult with success status, object name, and public URL
        """
        try:
            if not file_extension:
                file_extension = self._detect_image_type(image_data)
            
            object_name = self._generate_object_name(user_id, file_extension)
            content_type = self._get_content_type(file_extension)
            
            data_stream = BytesIO(image_data)
            self.client.put_object(
                bucket_name=self.bucket_name,
                object_name=object_name,
                data=data_stream,
                length=len(image_data),
                content_type=content_type
            )
            
            url = self.get_public_url(object_name)
            logger.info(f"Uploaded image: {object_name} for user {user_id}")
            
            return UploadResult(
                success=True,
                object_name=object_name,
                url=url
            )
            
        except Exception as e:
            logger.error(f"Error uploading image: {e}")
            return UploadResult(
                success=False,
                error=str(e)
            )
    
    def delete_image(self, object_name: str) -> bool:
        """
        Delete an image from storage.
        
        Args:
            object_name: The object name/path in the bucket
            
        Returns:
            True if deleted successfully, False otherwise
        """
        try:
            self.client.remove_object(self.bucket_name, object_name)
            logger.info(f"Deleted image: {object_name}")
            return True
        except S3Error as e:
            logger.error(f"Error deleting image {object_name}: {e}")
            return False
    
    def image_exists(self, object_name: str) -> bool:
        """
        Check if an image exists in storage.
        
        Args:
            object_name: The object name/path in the bucket
            
        Returns:
            True if exists, False otherwise
        """
        try:
            self.client.stat_object(self.bucket_name, object_name)
            return True
        except S3Error:
            return False
    
    def is_minio_url(self, url: str) -> bool:
        """
        Check if a URL is a MinIO URL (vs base64 data or external URL).
        
        Args:
            url: The URL to check
            
        Returns:
            True if it's a MinIO URL from this service
        """
        if not url:
            return False
        
        # Check if it's a base64 data URL
        if url.startswith('data:'):
            return False
        
        # Check if it contains our bucket name
        return self.bucket_name in url
    
    def extract_object_name_from_url(self, url: str) -> Optional[str]:
        """
        Extract the object name from a MinIO URL.
        
        Args:
            url: The full MinIO URL
            
        Returns:
            The object name/path, or None if not a valid MinIO URL
        """
        if not self.is_minio_url(url):
            return None
        
        try:
            # URL format: protocol://endpoint/bucket/object_name
            # Find the bucket name in the URL and extract everything after it
            bucket_start = url.find(f"/{self.bucket_name}/")
            if bucket_start == -1:
                return None
            
            return url[bucket_start + len(self.bucket_name) + 2:]
        except Exception:
            return None


# Lazy initialization to allow app to start without MinIO connection
_storage_service: Optional[StorageService] = None


def get_storage_service() -> StorageService:
    """
    Get the singleton storage service instance.
    
    Initializes the service on first call (lazy loading).
    """
    global _storage_service
    if _storage_service is None:
        _storage_service = StorageService()
    return _storage_service

