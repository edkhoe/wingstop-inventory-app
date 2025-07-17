from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlmodel import Session, select
from typing import List, Optional
from app.models.category import Category
from app.schemas.category import CategoryRead, CategoryCreate, CategoryUpdate
from app.core.database import get_session

router = APIRouter(prefix="/categories", tags=["Categories"])

@router.get("/", response_model=List[CategoryRead])
def list_categories(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of records to return"),
    search: Optional[str] = Query(None, description="Search term for category name"),
    session: Session = Depends(get_session)
):
    """List categories with pagination and search."""
    query = select(Category)
    
    # Add search filter if provided (simplified for now)
    if search:
        # For now, just filter by exact name match
        query = query.where(Category.name == search)
    
    # Add pagination
    query = query.offset(skip).limit(limit)
    
    return session.exec(query).all()

@router.get("/{category_id}", response_model=CategoryRead)
def get_category(category_id: int, session: Session = Depends(get_session)):
    category = session.get(Category, category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return category

@router.post("/", response_model=CategoryRead, status_code=status.HTTP_201_CREATED)
def create_category(category: CategoryCreate, session: Session = Depends(get_session)):
    # Check for duplicate name
    existing_category = session.exec(
        select(Category).where(Category.name == category.name)
    ).first()
    if existing_category:
        raise HTTPException(
            status_code=409, 
            detail="Category with this name already exists"
        )
    
    db_category = Category(**category.dict())
    session.add(db_category)
    session.commit()
    session.refresh(db_category)
    return db_category

@router.put("/{category_id}", response_model=CategoryRead)
def update_category(category_id: int, category: CategoryUpdate, session: Session = Depends(get_session)):
    db_category = session.get(Category, category_id)
    if not db_category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    # Check for duplicate name if name is being updated
    if category.name and category.name != db_category.name:
        existing_category = session.exec(
            select(Category).where(Category.name == category.name)
        ).first()
        if existing_category:
            raise HTTPException(
                status_code=409, 
                detail="Category with this name already exists"
            )
    
    category_data = category.dict(exclude_unset=True)
    for key, value in category_data.items():
        setattr(db_category, key, value)
    session.add(db_category)
    session.commit()
    session.refresh(db_category)
    return db_category

@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(category_id: int, session: Session = Depends(get_session)):
    db_category = session.get(Category, category_id)
    if not db_category:
        raise HTTPException(status_code=404, detail="Category not found")
    session.delete(db_category)
    session.commit()
    return None 