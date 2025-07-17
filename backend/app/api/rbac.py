from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List, Dict, Set
from app.models.user import User
from app.models.role import Role
from app.schemas.role import RoleCreate, RoleUpdate, RoleRead
from app.core.database import get_session
from app.core.rbac import RolePermissions, RBACMiddleware, rbac_deps
from app.core.dependencies import get_current_user
from pydantic import BaseModel
from datetime import datetime

router = APIRouter(prefix="/rbac", tags=["Role-Based Access Control"])
rbac = RBACMiddleware()


class PermissionInfo(BaseModel):
    name: str
    description: str


class RoleInfo(BaseModel):
    name: str
    description: str
    permissions: List[str]


class UserRoleInfo(BaseModel):
    user_id: int
    username: str
    role_name: str
    permissions: List[str]


@router.get("/permissions", response_model=List[PermissionInfo])
async def get_all_permissions(
    current_user: User = Depends(rbac_deps.require_permission("roles:read"))
):
    """Get all available permissions in the system."""
    permissions = []
    for perm_name, perm_obj in RolePermissions.PERMISSIONS.items():
        permissions.append(PermissionInfo(
            name=perm_name,
            description=perm_obj.description
        ))
    return permissions


@router.get("/roles", response_model=List[RoleInfo])
async def get_all_roles(
    current_user: User = Depends(rbac_deps.require_permission("roles:read")),
    session: Session = Depends(get_session)
):
    """Get all roles with their permissions."""
    roles = session.exec(select(Role)).all()
    role_infos = []
    
    for role in roles:
        permissions = RolePermissions.get_permissions_for_role(role.name)
        role_infos.append(RoleInfo(
            name=role.name,
            description=RolePermissions.get_role_description(role.name),
            permissions=list(permissions)
        ))
    
    return role_infos


@router.get("/roles/{role_name}", response_model=RoleInfo)
async def get_role_info(
    role_name: str,
    current_user: User = Depends(rbac_deps.require_permission("roles:read"))
):
    """Get information about a specific role."""
    if role_name not in RolePermissions.ROLE_PERMISSIONS:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Role '{role_name}' not found"
        )
    
    permissions = RolePermissions.get_permissions_for_role(role_name)
    return RoleInfo(
        name=role_name,
        description=RolePermissions.get_role_description(role_name),
        permissions=list(permissions)
    )


@router.get("/users/{user_id}/permissions", response_model=List[str])
async def get_user_permissions(
    user_id: int,
    current_user: User = Depends(rbac_deps.require_permission("users:read")),
    session: Session = Depends(get_session)
):
    """Get all permissions for a specific user."""
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    permissions = rbac.get_user_permissions(user, session)
    return list(permissions)


@router.get("/users/{user_id}/role", response_model=UserRoleInfo)
async def get_user_role_info(
    user_id: int,
    current_user: User = Depends(rbac_deps.require_permission("users:read")),
    session: Session = Depends(get_session)
):
    """Get role information for a specific user."""
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    role = None
    if user.role_id:
        role = session.get(Role, user.role_id)
    
    permissions = rbac.get_user_permissions(user, session)
    
    return UserRoleInfo(
        user_id=user.id or 0,  # Handle case where id might be None
        username=user.username,
        role_name=role.name if role else "No role assigned",
        permissions=list(permissions)
    )


@router.post("/users/{user_id}/role/{role_name}")
async def assign_role_to_user(
    user_id: int,
    role_name: str,
    current_user: User = Depends(rbac_deps.require_permission("users:update")),
    session: Session = Depends(get_session)
):
    """Assign a role to a user."""
    # Check if user exists
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Check if role exists
    if role_name not in RolePermissions.ROLE_PERMISSIONS:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Role '{role_name}' not found"
        )
    
    # Get or create the role
    role = session.exec(select(Role).where(Role.name == role_name)).first()
    if not role:
        # Create the role if it doesn't exist
        role = Role(name=role_name, description=RolePermissions.get_role_description(role_name))
        session.add(role)
        session.commit()
        session.refresh(role)
    
    # Assign role to user
    user.role_id = role.id
    user.updated_at = datetime.utcnow()
    
    session.add(user)
    session.commit()
    
    return {"message": f"Role '{role_name}' assigned to user '{user.username}'"}


@router.delete("/users/{user_id}/role")
async def remove_role_from_user(
    user_id: int,
    current_user: User = Depends(rbac_deps.require_permission("users:update")),
    session: Session = Depends(get_session)
):
    """Remove role assignment from a user."""
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    user.role_id = None
    user.updated_at = datetime.utcnow()
    
    session.add(user)
    session.commit()
    
    return {"message": f"Role removed from user '{user.username}'"}


@router.get("/my-permissions", response_model=List[str])
async def get_my_permissions(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Get current user's permissions."""
    permissions = rbac.get_user_permissions(current_user, session)
    return list(permissions)


@router.get("/my-role", response_model=UserRoleInfo)
async def get_my_role_info(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Get current user's role information."""
    role = None
    if current_user.role_id:
        role = session.get(Role, current_user.role_id)
    
    permissions = rbac.get_user_permissions(current_user, session)
    
    return UserRoleInfo(
        user_id=current_user.id or 0,  # Handle case where id might be None
        username=current_user.username,
        role_name=role.name if role else "No role assigned",
        permissions=list(permissions)
    ) 