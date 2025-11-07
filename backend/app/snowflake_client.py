"""
Snowflake client module for database connections and API requests.
"""
import snowflake.connector
from snowflake.connector import DictCursor
from typing import Optional, Dict, Any
import httpx
from .config import settings
import logging

logger = logging.getLogger(__name__)

async def authenticate_user(username: str, password: str) -> Optional[Dict[str, Any]]:
    """
    Authenticate a user against the Snowflake users table.
    
    Args:
        username: The username to authenticate
        password: The password to check
        
    Returns:
        User dictionary if authentication successful, None otherwise
    """
    logger.info(f"Authenticating user {username} with password {password}")
    try:
        query = f"SELECT userid FROM {settings.SNOWFLAKE_DATABASE}.{settings.SNOWFLAKE_SCHEMA}.users WHERE userid = '{username}' AND password = '{password}'"
        
        payload = {
            "statement": query,
            "warehouse": settings.SNOWFLAKE_WAREHOUSE,
        }
        
        async with httpx.AsyncClient(timeout=60.0) as client:
            sf_response = await client.post(
                f"{settings.SNOWFLAKE_SQL_API_ENDPOINT}",
                headers=get_snowflake_api_headers(),
                json=payload
            )
            
            result = sf_response.json()
            
            # Check if user was found
            if result.get("data") and len(result["data"]) == 1:
                return {"username": username}
        
        return None
        
    except Exception as e:
        print(f"Authentication error: {e}")
        return None


def get_snowflake_api_headers() -> Dict[str, str]:
    """
    Get headers for Cortex API requests with PAT token authentication.
    
    Returns:
        Dictionary of headers for API requests
    """
    return {
        "Authorization": f"Bearer {settings.SNOWFLAKE_PAT_TOKEN}",
        "Content-Type": "application/json",
    }

def get_cortex_api_headers() -> Dict[str, str]:
    """
    Get headers for Cortex API requests with PAT token authentication.
    
    Returns:
        Dictionary of headers for API requests
    """
    headers = get_snowflake_api_headers()
    headers["Accept"] = "text/event-stream"
    return headers


def create_http_client() -> httpx.AsyncClient:
    """
    Create an async HTTP client configured for Cortex API requests.
    
    Returns:
        Configured httpx.AsyncClient instance
    """
    return httpx.AsyncClient(
        headers=get_cortex_api_headers(),
        timeout=300.0  # 5 minute timeout for long-running agent queries
    )

