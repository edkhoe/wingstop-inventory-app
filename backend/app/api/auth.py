from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import Optional
from datetime import datetime, timedelta
from app.models.user import User
from app.schemas.user import UserCreate, UserRead
from app.core.database import get_session
from app.core.security import AuthenticationManager
from app.core.config import settings
from app.core.dependencies import get_current_user
from app.core.security_utils import SecurityUtils
from pydantic import BaseModel, Field

router = APIRouter(prefix="/auth", tags=["Authentication"])
auth_manager = AuthenticationManager()


class TokenRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=50, description="Username for login")
    password: str = Field(..., min_length=8, description="User password")


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserRead


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class RefreshTokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int


class RegisterRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=50, description="Username for registration")
    email: str = Field(..., description="Email address")
    password: str = Field(..., min_length=8, description="Password (minimum 8 characters)")
    role_id: Optional[int] = Field(None, description="Role ID (optional)")


@router.post("/login", response_model=TokenResponse)
async def login(
    token_request: TokenRequest,
    session: Session = Depends(get_session)
):
    """Authenticate user and return JWT tokens."""
    # Sanitize input
    username = SecurityUtils.sanitize_input(token_request.username)
    password = token_request.password  # Don't sanitize password
    
    # Find user by username
    user = session.exec(select(User).where(User.username == username)).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )
    
    # Verify password
    if not auth_manager.verify_password(password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )
    
    # Check if user is active
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account is inactive"
        )
    
    # Create tokens
    access_token_expires = timedelta(minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth_manager.create_access_token(
        data={"sub": str(user.id), "username": user.username, "role_id": user.role_id},
        expires_delta=access_token_expires
    )
    refresh_token = auth_manager.create_refresh_token(
        data={"sub": str(user.id), "username": user.username}
    )
    
    # Create audit log
    SecurityUtils.create_audit_log(
        action="user_login",
        user_id=user.id,
        details={
            "username": user.username,
            "login_successful": True
        }
    )
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60,  # Convert to seconds
        user=UserRead.from_orm(user)
    )


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(
    register_request: RegisterRequest,
    session: Session = Depends(get_session)
):
    """Register a new user and return JWT tokens."""
    # Sanitize inputs
    username = SecurityUtils.sanitize_input(register_request.username)
    email = SecurityUtils.sanitize_input(register_request.email)
    password = register_request.password  # Don't sanitize password
    
    # Validate registration data comprehensively
    validation_result = auth_manager.validate_registration_data(username, email, password)
    if not validation_result["is_valid"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Registration validation failed: {'; '.join(validation_result['errors'])}"
        )
    
    # Check if username already exists
    existing_user = session.exec(select(User).where(User.username == username)).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    
    # Check if email already exists
    existing_email = session.exec(select(User).where(User.email == email)).first()
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Hash password using enhanced security
    hashed_password = auth_manager.hash_password(password)
    
    # Create user
    user = User(
        username=username,
        email=email,
        hashed_password=hashed_password,
        role_id=register_request.role_id,
        is_active=True
    )
    
    session.add(user)
    session.commit()
    session.refresh(user)
    
    # Create tokens
    access_token_expires = timedelta(minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth_manager.create_access_token(
        data={"sub": str(user.id), "username": user.username, "role_id": user.role_id},
        expires_delta=access_token_expires
    )
    refresh_token = auth_manager.create_refresh_token(
        data={"sub": str(user.id), "username": user.username}
    )
    
    # Create audit log
    SecurityUtils.create_audit_log(
        action="user_registered",
        user_id=user.id,
        details={
            "username": user.username,
            "email": user.email,
            "password_strength": validation_result["password_strength"]
        }
    )
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=UserRead.from_orm(user)
    )


