from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlmodel import Session, select
from typing import List, Optional
from app.models.inventory_item import InventoryItem
from app.schemas.inventory_item import InventoryItemRead, InventoryItemCreate, InventoryItemUpdate
from app.core.database import get_session

router = APIRouter(prefix="/items", tags=["Inventory Items"])

@router.get("/", response_model=List[InventoryItemRead])
def list_items(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of records to return"),
    category_id: Optional[int] = Query(None, description="Filter by category ID"),
    search: Optional[str] = Query(None, description="Search term for item name"),
    session: Session = Depends(get_session)
):
    """List inventory items with pagination and filtering."""
    query = select(InventoryItem)
    
    # Add filters if provided
    if category_id is not None:
        query = query.where(InventoryItem.category_id == category_id)
    if search:
        # For now, just filter by exact name match
        query = query.where(InventoryItem.name == search)
    
    # Add pagination
    query = query.offset(skip).limit(limit)
    
    return session.exec(query).all()

@router.get("/{item_id}", response_model=InventoryItemRead)
def get_item(item_id: int, session: Session = Depends(get_session)):
    item = session.get(InventoryItem, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Inventory item not found")
    return item

@router.post("/", response_model=InventoryItemRead, status_code=status.HTTP_201_CREATED)
def create_item(item: InventoryItemCreate, session: Session = Depends(get_session)):
    # Check if category exists
    from app.models.category import Category
    category = session.get(Category, item.category_id)
    if not category:
        raise HTTPException(status_code=422, detail="Category not found")
    
    db_item = InventoryItem(**item.dict())
    session.add(db_item)
    session.commit()
    session.refresh(db_item)
    return db_item

@router.put("/{item_id}", response_model=InventoryItemRead)
def update_item(item_id: int, item: InventoryItemUpdate, session: Session = Depends(get_session)):
    db_item = session.get(InventoryItem, item_id)
    if not db_item:
        raise HTTPException(status_code=404, detail="Inventory item not found")
    
    # Check if category exists if category_id is being updated
    if item.category_id is not None:
        from app.models.category import Category
        category = session.get(Category, item.category_id)
        if not category:
            raise HTTPException(status_code=422, detail="Category not found")
    
    item_data = item.dict(exclude_unset=True)
    for key, value in item_data.items():
        setattr(db_item, key, value)
    session.add(db_item)
    session.commit()
    session.refresh(db_item)
    return db_item

@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_item(item_id: int, session: Session = Depends(get_session)):
    db_item = session.get(InventoryItem, item_id)
    if not db_item:
        raise HTTPException(status_code=404, detail="Inventory item not found")
    session.delete(db_item)
    session.commit()
    return None 