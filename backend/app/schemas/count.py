from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class CountBase(BaseModel):
    item_id: int
    user_id: int
    location_id: int
    quantity: float = Field(..., ge=0)
    counted_at: datetime

class CountCreate(CountBase):
    pass

class CountUpdate(BaseModel):
    item_id: Optional[int] = None
    user_id: Optional[int] = None
    location_id: Optional[int] = None
    quantity: Optional[float] = Field(None, ge=0)
    counted_at: Optional[datetime] = None

class CountRead(CountBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True 