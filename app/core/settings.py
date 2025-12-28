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

    class Config:
        env_file = "./app/.env"
        case_sensitive = True


settings = Settings()
