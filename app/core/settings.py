from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./bottles.db"
    SECRET_KEY: str = "supersecretkey"
    BACKEND_URL: str = "http://localhost:8000"  # Default value for BACKEND_URL
    FRONTEND_URL: str = "http://localhost:3000"  # Default value for FRONTEND_URL
    H_ALGORITHM: str = "HS256"  # Default value for H_ALGORITHM

    class Config:
        env_file = "./app/.env"
        case_sensitive = True

settings = Settings()
