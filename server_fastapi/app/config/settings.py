import os
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    # Application Settings
    PORT: int = 8000
    ENV: str = "development"

    # Supabase Settings
    SUPABASE_URL: str
    SUPABASE_SERVICE_ROLE_KEY: str
    # Or explicitly look for SUPABASE_ANON_KEY
    SUPABASE_ANON_KEY: Optional[str] = None

    # External Services
    EXTERNAL_API_URL: str = 'https://donor-lookalike-api.onrender.com'

    # Path Configuration
    # We are in server_fastapi/app/config/settings.py
    # .env is in project root: ../../../.env
    model_config = SettingsConfigDict(
        env_file=str(Path(__file__).resolve().parent.parent.parent.parent / '.env'),
        env_file_encoding='utf-8',
        case_sensitive=True,
        extra='ignore'
    )

# Instantiate settings
settings = Settings()

# Export specific variables
SUPABASE_URL = settings.SUPABASE_URL
SUPABASE_SERVICE_KEY = settings.SUPABASE_SERVICE_ROLE_KEY
# Use SUPABASE_ANON_KEY if SUPABASE_API_KEY is not set (based on your .env)
SUPABASE_ANON_KEY = settings.SUPABASE_ANON_KEY
