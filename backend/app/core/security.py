import secrets
import hashlib
import hmac
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any
from fastapi import Request, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp
import jwt

from .config import settings
from .logging import get_logger, log_with_context

logger = get_logger(__name__)

# Security token scheme
security = HTTPBearer()


class SecurityConfig:
    """Security configuration and utilities."""
    
    @staticmethod
    def get_cors_config() -> Dict[str, Any]:
        """Get CORS configuration based on environment."""
        if settings.is_production:
            return {
                "allow_origins": settings.ALLOWED_ORIGINS,
                "allow_credentials": True,
                "allow_methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
                "allow_headers": [
                    "Accept",
                    "Accept-Language",
                    "Content-Language",
                    "Content-Type",
                    "Authorization",
                    "X-Requested-With",
                    "X-Correlation-ID"
                ],
                "expose_headers": ["X-Correlation-ID"],
                "max_age": 86400,  # 24 hours
            }
        else:
            return {
                "allow_origins": ["*"],
                "allow_credentials": True,
                "allow_methods": ["*"],
                "allow_headers": ["*"],
                "expose_headers": ["X-Correlation-ID"],
            }
    
    @staticmethod
    def get_security_headers() -> Dict[str, str]:
        """Get security headers configuration."""
        return {
            "X-Content-Type-Options": "nosniff",
            "X-Frame-Options": "DENY",
            "X-XSS-Protection": "1; mode=block",
            "Referrer-Policy": "strict-origin-when-cross-origin",
            "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
            "Strict-Transport-Security": "max-age=31536000; includeSubDomains" if settings.is_production else "",
        }
    
    @staticmethod
    def get_csp_policy() -> str:
        """Get Content Security Policy."""
        if settings.is_production:
            return (
                "default-src 'self'; "
                "script-src 'self' 'unsafe-inline' 'unsafe-eval'; "
                "style-src 'self' 'unsafe-inline'; "
                "img-src 'self' data: https:; "
                "font-src 'self'; "
                "connect-src 'self'; "
                "frame-ancestors 'none';"
            )
        else:
            return (
                "default-src 'self'; "
                "script-src 'self' 'unsafe-inline' 'unsafe-eval'; "
                "style-src 'self' 'unsafe-inline'; "
                "img-src 'self' data: https:; "
                "font-src 'self'; "
                "connect-src 'self';"
            )


class AuthenticationManager:
    """Manages authentication and authorization."""
    
    def __init__(self):
        self.secret_key = settings.JWT_SECRET_KEY
        self.algorithm = settings.JWT_ALGORITHM
    
    def create_access_token(self, data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
        """Create a JWT access token."""
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
        
        to_encode.update({"exp": expire, "type": "access"})
        encoded_jwt = jwt.encode(to_encode, self.secret_key, algorithm=self.algorithm)
        return encoded_jwt
    
    def create_refresh_token(self, data: Dict[str, Any]) -> str:
        """Create a JWT refresh token."""
        to_encode = data.copy()
        expire = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        to_encode.update({"exp": expire, "type": "refresh"})
        encoded_jwt = jwt.encode(to_encode, self.secret_key, algorithm=self.algorithm)
        return encoded_jwt
    
    def verify_token(self, token: str) -> Dict[str, Any]:
        """Verify and decode a JWT token."""
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            return payload
        except jwt.ExpiredSignatureError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has expired"
            )
        except (jwt.InvalidTokenError, jwt.DecodeError):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )
    
    def hash_password(self, password: str) -> str:
        """Hash a password using bcrypt."""
        import bcrypt
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
        return hashed.decode('utf-8')
    
    def verify_password(self, password: str, hashed_password: str) -> bool:
        """Verify a password against its hash."""
        import bcrypt
        return bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8'))
    
    def generate_api_key(self) -> str:
        """Generate a secure API key."""
        return secrets.token_urlsafe(32)


class SecurityMiddleware(BaseHTTPMiddleware):
    """Enhanced security middleware."""
    
    def __init__(self, app: ASGIApp):
        super().__init__(app)
        self.security_config = SecurityConfig()
    
    async def dispatch(self, request: Request, call_next):
        # Add security headers
        response = await call_next(request)
        
        # Add security headers
        security_headers = self.security_config.get_security_headers()
        for header, value in security_headers.items():
            if value:  # Only add non-empty headers
                response.headers[header] = value
        
        # Add CSP header
        csp_policy = self.security_config.get_csp_policy()
        response.headers["Content-Security-Policy"] = csp_policy
        
        # Add CORS headers if not already present
        if "Access-Control-Allow-Origin" not in response.headers:
            cors_config = self.security_config.get_cors_config()
            response.headers["Access-Control-Allow-Origin"] = cors_config["allow_origins"][0] if cors_config["allow_origins"] else "*"
        
        return response


