import os
from typing import List, Optional
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "ScamShield AI"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    
    # Database
    DATABASE_URL: str = "sqlite:///./scamshield.db"
    
    # Authentication & Security
    JWT_SECRET_KEY: str = "scamshield-insecure-dev-secret-key-change-in-production-32chars"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    COOKIE_NAME: str = "scamshield_access_token"
    COOKIE_SECURE: bool = False
    COOKIE_SAMESITE: str = "lax"
    
    # CORS
    FRONTEND_ORIGIN: str = "http://localhost:5173"
    ALLOWED_ORIGINS: List[str] = ["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"]
    
    # Rate Limiting
    RATE_LIMIT_AUTH_PER_MINUTE: int = 15
    RATE_LIMIT_SCAN_PER_MINUTE: int = 30
    
    # Optional AI Explanations
    GROQ_API_KEY: Optional[str] = None
    GROQ_MODEL: str = "llama-3.3-70b-versatile"
    
    model_config = {
        "env_file": ".env",
        "extra": "ignore"
    }

settings = Settings()
