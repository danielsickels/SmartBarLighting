from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str
    
    # Security / JWT
    SECRET_KEY: str
    H_ALGORITHM: str
    
    # URLs
    BACKEND_URL: str
    FRONTEND_URL: str
    
    # Ollama AI Configuration
    OLLAMA_HOST: str
    OLLAMA_MODEL: str

    class Config:
        env_file = "./app/.env"
        case_sensitive = True


settings = Settings()
