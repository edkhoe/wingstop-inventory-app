import time
import uuid
from typing import Callable
from fastapi import Request, Response
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp
from sqlalchemy.exc import SQLAlchemyError
from pydantic import ValidationError as PydanticValidationError

from .logging import get_logger, set_correlation_id, get_correlation_id, log_with_context
from .exceptions import BaseAppException, convert_to_http_exception
from .config import settings

logger = get_logger(__name__)


class CorrelationMiddleware(BaseHTTPMiddleware):
    """Middleware to add correlation IDs to requests."""
    
    def __init__(self, app: ASGIApp):
        super().__init__(app)
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Generate correlation ID for this request
        correlation_id = str(uuid.uuid4())
        set_correlation_id(correlation_id)
        
        # Add correlation ID to request headers
        request.state.correlation_id = correlation_id
        
        # Add correlation ID to response headers
        response = await call_next(request)
        response.headers["X-Correlation-ID"] = correlation_id
        
        return response


class LoggingMiddleware(BaseHTTPMiddleware):
    """Middleware to log request and response information."""
    
    def __init__(self, app: ASGIApp):
        super().__init__(app)
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Start timing
        start_time = time.time()
        
        # Log request
        log_with_context(
            logger,
            "info",
            "Request started",
            method=request.method,
            url=str(request.url),
            client_ip=request.client.host if request.client else None,
            user_agent=request.headers.get("user-agent"),
            correlation_id=get_correlation_id()
        )
        
        # Process request
        try:
            response = await call_next(request)
            
            # Calculate duration
            duration = time.time() - start_time
            
            # Log response
            log_with_context(
                logger,
                "info",
                "Request completed",
                method=request.method,
                url=str(request.url),
                status_code=response.status_code,
                duration=duration,
                correlation_id=get_correlation_id()
            )
            
            return response
            
        except Exception as e:
            # Calculate duration
            duration = time.time() - start_time
            
            # Log error
            log_with_context(
                logger,
                "error",
                "Request failed",
                method=request.method,
                url=str(request.url),
                error=str(e),
                duration=duration,
                correlation_id=get_correlation_id()
            )
            
            raise


class ErrorHandlingMiddleware(BaseHTTPMiddleware):
    """Middleware to handle and format errors."""
    
    def __init__(self, app: ASGIApp):
        super().__init__(app)
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        try:
            response = await call_next(request)
            return response
            
        except BaseAppException as e:
            # Handle custom application exceptions
            log_with_context(
                logger,
                "error",
                f"Application error: {e.message}",
                error_code=e.error_code,
                status_code=e.status_code,
                details=e.details,
                correlation_id=get_correlation_id()
            )
            
            return JSONResponse(
                status_code=e.status_code,
                content={
                    "error": {
                        "message": e.message,
                        "code": e.error_code,
                        "details": e.details,
                        "correlation_id": get_correlation_id()
                    }
                }
            )
            
        except PydanticValidationError as e:
            # Handle Pydantic validation errors
            log_with_context(
                logger,
                "error",
                f"Validation error: {str(e)}",
                error_code="VALIDATION_ERROR",
                status_code=422,
                details={"errors": e.errors()},
                correlation_id=get_correlation_id()
            )
            
            return JSONResponse(
                status_code=422,
                content={
                    "error": {
                        "message": "Validation error",
                        "code": "VALIDATION_ERROR",
                        "details": {"errors": e.errors()},
                        "correlation_id": get_correlation_id()
                    }
                }
            )
            
        except SQLAlchemyError as e:
            # Handle database errors
            log_with_context(
                logger,
                "error",
                f"Database error: {str(e)}",
                error_code="DATABASE_ERROR",
                status_code=500,
                details={"database_error": str(e)},
                correlation_id=get_correlation_id()
            )
            
            return JSONResponse(
                status_code=500,
                content={
                    "error": {
                        "message": "Database operation failed",
                        "code": "DATABASE_ERROR",
                        "details": {"database_error": str(e)},
                        "correlation_id": get_correlation_id()
                    }
                }
            )
            
        except Exception as e:
            # Handle unexpected errors
            log_with_context(
                logger,
                "error",
                f"Unexpected error: {str(e)}",
                error_code="INTERNAL_SERVER_ERROR",
                status_code=500,
                details={"unexpected_error": str(e)},
                correlation_id=get_correlation_id()
            )
            
            # In production, don't expose internal errors
            if settings.is_production:
                error_message = "Internal server error"
                error_details = {}
            else:
                error_message = str(e)
                error_details = {"unexpected_error": str(e)}
            
            return JSONResponse(
                status_code=500,
                content={
                    "error": {
                        "message": error_message,
                        "code": "INTERNAL_SERVER_ERROR",
                        "details": error_details,
                        "correlation_id": get_correlation_id()
                    }
                }
            )


class SecurityMiddleware(BaseHTTPMiddleware):
    """Middleware to add security headers."""
    
    def __init__(self, app: ASGIApp):
        super().__init__(app)
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        response = await call_next(request)
        
        # Add security headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        
        # Add CORS headers if not already present
        if "Access-Control-Allow-Origin" not in response.headers:
            response.headers["Access-Control-Allow-Origin"] = "*"
        
        return response


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Simple rate limiting middleware."""
    
    def __init__(self, app: ASGIApp):
        super().__init__(app)
        self.request_counts = {}
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Get client IP
        client_ip = request.client.host if request.client else "unknown"
        
        # Simple in-memory rate limiting (not suitable for production)
        current_time = time.time()
        window_start = current_time - 60  # 1 minute window
        
        # Clean old entries
        self.request_counts = {
            ip: count for ip, count in self.request_counts.items()
            if count["timestamp"] > window_start
        }
        
        # Check rate limit
        if client_ip in self.request_counts:
            count_info = self.request_counts[client_ip]
            if count_info["timestamp"] > window_start:
                if count_info["count"] >= settings.RATE_LIMIT_PER_MINUTE:
                    log_with_context(
                        logger,
                        "warning",
                        f"Rate limit exceeded for IP: {client_ip}",
                        client_ip=client_ip,
                        correlation_id=get_correlation_id()
                    )
                    
                    return JSONResponse(
                        status_code=429,
                        content={
                            "error": {
                                "message": "Rate limit exceeded",
                                "code": "RATE_LIMIT_ERROR",
                                "details": {"retry_after": 60},
                                "correlation_id": get_correlation_id()
                            }
                        }
                    )
                else:
                    count_info["count"] += 1
            else:
                self.request_counts[client_ip] = {"count": 1, "timestamp": current_time}
        else:
            self.request_counts[client_ip] = {"count": 1, "timestamp": current_time}
        
        return await call_next(request)


def setup_middleware(app: ASGIApp) -> ASGIApp:
    """Setup all middleware for the application."""
    # Note: Order matters - middleware is applied in reverse order
    app = RateLimitMiddleware(app)
    app = SecurityMiddleware(app)
    app = ErrorHandlingMiddleware(app)
    app = LoggingMiddleware(app)
    app = CorrelationMiddleware(app)
    
    return app 