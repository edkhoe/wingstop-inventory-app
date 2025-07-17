from sqlmodel import Session, select, SQLModel
from sqlalchemy.exc import SQLAlchemyError
from typing import TypeVar, Generic, Type, List, Optional, Any, Dict
from pydantic import BaseModel
import logging

logger = logging.getLogger(__name__)

# Generic type for SQLModel
T = TypeVar('T', bound=SQLModel)

class DatabaseUtils:
    """Utility class for common database operations."""
    
    @staticmethod
    def get_by_id(session: Session, model: Type[T], id: int) -> Optional[T]:
        """Get a record by ID."""
        try:
            return session.get(model, id)
        except SQLAlchemyError as e:
            logger.error(f"Error getting {model.__name__} by ID {id}: {e}")
            raise
    
    @staticmethod
    def get_all(session: Session, model: Type[T], skip: int = 0, limit: int = 100) -> List[T]:
        """Get all records with pagination."""
        try:
            statement = select(model).offset(skip).limit(limit)
            return list(session.exec(statement).all())
        except SQLAlchemyError as e:
            logger.error(f"Error getting all {model.__name__}: {e}")
            raise
    
    @staticmethod
    def create(session: Session, model: Type[T], **kwargs) -> T:
        """Create a new record."""
        try:
            db_obj = model(**kwargs)
            session.add(db_obj)
            session.commit()
            session.refresh(db_obj)
            return db_obj
        except SQLAlchemyError as e:
            logger.error(f"Error creating {model.__name__}: {e}")
            session.rollback()
            raise
    
    @staticmethod
    def update(session: Session, model: Type[T], id: int, **kwargs) -> Optional[T]:
        """Update a record by ID."""
        try:
            db_obj = session.get(model, id)
            if not db_obj:
                return None
            
            for key, value in kwargs.items():
                if hasattr(db_obj, key):
                    setattr(db_obj, key, value)
            
            session.add(db_obj)
            session.commit()
            session.refresh(db_obj)
            return db_obj
        except SQLAlchemyError as e:
            logger.error(f"Error updating {model.__name__} {id}: {e}")
            session.rollback()
            raise
    
    @staticmethod
    def delete(session: Session, model: Type[T], id: int) -> bool:
        """Delete a record by ID."""
        try:
            db_obj = session.get(model, id)
            if not db_obj:
                return False
            
            session.delete(db_obj)
            session.commit()
            return True
        except SQLAlchemyError as e:
            logger.error(f"Error deleting {model.__name__} {id}: {e}")
            session.rollback()
            raise
    
    @staticmethod
    def count(session: Session, model: Type[T]) -> int:
        """Count total records."""
        try:
            statement = select(model)
            return len(session.exec(statement).all())
        except SQLAlchemyError as e:
            logger.error(f"Error counting {model.__name__}: {e}")
            raise
    
    @staticmethod
    def exists(session: Session, model: Type[T], **filters) -> bool:
        """Check if a record exists with given filters."""
        try:
            statement = select(model)
            for key, value in filters.items():
                if hasattr(model, key):
                    statement = statement.where(getattr(model, key) == value)
            
            result = session.exec(statement).first()
            return result is not None
        except SQLAlchemyError as e:
            logger.error(f"Error checking existence of {model.__name__}: {e}")
            raise

class PaginationParams(BaseModel):
    """Pagination parameters."""
    page: int = 1
    size: int = 20
    max_size: int = 100
    
    @property
    def skip(self) -> int:
        return (self.page - 1) * self.size
    
    @property
    def limit(self) -> int:
        return min(self.size, self.max_size)

class PaginatedResponse(BaseModel, Generic[T]):
    """Paginated response model."""
    items: List[T]
    total: int
    page: int
    size: int
    pages: int
    
    @property
    def has_next(self) -> bool:
        return self.page < self.pages
    
    @property
    def has_prev(self) -> bool:
        return self.page > 1

def paginate_query(
    session: Session, 
    model: Type[T], 
    pagination: PaginationParams,
    **filters
) -> PaginatedResponse[T]:
    """Execute a paginated query."""
    try:
        # Build base query
        statement = select(model)
        
        # Apply filters
        for key, value in filters.items():
            if hasattr(model, key):
                statement = statement.where(getattr(model, key) == value)
        
        # Get total count
        total_statement = select(model)
        for key, value in filters.items():
            if hasattr(model, key):
                total_statement = total_statement.where(getattr(model, key) == value)
        total = len(session.exec(total_statement).all())
        
        # Apply pagination
        statement = statement.offset(pagination.skip).limit(pagination.limit)
        items = list(session.exec(statement).all())
        
        # Calculate pages
        pages = (total + pagination.size - 1) // pagination.size
        
        return PaginatedResponse(
            items=items,
            total=total,
            page=pagination.page,
            size=pagination.size,
            pages=pages
        )
    except SQLAlchemyError as e:
        logger.error(f"Error in paginated query for {model.__name__}: {e}")
        raise

def bulk_create(session: Session, model: Type[T], items: List[Dict[str, Any]]) -> List[T]:
    """Create multiple records in bulk."""
    try:
        db_objects = []
        for item_data in items:
            db_obj = model(**item_data)
            db_objects.append(db_obj)
            session.add(db_obj)
        
        session.commit()
        
        # Refresh all objects to get their IDs
        for db_obj in db_objects:
            session.refresh(db_obj)
        
        return db_objects
    except SQLAlchemyError as e:
        logger.error(f"Error in bulk create for {model.__name__}: {e}")
        session.rollback()
        raise

def bulk_update(session: Session, model: Type[T], updates: List[Dict[str, Any]]) -> List[T]:
    """Update multiple records in bulk."""
    try:
        updated_objects = []
        for update_data in updates:
            id = update_data.pop('id', None)
            if id is None:
                continue
            
            db_obj = session.get(model, id)
            if db_obj:
                for key, value in update_data.items():
                    if hasattr(db_obj, key):
                        setattr(db_obj, key, value)
                session.add(db_obj)
                updated_objects.append(db_obj)
        
        session.commit()
        
        # Refresh all objects
        for db_obj in updated_objects:
            session.refresh(db_obj)
        
        return updated_objects
    except SQLAlchemyError as e:
        logger.error(f"Error in bulk update for {model.__name__}: {e}")
        session.rollback()
        raise 