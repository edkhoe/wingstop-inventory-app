# This code creates a FastAPI web application for a Wingstop inventory management system

# Import required FastAPI components
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import all_routers
from app.core.database import init_database, check_database_health
from app.core.config import settings, config_manager
from app.core.middleware import setup_middleware
from app.core.security import setup_security_middleware, SecurityConfig
from app.core.logging import get_logger

# Initialize the FastAPI application with metadata
app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Inventory management system for Wingstop locations",
    version=settings.VERSION,
    debug=settings.DEBUG
)

# Configure CORS (Cross-Origin Resource Sharing) middleware
# CORS is NOT the same as sending API requests - it's a security mechanism that controls
# which domains can make requests to your API. Without CORS, browsers block requests
# from different origins (domains, ports, or protocols) for security reasons.
# This middleware allows the frontend (React app) to communicate with this backend API
# Configure CORS using environment-specific settings
cors_config = SecurityConfig.get_cors_config()
app.add_middleware(
    CORSMiddleware,
    **cors_config
)

# Register all routers under /api/v1
for router in all_routers:
    app.include_router(router, prefix="/api/v1")

# Define a root endpoint that returns API information
@app.get("/")
async def root():
    return {"message": "Wingstop Inventory API"}

# Define a health check endpoint for monitoring API status
@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# Database health check endpoint
@app.get("/health/db")
async def database_health_check():
    return check_database_health()

# Setup middleware (must be after all routes and routers are registered)
setup_middleware(app)
setup_security_middleware(app)

# Entry point to run the application server
if __name__ == "__main__":
    import uvicorn
    
    logger = get_logger(__name__)
    
    # Initialize database on startup
    try:
        init_database()
        logger.info("Database initialized successfully")
    except Exception as e:
        logger.error(f"Database initialization failed: {e}")
        # Continue running the app even if DB init fails
    
    logger.info(f"Starting server on {settings.HOST}:{settings.PORT}")
    uvicorn.run(app, host=settings.HOST, port=settings.PORT) 