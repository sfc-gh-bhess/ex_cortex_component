"""
Configuration module for the Cortex Agent application.
Loads environment variables and provides application settings.
"""
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()


class Settings:
    """Application settings loaded from environment variables."""
    
    # Snowflake Cortex API Configuration
    SNOWFLAKE_PAT_TOKEN: str = os.getenv("SNOWFLAKE_PAT_TOKEN", "")
    SNOWFLAKE_AGENT_API_ENDPOINT: str = os.getenv("SNOWFLAKE_AGENT_API_ENDPOINT", "")
    SNOWFLAKE_SQL_API_ENDPOINT: str = os.getenv("SNOWFLAKE_SQL_API_ENDPOINT", "")
    
    # Response filtering
    REMOVE_SQL_FROM_RESPONSE: bool = os.getenv("REMOVE_SQL_FROM_RESPONSE", "false").lower() == "true"
    
    # Session management
    SESSION_SECRET_KEY: str = os.getenv("SESSION_SECRET_KEY", "change-me-in-production")
    SESSION_COOKIE_NAME: str = "cortex_agent_session"
    SESSION_MAX_AGE: int = 86400  # 24 hours
    
    # Snowflake authentication database connection
    SNOWFLAKE_DATABASE: str = os.getenv("SNOWFLAKE_DATABASE", "")
    SNOWFLAKE_SCHEMA: str = os.getenv("SNOWFLAKE_SCHEMA", "")
    SNOWFLAKE_WAREHOUSE: str = os.getenv("SNOWFLAKE_WAREHOUSE", "")
    
    # CORS settings
    CORS_ORIGINS: list = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:5173").split(",")


# Create settings instance
settings = Settings()

