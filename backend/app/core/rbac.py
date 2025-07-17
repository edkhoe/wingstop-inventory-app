from fastapi import HTTPException, status, Request, Depends
from sqlmodel import Session, select
from typing import Dict, List, Optional, Set, Callable, Any
from functools import wraps
from app.models.user import User
from app.models.role import Role
from app.core.database import get_session
from app.core.logging import get_logger

logger = get_logger(__name__)


class Permission:
    """Represents a permission in the system."""
    
    def __init__(self, name: str, description: str = ""):
        self.name = name
        self.description = description
    
    def __str__(self):
        return self.name
    
    def __eq__(self, other):
        if isinstance(other, str):
            return self.name == other
        return self.name == other.name
    
    def __hash__(self):
        return hash(self.name)


class RolePermissions:
    """Defines permissions for different roles."""
    
    # Define all available permissions
    PERMISSIONS = {
        # User management
        "users:read": Permission("users:read", "Read user information"),
        "users:create": Permission("users:create", "Create new users"),
        "users:update": Permission("users:update", "Update user information"),
        "users:delete": Permission("users:delete", "Delete users"),
        
        # Inventory management
        "inventory:read": Permission("inventory:read", "Read inventory items"),
        "inventory:create": Permission("inventory:create", "Create inventory items"),
        "inventory:update": Permission("inventory:update", "Update inventory items"),
        "inventory:delete": Permission("inventory:delete", "Delete inventory items"),
        "inventory:export": Permission("inventory:export", "Export inventory data"),
        
        # Count management
        "counts:read": Permission("counts:read", "Read count entries"),
        "counts:create": Permission("counts:create", "Create count entries"),
        "counts:update": Permission("counts:update", "Update count entries"),
        "counts:delete": Permission("counts:delete", "Delete count entries"),
        "counts:approve": Permission("counts:approve", "Approve count entries"),
        
        # Reports and analytics
        "reports:read": Permission("reports:read", "Read reports"),
        "reports:create": Permission("reports:create", "Create reports"),
        "reports:export": Permission("reports:export", "Export reports"),
        
        # System administration
        "system:admin": Permission("system:admin", "Full system administration"),
        "system:config": Permission("system:config", "System configuration"),
        
        # Location management
        "locations:read": Permission("locations:read", "Read location information"),
        "locations:create": Permission("locations:create", "Create locations"),
        "locations:update": Permission("locations:update", "Update locations"),
        "locations:delete": Permission("locations:delete", "Delete locations"),
        
        # Role management
        "roles:read": Permission("roles:read", "Read role information"),
        "roles:create": Permission("roles:create", "Create roles"),
        "roles:update": Permission("roles:update", "Update roles"),
        "roles:delete": Permission("roles:delete", "Delete roles"),
    }
    
    # Define role hierarchies and permissions
    ROLE_PERMISSIONS = {
        "admin": {
            # Admin has all permissions
            "permissions": list(PERMISSIONS.keys()),
            "description": "Full system administrator with all permissions"
        },
        "manager": {
            "permissions": [
                "users:read",
                "inventory:read", "inventory:create", "inventory:update", "inventory:export",
                "counts:read", "counts:create", "counts:update", "counts:approve",
                "reports:read", "reports:create", "reports:export",
                "locations:read",
                "roles:read"
            ],
            "description": "Store manager with inventory and count management permissions"
        },
        "clerk": {
            "permissions": [
                "inventory:read",
                "counts:read", "counts:create", "counts:update",
                "reports:read"
            ],
            "description": "Store clerk with basic inventory and count permissions"
        },
        "viewer": {
            "permissions": [
                "inventory:read",
                "counts:read",
                "reports:read"
            ],
            "description": "Read-only access to inventory and counts"
        }
    }
    
    @classmethod
    def get_permissions_for_role(cls, role_name: str) -> Set[str]:
        """Get permissions for a specific role."""
        if role_name not in cls.ROLE_PERMISSIONS:
            return set()
        return set(cls.ROLE_PERMISSIONS[role_name]["permissions"])
    
    @classmethod
    def get_all_permissions(cls) -> Set[str]:
        """Get all available permissions."""
        return set(cls.PERMISSIONS.keys())
    
    @classmethod
    def get_role_description(cls, role_name: str) -> str:
        """Get description for a specific role."""
        if role_name not in cls.ROLE_PERMISSIONS:
            return "Unknown role"
        return cls.ROLE_PERMISSIONS[role_name]["description"]