@router.post("/refresh", response_model=RefreshTokenResponse)
async def refresh_token(
    refresh_request: RefreshTokenRequest,
    session: Session = Depends(get_session)
):
    """Refresh access token using refresh token."""
    try:
        payload = auth_manager.verify_token(refresh_request.refresh_token)
        user_id_raw = payload.get("sub")
        token_type_raw = payload.get("type")
        
        if user_id_raw is None or token_type_raw is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload"
            )
        
        user_id = int(user_id_raw)
        token_type = str(token_type_raw)
        
        if token_type != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token type"
            )
    except (HTTPException, ValueError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )
    
    # Get user
    user = session.get(User, user_id)
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive"
        )
    
    # Create new access token
    access_token_expires = timedelta(minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth_manager.create_access_token(
        data={"sub": str(user.id), "username": user.username, "role_id": user.role_id},
        expires_delta=access_token_expires
    )
    
    # Create audit log
    SecurityUtils.create_audit_log(
        action="token_refreshed",
        user_id=user.id,
        details={
            "username": user.username
        }
    )
    
    return RefreshTokenResponse(
        access_token=access_token,
        expires_in=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )


@router.get("/me", response_model=UserRead)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current user information."""
    return UserRead.from_orm(current_user)


@router.post("/logout")
async def logout():
    """Logout user (client-side token removal)."""
    # Create audit log
    SecurityUtils.create_audit_log(
        action="user_logout",
        user_id=None,  # Will be set by middleware if available
        details={}
    )
    
    return {"message": "Successfully logged out"}


class ChangePasswordRequest(BaseModel):
    current_password: str = Field(..., description="Current password")
    new_password: str = Field(..., min_length=8, description="New password (minimum 8 characters)")


@router.post("/change-password")
async def change_password(
    password_request: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Change user password."""
    # Verify current password
    if not auth_manager.verify_password(password_request.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )
    
    # Validate new password strength
    password_validation = auth_manager.validate_password_strength(password_request.new_password)
    if not password_validation["is_valid"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"New password does not meet requirements: {'; '.join(password_validation['errors'])}"
        )
    
    # Hash new password
    new_hashed_password = auth_manager.hash_password(password_request.new_password)
    
    # Update user password
    current_user.hashed_password = new_hashed_password
    session.add(current_user)
    session.commit()
    
    # Create audit log
    SecurityUtils.create_audit_log(
        action="password_changed",
        user_id=current_user.id,
        details={
            "username": current_user.username,
            "password_strength": password_validation["strength"]
        }
    )
    
    return {"message": "Password changed successfully"}


class UpdateProfileRequest(BaseModel):
    email: Optional[str] = Field(None, description="New email address")
    is_active: Optional[bool] = Field(None, description="Account active status")


@router.put("/profile", response_model=UserRead)
async def update_profile(
    profile_request: UpdateProfileRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Update user profile."""
    # Validate email if provided
    if profile_request.email:
        email = SecurityUtils.sanitize_input(profile_request.email)
        if not SecurityUtils.validate_email(email):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid email format"
            )
        
        # Check if email is already taken by another user
        existing_user = session.exec(
            select(User).where(User.email == email, User.id != current_user.id)
        ).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered by another user"
            )
        
        current_user.email = email
    
    # Update active status if provided
    if profile_request.is_active is not None:
        current_user.is_active = profile_request.is_active
    
    session.add(current_user)
    session.commit()
    session.refresh(current_user)
    
    # Create audit log
    SecurityUtils.create_audit_log(
        action="profile_updated",
        user_id=current_user.id,
        details={
            "username": current_user.username,
            "email_updated": profile_request.email is not None,
            "active_status_updated": profile_request.is_active is not None
        }
    )
    
    return UserRead.from_orm(current_user)


@router.get("/verify-token")
async def verify_token(current_user: User = Depends(get_current_user)):
    """Verify if the current token is valid."""
    return {
        "valid": True,
        "user": UserRead.from_orm(current_user)
    }


@router.post("/generate-password")
async def generate_secure_password():
    """Generate a secure password for testing purposes."""
    secure_password = SecurityUtils.generate_secure_password()
    return {
        "password": secure_password,
        "length": len(secure_password),
        "note": "This is for testing purposes only. In production, users should create their own passwords."
    }


@router.post("/validate-password")
async def validate_password_strength_endpoint(password: str):
    """Validate password strength (for frontend integration)."""
    validation_result = auth_manager.validate_password_strength(password)
    return validation_result 