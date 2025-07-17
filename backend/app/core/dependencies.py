from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlmodel import Session, select
from typing import Optional
from app.models.user import User
from app.models.role import Role
from app.core.database import get_session
from app.core.security import AuthenticationManager
from app.core.config import settings

security = HTTPBearer()
auth_manager = AuthenticationManager()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    session: Session = Depends(get_session)
) -> User:
    """Get the current authenticated user from JWT token."""
    try:
        payload = auth_manager.verify_token(credentials.credentials)
        user_id_raw = payload.get("sub")
        if user_id_raw is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload"
            )
        user_id = int(user_id_raw)
    except (HTTPException, ValueError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )
    
    user = session.get(User, user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User is inactive"
        )
    return user


async def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    """Get current active user."""
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    return current_user


async def get_current_user_with_role(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
) -> tuple[User, Optional[Role]]:
    """Get current user with their role information."""
    role = None
    if current_user.role_id:
        role = session.get(Role, current_user.role_id)
    return current_user, role


def require_role(required_role: str):
    """Dependency factory to require a specific role."""
    async def _require_role(
        current_user: User = Depends(get_current_user),
        session: Session = Depends(get_session)
    ) -> User:
        if not current_user.role_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User has no role assigned"
            )
        
        role = session.get(Role, current_user.role_id)
        if not role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User role not found"
            )
        
        if role.name != required_role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required role: {required_role}"
            )
        
        return current_user
    
    return _require_role


def require_any_role(required_roles: list[str]):
    """Dependency factory to require any of the specified roles."""
    async def _require_any_role(
        current_user: User = Depends(get_current_user),
        session: Session = Depends(get_session)
    ) -> User:
        if not current_user.role_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User has no role assigned"
            )
        
        role = session.get(Role, current_user.role_id)
        if not role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User role not found"
            )
        
        if role.name not in required_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required one of roles: {', '.join(required_roles)}"
            )
        
        return current_user
    
    return _require_any_role


# Predefined role-based dependencies
require_admin = require_role("admin")
require_manager = require_role("manager")
require_clerk = require_role("clerk")
require_manager_or_admin = require_any_role(["manager", "admin"])
require_any_authenticated = get_current_active_user 