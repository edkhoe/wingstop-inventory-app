from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime

class Transfer(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    item_id: int = Field(foreign_key="inventoryitem.id")
    from_location_id: int = Field(foreign_key="location.id")
    to_location_id: int = Field(foreign_key="location.id")
    quantity: float
    transferred_by: int = Field(foreign_key="user.id")
    transferred_at: datetime = Field(default_factory=datetime.utcnow)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow) 