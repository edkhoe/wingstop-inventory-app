from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime

class Count(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    item_id: int = Field(foreign_key="inventoryitem.id")
    location_id: int = Field(foreign_key="location.id")
    user_id: int = Field(foreign_key="user.id")
    quantity: float
    counted_at: datetime = Field(default_factory=datetime.utcnow)
    approved: bool = Field(default=False)
    approved_by: Optional[int] = Field(default=None, foreign_key="user.id")
    approved_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow) 