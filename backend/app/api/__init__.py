from .user import router as user_router
from .role import router as role_router
from .location import router as location_router
from .category import router as category_router
from .inventory_item import router as inventory_item_router
from .count import router as count_router
from .transfer import router as transfer_router
from .schedule import router as schedule_router
from .auth import router as auth_router
from .rbac import router as rbac_router

all_routers = [
    auth_router,
    rbac_router,
    user_router,
    role_router,
    location_router,
    category_router,
    inventory_item_router,
    count_router,
    transfer_router,
    schedule_router,
] 