from typing import List, Optional, Dict, Any
import pydantic
from pydantic import validator, Field
import os
import secrets
from pathlib import Path


class Settings(pydantic.BaseSettings):
    # Database Configuration
    DATABASE_URL: str = Field(
        default="sqlite:///./wingstop_inventory.db",
        description="Database connection URL"
    )
    
    # Security Configuration
    SECRET_KEY: str = Field(
        default="your-super-secret-key-change-this-in-production",
        description="Secret key for JWT tokens"
    )
    ALGORITHM: str = Field(default="HS256", description="JWT algorithm")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=30, ge=1, le=1440)
    REFRESH_TOKEN_EXPIRE_DAYS: int = Field(default=7, ge=1, le=365)
    
    # Application Configuration
    ENVIRONMENT: str = Field(default="development", description="Environment (development/staging/production)")
    DEBUG: bool = Field(default=True, description="Debug mode")
    LOG_LEVEL: str = Field(default="INFO", description="Logging level")
    API_V1_STR: str = Field(default="/api/v1", description="API version prefix")
    PROJECT_NAME: str = Field(default="Wingstop Inventory API", description="Project name")
    VERSION: str = Field(default="1.0.0", description="API version")
    
    # Server Configuration
    HOST: str = Field(default="0.0.0.0", description="Server host")
    PORT: int = Field(default=8000, ge=1, le=65535, description="Server port")
    
    # CORS Configuration
    ALLOWED_HOSTS: List[str] = Field(
        default=["http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:3000"],
        description="Allowed hosts for CORS"
    )
    ALLOWED_ORIGINS: List[str] = Field(
        default=["http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:3000"],
        description="Allowed origins for CORS"
    )
    
    # Email Configuration
    SMTP_HOST: Optional[str] = Field(default=None, description="SMTP host")
    SMTP_PORT: int = Field(default=587, ge=1, le=65535)
    SMTP_USER: Optional[str] = Field(default=None, description="SMTP username")
    SMTP_PASSWORD: Optional[str] = Field(default=None, description="SMTP password")
    EMAIL_FROM: str = Field(default="noreply@wingstop.com", description="Default sender email")
    EMAIL_TEMPLATES_DIR: str = Field(default="./email_templates", description="Email templates directory")
    
    # File Upload Configuration
    MAX_FILE_SIZE: int = Field(default=10485760, ge=1024, description="Max file size in bytes (10MB)")
    UPLOAD_DIR: str = Field(default="./uploads", description="Upload directory")
    ALLOWED_FILE_TYPES: List[str] = Field(
        default=[".csv", ".xlsx", ".xls", ".pdf", ".jpg", ".png"],
        description="Allowed file types for upload"
    )
    
    # Redis Configuration
    REDIS_URL: Optional[str] = Field(default=None, description="Redis connection URL")
    REDIS_PASSWORD: Optional[str] = Field(default=None, description="Redis password")
    REDIS_DB: int = Field(default=0, ge=0, le=15, description="Redis database number")
    
    # External API Configuration
    WINGSTOP_API_URL: Optional[str] = Field(default=None, description="Wingstop API URL")
    WINGSTOP_API_KEY: Optional[str] = Field(default=None, description="Wingstop API key")
    
    # Monitoring and Logging
    SENTRY_DSN: Optional[str] = Field(default=None, description="Sentry DSN for error tracking")
    LOG_FILE: str = Field(default="./logs/app.log", description="Log file path")
    LOG_FORMAT: str = Field(default="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
    LOG_MAX_SIZE: int = Field(default=10485760, description="Max log file size (10MB)")
    LOG_BACKUP_COUNT: int = Field(default=5, description="Number of log backups")
    
    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = Field(default=60, ge=1, description="Requests per minute")
    RATE_LIMIT_BURST: int = Field(default=100, ge=1, description="Burst requests allowed")
    
    # Security Configuration
    SECURITY_HEADERS_ENABLED: bool = Field(default=True, description="Enable security headers")
    CSP_ENABLED: bool = Field(default=True, description="Enable Content Security Policy")
    HSTS_ENABLED: bool = Field(default=True, description="Enable HTTP Strict Transport Security")
    
    # Authentication
    AUTH_REQUIRED: bool = Field(default=True, description="Require authentication for API endpoints")
    PUBLIC_ENDPOINTS: List[str] = Field(
        default=["/health", "/docs", "/openapi.json", "/redoc"],
        description="Public endpoints that don't require authentication"
    )
    
    # Session Configuration
    SESSION_TIMEOUT_MINUTES: int = Field(default=30, ge=1, description="Session timeout in minutes")
    MAX_SESSIONS_PER_USER: int = Field(default=5, ge=1, description="Max sessions per user")
    
    # Backup Configuration
    BACKUP_ENABLED: bool = Field(default=True, description="Enable automatic backups")
    BACKUP_RETENTION_DAYS: int = Field(default=30, ge=1, description="Backup retention in days")
    BACKUP_SCHEDULE: str = Field(default="0 2 * * *", description="Backup schedule (cron format)")
    
    @validator("DATABASE_URL", pre=True)
    def validate_database_url(cls, v):
        if not v:
            raise ValueError("DATABASE_URL is required")
        return v
    
    @validator("SECRET_KEY", pre=True)
    def validate_secret_key(cls, v):
        if v == "your-super-secret-key-change-this-in-production":
            if os.getenv("ENVIRONMENT") == "production":
                raise ValueError("SECRET_KEY must be changed in production")
            # Generate a random secret key for development
            v = secrets.token_urlsafe(32)
        return v
    
    @validator("ALLOWED_HOSTS", "ALLOWED_ORIGINS", pre=True)
    def validate_cors_settings(cls, v):
        if isinstance(v, str):
            import json
            try:
                return json.loads(v)
            except json.JSONDecodeError:
                return [v]
        return v
    
    @validator("ENVIRONMENT")
    def validate_environment(cls, v):
        allowed = ["development", "staging", "production", "test"]
        if v not in allowed:
            raise ValueError(f"ENVIRONMENT must be one of: {allowed}")
        return v
    
    @validator("LOG_LEVEL")
    def validate_log_level(cls, v):
        allowed = ["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"]
        if v.upper() not in allowed:
            raise ValueError(f"LOG_LEVEL must be one of: {allowed}")
        return v.upper()
    
    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT == "production"
    
    @property
    def is_development(self) -> bool:
        return self.ENVIRONMENT == "development"
    
    @property
    def is_testing(self) -> bool:
        return self.ENVIRONMENT == "test"
    
    @property
    def is_staging(self) -> bool:
        return self.ENVIRONMENT == "staging"
    
    # JWT Configuration (alias properties for backward compatibility)
    @property
    def JWT_SECRET_KEY(self) -> str:
        return self.SECRET_KEY
    
    @property
    def JWT_ALGORITHM(self) -> str:
        return self.ALGORITHM
    
    @property
    def JWT_ACCESS_TOKEN_EXPIRE_MINUTES(self) -> int:
        return self.ACCESS_TOKEN_EXPIRE_MINUTES
    
    @property
    def JWT_REFRESH_TOKEN_EXPIRE_DAYS(self) -> int:
        return self.REFRESH_TOKEN_EXPIRE_DAYS
    
    def get_database_config(self) -> Dict[str, Any]:
        """Get database configuration based on environment."""
        if self.is_production:
            return {
                "pool_size": 20,
                "max_overflow": 30,
                "pool_pre_ping": True,
                "pool_recycle": 3600,
            }
        else:
            return {
                "pool_size": 5,
                "max_overflow": 10,
                "pool_pre_ping": True,
                "pool_recycle": 300,
            }
    
    def get_cors_config(self) -> Dict[str, Any]:
        """Get CORS configuration based on environment."""
        if self.is_production:
            return {
                "allow_origins": self.ALLOWED_ORIGINS,
                "allow_credentials": True,
                "allow_methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
                "allow_headers": ["*"],
            }
        else:
            return {
                "allow_origins": ["*"],
                "allow_credentials": True,
                "allow_methods": ["*"],
                "allow_headers": ["*"],
            }
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True
        validate_assignment = True


# Create settings instance
settings = Settings()


# Configuration utilities
class ConfigManager:
    """Manages application configuration and environment-specific settings."""
    
    def __init__(self, settings: Settings):
        self.settings = settings
        self._ensure_directories()
    
    def _ensure_directories(self):
        """Ensure required directories exist."""
        directories = [
            Path(self.settings.UPLOAD_DIR),
            Path(self.settings.LOG_FILE).parent,
            Path(self.settings.EMAIL_TEMPLATES_DIR),
        ]
        
        for directory in directories:
            directory.mkdir(parents=True, exist_ok=True)
    
    def get_environment_config(self) -> Dict[str, Any]:
        """Get environment-specific configuration."""
        base_config = {
            "environment": self.settings.ENVIRONMENT,
            "debug": self.settings.DEBUG,
            "log_level": self.settings.LOG_LEVEL,
        }
        
        if self.settings.is_production:
            base_config.update({
                "cors_strict": True,
                "rate_limiting": True,
                "backup_enabled": True,
                "monitoring": True,
            })
        elif self.settings.is_staging:
            base_config.update({
                "cors_strict": True,
                "rate_limiting": True,
                "backup_enabled": True,
                "monitoring": True,
            })
        else:  # development/test
            base_config.update({
                "cors_strict": False,
                "rate_limiting": False,
                "backup_enabled": False,
                "monitoring": False,
            })
        
        return base_config
    
    def validate_configuration(self) -> List[str]:
        """Validate configuration and return any issues."""
        issues = []
        
        # Check required settings for production
        if self.settings.is_production:
            if self.settings.SECRET_KEY == "your-super-secret-key-change-this-in-production":
                issues.append("SECRET_KEY must be changed in production")
            
            if not self.settings.SMTP_HOST:
                issues.append("SMTP_HOST is required in production")
            
            if not self.settings.SENTRY_DSN:
                issues.append("SENTRY_DSN is recommended in production")
        
        # Check file paths
        if not Path(self.settings.UPLOAD_DIR).parent.exists():
            issues.append(f"Upload directory parent does not exist: {self.settings.UPLOAD_DIR}")
        
        if not Path(self.settings.LOG_FILE).parent.exists():
            issues.append(f"Log directory does not exist: {self.settings.LOG_FILE}")
        
        return issues
    
    def get_security_config(self) -> Dict[str, Any]:
        """Get security-related configuration."""
        return {
            "secret_key": self.settings.SECRET_KEY,
            "algorithm": self.settings.ALGORITHM,
            "access_token_expire_minutes": self.settings.ACCESS_TOKEN_EXPIRE_MINUTES,
            "refresh_token_expire_days": self.settings.REFRESH_TOKEN_EXPIRE_DAYS,
            "session_timeout_minutes": self.settings.SESSION_TIMEOUT_MINUTES,
            "max_sessions_per_user": self.settings.MAX_SESSIONS_PER_USER,
        }


# Create configuration manager
config_manager = ConfigManager(settings)


# Legacy functions for backward compatibility
def get_database_url() -> str:
    return settings.DATABASE_URL

def get_secret_key() -> str:
    return settings.SECRET_KEY

def get_algorithm() -> str:
    return settings.ALGORITHM

def get_access_token_expire_minutes() -> int:
    return settings.ACCESS_TOKEN_EXPIRE_MINUTES

def get_refresh_token_expire_days() -> int:
    return settings.REFRESH_TOKEN_EXPIRE_DAYS

def get_allowed_origins() -> List[str]:
    return settings.ALLOWED_ORIGINS

def get_allowed_hosts() -> List[str]:
    return settings.ALLOWED_HOSTS

def is_debug() -> bool:
    return settings.DEBUG

def get_environment() -> str:
    return settings.ENVIRONMENT

def get_log_level() -> str:
    return settings.LOG_LEVEL

def get_project_name() -> str:
    return settings.PROJECT_NAME

def get_api_v1_str() -> str:
    return settings.API_V1_STR

def get_log_file() -> str:
    return settings.LOG_FILE 