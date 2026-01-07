from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str
    
    # Security / JWT
    SECRET_KEY: str
    H_ALGORITHM: str
    
    # URLs (optional - production URLs are hardcoded in CORS)
    BACKEND_URL: str | None = None
    FRONTEND_URL: str | None = None
    
    # Ollama AI Configuration
    OLLAMA_HOST: str
    OLLAMA_MODEL: str
    
    # MinIO Object Storage Configuration
    MINIO_ENDPOINT: str  # e.g., "localhost:9000" or "minio.example.com"
    MINIO_ACCESS_KEY: str
    MINIO_SECRET_KEY: str
    MINIO_BUCKET_NAME: str = "bottle-images"
    MINIO_SECURE: bool = False  # Set to True for HTTPS
    MINIO_PUBLIC_URL: str | None = None  # Public URL for accessing images (optional, for CDN/proxy)

    class Config:
        env_file = "./app/.env"
        case_sensitive = True


settings = Settings()
