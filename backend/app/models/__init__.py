# Import all models for Alembic to discover them
from .user import User
from .role import Role
from .location import Location
from .category import Category
from .inventory_item import InventoryItem
from .count import Count
from .transfer import Transfer
from .schedule import Schedule

# This ensures all models are imported and registered with SQLModel
__all__ = [
    "User",
    "Role", 
    "Location",
    "Category",
    "InventoryItem",
    "Count",
    "Transfer",
    "Schedule"
] 