class RBACMiddleware:
    """Role-Based Access Control middleware."""
    
    def __init__(self):
        self.role_permissions = RolePermissions()
    
    def has_permission(self, user_permissions: Set[str], required_permission: str) -> bool:
        """Check if user has the required permission."""
        return required_permission in user_permissions
    
    def has_any_permission(self, user_permissions: Set[str], required_permissions: List[str]) -> bool:
        """Check if user has any of the required permissions."""
        return any(perm in user_permissions for perm in required_permissions)
    
    def has_all_permissions(self, user_permissions: Set[str], required_permissions: List[str]) -> bool:
        """Check if user has all of the required permissions."""
        return all(perm in user_permissions for perm in required_permissions)
    
    def get_user_permissions(self, user: User, session: Session) -> Set[str]:
        """Get all permissions for a user based on their role."""
        if not user.role_id:
            return set()
        
        role = session.get(Role, user.role_id)
        if not role:
            return set()
        
        return self.role_permissions.get_permissions_for_role(role.name)


class RBACDependencies:
    """FastAPI dependencies for RBAC."""
    
    def __init__(self):
        self.rbac = RBACMiddleware()
    
    def require_permission(self, permission: str):
        """Dependency factory to require a specific permission."""
        async def _require_permission(
            current_user: User = Depends(get_current_user),
            session: Session = Depends(get_session)
        ) -> User:
            user_permissions = self.rbac.get_user_permissions(current_user, session)
            
            if not self.rbac.has_permission(user_permissions, permission):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Access denied. Required permission: {permission}"
                )
            
            return current_user
        
        return _require_permission
    
    def require_any_permission(self, permissions: List[str]):
        """Dependency factory to require any of the specified permissions."""
        async def _require_any_permission(
            current_user: User = Depends(get_current_user),
            session: Session = Depends(get_session)
        ) -> User:
            user_permissions = self.rbac.get_user_permissions(current_user, session)
            
            if not self.rbac.has_any_permission(user_permissions, permissions):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Access denied. Required one of permissions: {', '.join(permissions)}"
                )
            
            return current_user
        
        return _require_any_permission
    
    def require_all_permissions(self, permissions: List[str]):
        """Dependency factory to require all of the specified permissions."""
        async def _require_all_permissions(
            current_user: User = Depends(get_current_user),
            session: Session = Depends(get_session)
        ) -> User:
            user_permissions = self.rbac.get_user_permissions(current_user, session)
            
            if not self.rbac.has_all_permissions(user_permissions, permissions):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Access denied. Required all permissions: {', '.join(permissions)}"
                )
            
            return current_user
        
        return _require_all_permissions


# Create RBAC dependencies instance
rbac_deps = RBACDependencies()

# Import the get_current_user dependency
from app.core.dependencies import get_current_user

# Predefined permission-based dependencies
require_users_read = rbac_deps.require_permission("users:read")
require_users_create = rbac_deps.require_permission("users:create")
require_users_update = rbac_deps.require_permission("users:update")
require_users_delete = rbac_deps.require_permission("users:delete")

require_inventory_read = rbac_deps.require_permission("inventory:read")
require_inventory_create = rbac_deps.require_permission("inventory:create")
require_inventory_update = rbac_deps.require_permission("inventory:update")
require_inventory_delete = rbac_deps.require_permission("inventory:delete")
require_inventory_export = rbac_deps.require_permission("inventory:export")

require_counts_read = rbac_deps.require_permission("counts:read")
require_counts_create = rbac_deps.require_permission("counts:create")
require_counts_update = rbac_deps.require_permission("counts:update")
require_counts_delete = rbac_deps.require_permission("counts:delete")
require_counts_approve = rbac_deps.require_permission("counts:approve")

require_reports_read = rbac_deps.require_permission("reports:read")
require_reports_create = rbac_deps.require_permission("reports:create")
require_reports_export = rbac_deps.require_permission("reports:export")

require_system_admin = rbac_deps.require_permission("system:admin")
require_system_config = rbac_deps.require_permission("system:config")

# Composite permissions
require_inventory_management = rbac_deps.require_any_permission([
    "inventory:create", "inventory:update", "inventory:delete"
])

require_count_management = rbac_deps.require_any_permission([
    "counts:create", "counts:update", "counts:delete", "counts:approve"
])

require_admin_access = rbac_deps.require_permission("system:admin") 