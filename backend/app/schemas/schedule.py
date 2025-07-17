from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class ScheduleBase(BaseModel):
    location_id: int
    name: str = Field(..., min_length=2, max_length=100)
    description: Optional[str] = None
    start_time: datetime
    recurrence: Optional[str] = None

class ScheduleCreate(ScheduleBase):
    pass

class ScheduleUpdate(BaseModel):
    location_id: Optional[int] = None
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    description: Optional[str] = None
    start_time: Optional[datetime] = None
    recurrence: Optional[str] = None

class ScheduleRead(ScheduleBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True 