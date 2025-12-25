from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./bottles.db"
    SECRET_KEY: str = "supersecretkey"
    BACKEND_URL: str = "http://localhost:8000"  # Default value for BACKEND_URL
    FRONTEND_URL: str = "http://localhost:3000"  # Default value for FRONTEND_URL
    H_ALGORITHM: str = "HS256"  # Default value for H_ALGORITHM
    
    # Ollama configuration for bottle image analysis
    # Use host.docker.internal to access Ollama running on host from Docker container
    # Override with OLLAMA_HOST env var if needed (e.g., http://localhost:11434 for non-Docker)
    OLLAMA_HOST: str = "http://host.docker.internal:11434"
    OLLAMA_MODEL: str = "ministral-3"

    class Config:
        env_file = "./app/.env"
        case_sensitive = True

settings = Settings()
