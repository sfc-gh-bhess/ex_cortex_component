"""
Main FastAPI application module.
"""
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .auth import router as auth_router
from .agent import router as agent_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

# Create FastAPI application
app = FastAPI(
    title="Cortex Agent API",
    description="Backend proxy for Snowflake Cortex Agent interactions",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router)
app.include_router(agent_router)


@app.get("/")
async def root():
    """Root endpoint"""
    logger.info("Root endpoint accessed")
    return {
        "message": "Cortex Agent API",
        "status": "running"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "version": "1.0.0"
    }

