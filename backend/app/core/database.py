from sqlmodel import SQLModel, create_engine, Session
from sqlalchemy.pool import StaticPool, QueuePool
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import event
import logging
from typing import Generator, Optional
from contextlib import contextmanager
from .config import settings

# Configure logging
logger = logging.getLogger(__name__)

# Database engine configuration
def create_database_engine():
    """Create and configure the database engine based on environment."""
    if settings.DATABASE_URL.startswith("sqlite"):
        # SQLite configuration for development
        engine = create_engine(
            settings.DATABASE_URL,
            connect_args={"check_same_thread": False},
            poolclass=StaticPool,
            echo=settings.DEBUG,  # Log SQL queries in debug mode
        )
    else:
        # PostgreSQL configuration for production
        engine = create_engine(
            settings.DATABASE_URL,
            poolclass=QueuePool,
            pool_size=10,
            max_overflow=20,
            pool_pre_ping=True,
            pool_recycle=300,
            echo=settings.DEBUG,
        )
    
    return engine

# Create the engine
engine = create_database_engine()

# Database session management
class DatabaseManager:
    """Manages database connections and sessions."""
    
    def __init__(self, engine):
        self.engine = engine
    
    def get_session(self) -> Generator[Session, None, None]:
        """Dependency for FastAPI to get database sessions."""
        session = Session(self.engine)
        try:
            yield session
        except SQLAlchemyError as e:
            logger.error(f"Database error: {e}")
            session.rollback()
            raise
        finally:
            session.close()
    
    @contextmanager
    def get_session_context(self):
        """Context manager for database sessions."""
        session = Session(self.engine)
        try:
            yield session
            session.commit()
        except SQLAlchemyError as e:
            logger.error(f"Database error: {e}")
            session.rollback()
            raise
        finally:
            session.close()
    
    def create_tables(self):
        """Create all database tables."""
        try:
            SQLModel.metadata.create_all(self.engine)
            logger.info("Database tables created successfully")
        except SQLAlchemyError as e:
            logger.error(f"Failed to create tables: {e}")
            raise
    
    def drop_tables(self):
        """Drop all database tables (use with caution)."""
        try:
            SQLModel.metadata.drop_all(self.engine)
            logger.info("Database tables dropped successfully")
        except SQLAlchemyError as e:
            logger.error(f"Failed to drop tables: {e}")
            raise
    
    def check_connection(self) -> bool:
        """Check if database connection is working."""
        try:
            with self.engine.connect() as connection:
                # Use text() for SQLAlchemy 1.4 compatibility
                from sqlalchemy import text
                connection.execute(text("SELECT 1"))
            return True
        except SQLAlchemyError as e:
            logger.error(f"Database connection failed: {e}")
            return False

# Create database manager instance
db_manager = DatabaseManager(engine)

# FastAPI dependency for database sessions
def get_session() -> Generator[Session, None, None]:
    """FastAPI dependency for database sessions."""
    return db_manager.get_session()

# Database utilities
def get_db_session() -> Session:
    """Get a database session (use with context manager)."""
    return Session(engine)

@contextmanager
def get_db_context():
    """Context manager for database operations."""
    session = Session(engine)
    try:
        yield session
        session.commit()
    except SQLAlchemyError as e:
        logger.error(f"Database error: {e}")
        session.rollback()
        raise
    finally:
        session.close()

# Database health check
def check_database_health() -> dict:
    """Check database health and return status."""
    try:
        is_connected = db_manager.check_connection()
        return {
            "status": "healthy" if is_connected else "unhealthy",
            "connected": is_connected,
            "database_url": settings.DATABASE_URL.split("@")[-1] if "@" in settings.DATABASE_URL else "sqlite",
        }
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        return {
            "status": "error",
            "connected": False,
            "error": str(e),
        }

# Create all tables function (for Alembic compatibility)
def create_db_and_tables():
    """Create all database tables."""
    db_manager.create_tables()

# For Alembic
def get_metadata():
    """Get SQLModel metadata for Alembic."""
    return SQLModel.metadata

# Database event listeners
@event.listens_for(engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    """Set SQLite pragmas for better performance."""
    if settings.DATABASE_URL.startswith("sqlite"):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.execute("PRAGMA journal_mode=WAL")
        cursor.close()

# Database initialization
def init_database():
    """Initialize the database with tables and basic data."""
    try:
        # Create tables
        create_db_and_tables()
        
        # Check connection
        if not db_manager.check_connection():
            raise Exception("Database connection failed")
        
        logger.info("Database initialized successfully")
        return True
    except Exception as e:
        logger.error(f"Database initialization failed: {e}")
        raise 