class RequestValidationMiddleware(BaseHTTPMiddleware):
    """Middleware to validate and sanitize requests."""
    
    def __init__(self, app: ASGIApp):
        super().__init__(app)
    
    async def dispatch(self, request: Request, call_next):
        # Validate request size
        content_length = request.headers.get("content-length")
        if content_length and int(content_length) > settings.MAX_FILE_SIZE:
            log_with_context(
                logger,
                "warning",
                f"Request too large: {content_length} bytes",
                client_ip=request.client.host if request.client else None,
                url=str(request.url)
            )
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail="Request too large"
            )
        
        # Validate content type for POST/PUT requests
        if request.method in ["POST", "PUT", "PATCH"]:
            content_type = request.headers.get("content-type", "")
            if not content_type.startswith(("application/json", "multipart/form-data", "application/x-www-form-urlencoded")):
                log_with_context(
                    logger,
                    "warning",
                    f"Invalid content type: {content_type}",
                    client_ip=request.client.host if request.client else None,
                    url=str(request.url)
                )
                raise HTTPException(
                    status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
                    detail="Unsupported media type"
                )
        
        response = await call_next(request)
        return response


class AuthenticationMiddleware(BaseHTTPMiddleware):
    """Middleware to handle authentication."""
    
    def __init__(self, app: ASGIApp):
        super().__init__(app)
        self.auth_manager = AuthenticationManager()
    
    async def dispatch(self, request: Request, call_next):
        # Skip authentication for certain paths
        skip_auth_paths = ["/", "/health", "/health/db", "/docs", "/openapi.json", "/redoc"]
        if any(request.url.path.startswith(path) for path in skip_auth_paths):
            return await call_next(request)
        
        # Check for authentication header
        auth_header = request.headers.get("authorization")
        if not auth_header:
            # Allow unauthenticated access to public endpoints
            if request.url.path.startswith("/api/v1/public"):
                return await call_next(request)
            
            log_with_context(
                logger,
                "warning",
                "Missing authorization header",
                client_ip=request.client.host if request.client else None,
                url=str(request.url)
            )
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Missing authorization header"
            )
        
        try:
            # Extract token from header
            scheme, token = auth_header.split()
            if scheme.lower() != "bearer":
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid authentication scheme"
                )
            
            # Verify token
            payload = self.auth_manager.verify_token(token)
            request.state.user = payload
            
            log_with_context(
                logger,
                "info",
                "User authenticated",
                user_id=payload.get("user_id"),
                client_ip=request.client.host if request.client else None,
                url=str(request.url)
            )
            
        except HTTPException:
            raise
        except Exception as e:
            log_with_context(
                logger,
                "error",
                f"Authentication error: {str(e)}",
                client_ip=request.client.host if request.client else None,
                url=str(request.url)
            )
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials"
            )
        
        return await call_next(request)


def setup_security_middleware(app: ASGIApp) -> ASGIApp:
    """Setup security middleware stack."""
    # Note: Order matters - middleware is applied in reverse order
    app = AuthenticationMiddleware(app)
    app = RequestValidationMiddleware(app)
    app = SecurityMiddleware(app)
    
    return app


# Security utilities
def sanitize_input(text: str) -> str:
    """Basic input sanitization."""
    import html
    return html.escape(text.strip())


def validate_file_type(filename: str) -> bool:
    """Validate file type based on extension."""
    if not filename:
        return False
    
    file_extension = filename.lower().split('.')[-1] if '.' in filename else ''
    allowed_extensions = [ext.replace('.', '') for ext in settings.ALLOWED_FILE_TYPES]
    
    return file_extension in allowed_extensions


def generate_secure_filename(original_filename: str) -> str:
    """Generate a secure filename."""
    import uuid
    import os
    
    # Get file extension
    _, ext = os.path.splitext(original_filename)
    
    # Generate secure filename
    secure_name = f"{uuid.uuid4().hex}{ext}"
    
    return secure_name


def validate_password_strength(password: str) -> Dict[str, Any]:
    """Validate password strength."""
    errors = []
    
    if len(password) < 8:
        errors.append("Password must be at least 8 characters long")
    
    if not any(c.isupper() for c in password):
        errors.append("Password must contain at least one uppercase letter")
    
    if not any(c.islower() for c in password):
        errors.append("Password must contain at least one lowercase letter")
    
    if not any(c.isdigit() for c in password):
        errors.append("Password must contain at least one number")
    
    if not any(c in "!@#$%^&*()_+-=[]{}|;:,.<>?" for c in password):
        errors.append("Password must contain at least one special character")
    
    return {
        "is_valid": len(errors) == 0,
        "errors": errors,
        "strength_score": max(0, 5 - len(errors))
    } 