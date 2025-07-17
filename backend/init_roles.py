#!/usr/bin/env python3
"""
Initialize default roles for the RBAC system.
This script creates the default roles (admin, manager, clerk, viewer) in the database.
"""

import sys
import os
from pathlib import Path

# Add the backend directory to the Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

from sqlmodel import Session, select
from app.core.database import get_session, init_database
from app.models.role import Role
from app.core.rbac import RolePermissions
from app.core.logging import get_logger

logger = get_logger(__name__)


def init_default_roles():
    """Initialize default roles in the database."""
    try:
        # Initialize database
        init_database()
        
        # Get database session
        session = next(get_session())
        
        # Get existing roles
        existing_roles = session.exec(select(Role)).all()
        existing_role_names = {role.name for role in existing_roles}
        
        # Define default roles
        default_roles = [
            {
                "name": "admin",
                "description": "Full system administrator with all permissions"
            },
            {
                "name": "manager", 
                "description": "Store manager with inventory and count management permissions"
            },
            {
                "name": "clerk",
                "description": "Store clerk with basic inventory and count permissions"
            },
            {
                "name": "viewer",
                "description": "Read-only access to inventory and counts"
            }
        ]
        
        created_roles = []
        updated_roles = []
        
        for role_data in default_roles:
            role_name = role_data["name"]
            
            if role_name in existing_role_names:
                # Update existing role
                role = session.exec(select(Role).where(Role.name == role_name)).first()
                if role and role.description != role_data["description"]:
                    role.description = role_data["description"]
                    session.add(role)
                    updated_roles.append(role_name)
                    logger.info(f"Updated role: {role_name}")
            else:
                # Create new role
                role = Role(
                    name=role_name,
                    description=role_data["description"]
                )
                session.add(role)
                created_roles.append(role_name)
                logger.info(f"Created role: {role_name}")
        
        # Commit changes
        session.commit()
        
        # Log summary
        if created_roles:
            logger.info(f"Created roles: {', '.join(created_roles)}")
        if updated_roles:
            logger.info(f"Updated roles: {', '.join(updated_roles)}")
        if not created_roles and not updated_roles:
            logger.info("All default roles already exist and are up to date")
        
        # Display role permissions
        logger.info("\nRole Permissions Summary:")
        for role_name in ["admin", "manager", "clerk", "viewer"]:
            permissions = RolePermissions.get_permissions_for_role(role_name)
            logger.info(f"{role_name}: {len(permissions)} permissions")
            for perm in sorted(permissions):
                logger.info(f"  - {perm}")
        
        logger.info("\nRole initialization completed successfully!")
        
    except Exception as e:
        logger.error(f"Error initializing roles: {e}")
        raise
    finally:
        session.close()


if __name__ == "__main__":
    print("Initializing default roles for RBAC system...")
    init_default_roles()
    print("Role initialization completed!") 