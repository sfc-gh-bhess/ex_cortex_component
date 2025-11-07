"""
Authentication module for user login, logout, and session management.
"""
import logging
from fastapi import APIRouter, HTTPException, Response, Cookie, Depends
from pydantic import BaseModel
from typing import Optional
from itsdangerous import URLSafeTimedSerializer, BadSignature, SignatureExpired
from .config import settings
from .snowflake_client import authenticate_user

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/auth", tags=["authentication"])

# Session serializer for signed cookies
serializer = URLSafeTimedSerializer(settings.SESSION_SECRET_KEY)


class LoginRequest(BaseModel):
    """Login request body"""
    username: str
    password: str


class LoginResponse(BaseModel):
    """Login response"""
    success: bool
    username: Optional[str] = None
    message: Optional[str] = None


def create_session_cookie(username: str) -> str:
    """
    Create a signed session cookie value.
    
    Args:
        username: The username to encode in the cookie
        
    Returns:
        Signed cookie value
    """
    return serializer.dumps({"username": username})


def verify_session_cookie(cookie_value: str) -> Optional[str]:
    """
    Verify and decode a session cookie.
    
    Args:
        cookie_value: The signed cookie value
        
    Returns:
        Username if valid, None otherwise
    """
    try:
        data = serializer.loads(cookie_value, max_age=settings.SESSION_MAX_AGE)
        return data.get("username")
    except (BadSignature, SignatureExpired):
        return None


def get_current_user(
    session: Optional[str] = Cookie(None, alias=settings.SESSION_COOKIE_NAME)
) -> str:
    """
    Dependency to get the current authenticated user from session cookie.
    
    Args:
        session: Session cookie value
        
    Returns:
        Username of authenticated user
        
    Raises:
        HTTPException: If not authenticated
    """
    if not session:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    username = verify_session_cookie(session)
    if not username:
        raise HTTPException(status_code=401, detail="Invalid or expired session")
    
    return username


@router.post("/login", response_model=LoginResponse)
async def login(request: LoginRequest, response: Response):
    """
    Authenticate a user and create a session.
    
    Args:
        request: Login credentials
        response: FastAPI response object to set cookies
        
    Returns:
        Login response with success status
    """
    logger.info(f"Login attempt for user: {request.username}")
    user = await authenticate_user(request.username, request.password)
    
    if user:
        # Create session cookie
        cookie_value = create_session_cookie(user["username"])
        response.set_cookie(
            key=settings.SESSION_COOKIE_NAME,
            value=cookie_value,
            max_age=settings.SESSION_MAX_AGE,
            httponly=True,
            samesite="lax"
        )
        
        logger.info(f"Login successful for user: {user['username']}")
        return LoginResponse(
            success=True,
            username=user["username"],
            message="Login successful"
        )
    else:
        logger.warning(f"Login failed for user: {request.username}")
        raise HTTPException(
            status_code=401,
            detail="Invalid username or password"
        )


@router.post("/logout")
async def logout(response: Response):
    """
    Log out the user by clearing the session cookie.
    
    Args:
        response: FastAPI response object to clear cookies
        
    Returns:
        Success message
    """
    response.delete_cookie(key=settings.SESSION_COOKIE_NAME)
    return {"success": True, "message": "Logged out successfully"}


@router.get("/me")
async def get_current_user_info(username: str = Depends(get_current_user)):
    """
    Get information about the currently authenticated user.
    
    Args:
        username: Current user from dependency
        
    Returns:
        User information
    """
    return {"username": username}

