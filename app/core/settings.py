from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./bottles.db"
    SECRET_KEY: str = "supersecretkey"

    class Config:
        case_sensitive = True

settings = Settings()
