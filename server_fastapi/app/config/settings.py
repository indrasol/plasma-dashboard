import os
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field, AliasChoices
from typing import Optional

class Settings(BaseSettings):
    # Application Settings
    PORT: int = 8000
    ENV: str = "development"

    # Supabase Settings (tries _P suffix first, then falls back to original)
    SUPABASE_URL: str = Field(validation_alias=AliasChoices('SUPABASE_URL_P', 'SUPABASE_URL'))
    SUPABASE_SERVICE_ROLE_KEY: str = Field(validation_alias=AliasChoices('SUPABASE_SERVICE_ROLE_KEY_P', 'SUPABASE_SERVICE_ROLE_KEY'))
    SUPABASE_ANON_KEY: Optional[str] = Field(default=None, validation_alias=AliasChoices('SUPABASE_ANON_KEY_P', 'SUPABASE_ANON_KEY'))

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
SUPABASE_ANON_KEY = settings.SUPABASE_ANON_KEY
