from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class InventoryItemBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    unit: str = Field(..., min_length=1, max_length=20)
    category_id: int
    par_level: Optional[float] = None
    reorder_increment: Optional[float] = None
    vendor: Optional[str] = None
    sku: Optional[str] = None

class InventoryItemCreate(InventoryItemBase):
    pass

class InventoryItemUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    unit: Optional[str] = Field(None, min_length=1, max_length=20)
    category_id: Optional[int] = None
    par_level: Optional[float] = None
    reorder_increment: Optional[float] = None
    vendor: Optional[str] = None
    sku: Optional[str] = None

class InventoryItemRead(InventoryItemBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True 