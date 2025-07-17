from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime
import re

class CategoryBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=50)
    description: Optional[str] = None
    color: Optional[str] = Field(default="#FF5733", description="Hex color code for the category")
    
    @validator('color')
    def validate_color(cls, v):
        if v is not None:
            # Check if it's a valid hex color code
            if not re.match(r'^#[0-9A-Fa-f]{6}$', v):
                raise ValueError('Color must be a valid hex color code (e.g., #FF5733)')
        return v

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=50)
    description: Optional[str] = None
    color: Optional[str] = Field(None, description="Hex color code for the category")
    
    @validator('color')
    def validate_color(cls, v):
        if v is not None:
            # Check if it's a valid hex color code
            if not re.match(r'^#[0-9A-Fa-f]{6}$', v):
                raise ValueError('Color must be a valid hex color code (e.g., #FF5733)')
        return v

class CategoryRead(CategoryBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True 