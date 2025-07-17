from sqlmodel import SQLModel, Field, Relationship
from typing import Optional
from datetime import datetime

class InventoryItem(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True)
    category_id: Optional[int] = Field(default=None, foreign_key="category.id")
    unit: str
    par_level: Optional[float] = None
    reorder_increment: Optional[float] = None
    vendor: Optional[str] = None
    sku: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    category: Optional["Category"] = Relationship() 