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
    # Find user by username
    user = session.exec(select(User).where(User.username == token_request.username)).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )
    
    # Verify password
    if not auth_manager.verify_password(token_request.password, user.hashed_password):
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
    # Validate password strength
    from app.core.security import validate_password_strength
    password_validation = validate_password_strength(register_request.password)
    if not password_validation["is_valid"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Password does not meet requirements: {'; '.join(password_validation['errors'])}"
        )
    
    # Check if username already exists
    existing_user = session.exec(select(User).where(User.username == register_request.username)).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    
    # Check if email already exists
    existing_email = session.exec(select(User).where(User.email == register_request.email)).first()
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Hash password
    hashed_password = auth_manager.hash_password(register_request.password)
    
    # Create user
    user = User(
        username=register_request.username,
        email=register_request.email,
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
    """Logout endpoint (client should discard tokens)."""
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
    from app.core.security import validate_password_strength
    password_validation = validate_password_strength(password_request.new_password)
    if not password_validation["is_valid"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"New password does not meet requirements: {'; '.join(password_validation['errors'])}"
        )
    
    # Hash new password
    new_hashed_password = auth_manager.hash_password(password_request.new_password)
    
    # Update password
    current_user.hashed_password = new_hashed_password
    current_user.updated_at = datetime.utcnow()
    
    session.add(current_user)
    session.commit()
    
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
    """Update user profile information."""
    # Check if email is being changed and if it already exists
    if profile_request.email and profile_request.email != current_user.email:
        existing_email = session.exec(select(User).where(User.email == profile_request.email)).first()
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        current_user.email = profile_request.email
    
    # Update other fields
    if profile_request.is_active is not None:
        current_user.is_active = profile_request.is_active
    
    current_user.updated_at = datetime.utcnow()
    
    session.add(current_user)
    session.commit()
    session.refresh(current_user)
    
    return UserRead.from_orm(current_user)


@router.get("/verify-token")
async def verify_token(current_user: User = Depends(get_current_user)):
    """Verify if the current token is valid."""
    return {
        "valid": True,
        "user": UserRead.from_orm(current_user)
    } 