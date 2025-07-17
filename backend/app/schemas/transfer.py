from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class TransferBase(BaseModel):
    item_id: int
    from_location_id: int
    to_location_id: int
    quantity: float = Field(..., ge=0)
    transferred_at: datetime

class TransferCreate(TransferBase):
    pass

class TransferUpdate(BaseModel):
    item_id: Optional[int] = None
    from_location_id: Optional[int] = None
    to_location_id: Optional[int] = None
    quantity: Optional[float] = Field(None, ge=0)
    transferred_at: Optional[datetime] = None

class TransferRead(TransferBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True 