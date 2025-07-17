import pytest
import asyncio
from typing import Generator
from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine
from sqlalchemy.pool import StaticPool
from main import app
from app.core.database import get_session
from app.models import User, Role, Location, Category, InventoryItem, Count, Transfer, Schedule
from app.core.security import AuthenticationManager
from datetime import datetime, timedelta
import uuid

# Test database URL
TEST_DATABASE_URL = "sqlite:///./test.db"

auth_manager = AuthenticationManager()

@pytest.fixture(scope="session")
def event_loop():
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

@pytest.fixture(scope="session")
def test_engine():
    engine = create_engine(
        TEST_DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(bind=engine)
    yield engine
    SQLModel.metadata.drop_all(bind=engine)

@pytest.fixture
def test_session(test_engine) -> Generator[Session, None, None]:
    with Session(test_engine) as session:
        yield session

@pytest.fixture
def client(test_session) -> Generator[TestClient, None, None]:
    def override_get_session():
        yield test_session
    app.dependency_overrides[get_session] = override_get_session
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()

@pytest.fixture
def sample_role(test_session) -> Role:
    unique_name = f"Test Role {uuid.uuid4()}"
    role = Role(
        name=unique_name,
        description="Test role for testing"
    )
    test_session.add(role)
    test_session.commit()
    test_session.refresh(role)
    return role

@pytest.fixture
def sample_location(test_session) -> Location:
    unique_name = f"Test Location {uuid.uuid4()}"
    location = Location(
        name=unique_name,
        address="123 Test St",
        city="Test City",
        state="TX",
        zip_code="12345",
        phone="555-1234"
    )
    test_session.add(location)
    test_session.commit()
    test_session.refresh(location)
    return location

@pytest.fixture
def sample_user(test_session, sample_role) -> User:
    unique_username = f"testuser_{uuid.uuid4()}"
    unique_email = f"test_{uuid.uuid4()}@wingstop.com"
    user = User(
        username=unique_username,
        email=unique_email,
        hashed_password=auth_manager.hash_password("TestPassword123!"),
        is_active=True,
        role_id=sample_role.id
    )
    test_session.add(user)
    test_session.commit()
    test_session.refresh(user)
    return user

@pytest.fixture
def sample_category(test_session) -> Category:
    unique_name = f"Test Category {uuid.uuid4()}"
    category = Category(
        name=unique_name,
        description="Test category for testing",
        color="#FF5733"  # Added required color field
    )
    test_session.add(category)
    test_session.commit()
    test_session.refresh(category)
    return category

@pytest.fixture
def sample_inventory_item(test_session, sample_category) -> InventoryItem:
    item = InventoryItem(
        name="Test Item",
        category_id=sample_category.id,
        unit="lbs",
        par_level=10.0,
        reorder_increment=5.0,
        vendor="Test Vendor",
        sku="TEST-001"
    )
    test_session.add(item)
    test_session.commit()
    test_session.refresh(item)
    return item

@pytest.fixture
def sample_count(test_session, sample_user, sample_inventory_item, sample_location) -> Count:
    count = Count(
        item_id=sample_inventory_item.id,
        location_id=sample_location.id,
        user_id=sample_user.id,
        quantity=15.0
    )
    test_session.add(count)
    test_session.commit()
    test_session.refresh(count)
    return count

@pytest.fixture
def sample_transfer(test_session, sample_user, sample_inventory_item, sample_location) -> Transfer:
    transfer = Transfer(
        item_id=sample_inventory_item.id,
        from_location_id=sample_location.id,
        to_location_id=sample_location.id,
        quantity=5.0,
        transferred_by=sample_user.id
    )
    test_session.add(transfer)
    test_session.commit()
    test_session.refresh(transfer)
    return transfer

@pytest.fixture
def sample_schedule(test_session, sample_user, sample_location) -> Schedule:
    schedule = Schedule(
        location_id=sample_location.id,
        event_type="Test Event",
        scheduled_for=datetime.utcnow(),
        created_by=sample_user.id
    )
    test_session.add(schedule)
    test_session.commit()
    test_session.refresh(schedule)
    return schedule

@pytest.fixture
def auth_headers(client, sample_user):
    return {}

@pytest.fixture
def test_data(test_session, sample_role, sample_location, sample_user,
              sample_category, sample_inventory_item, sample_count):
    # Create additional test data with unique names and required color field
    additional_categories = [
        Category(
            name=f"Chicken {uuid.uuid4()}", 
            description="Chicken products",
            color="#FF6B6B"  # Added color field
        ),
        Category(
            name=f"Sauces {uuid.uuid4()}", 
            description="Wing sauces",
            color="#4ECDC4"  # Added color field
        ),
        Category(
            name=f"Sides {uuid.uuid4()}", 
            description="Side dishes",
            color="#45B7D1"  # Added color field
        )
    ]
    for category in additional_categories:
        test_session.add(category)
    test_session.commit()  # Commit to get IDs
    
    additional_items = [
        InventoryItem(
            name="Chicken Wings",
            category_id=sample_category.id,
            unit="lbs",
            par_level=50.0,
            reorder_increment=25.0,
            vendor="Chicken Supplier",
            sku="CHK-001"
        ),
        InventoryItem(
            name="Hot Sauce",
            category_id=sample_category.id,
            unit="bottles",
            par_level=20.0,
            reorder_increment=10.0,
            vendor="Sauce Supplier",
            sku="SAU-001"
        )
    ]
    for item in additional_items:
        test_session.add(item)
    test_session.commit()
    
    return {
        "role": sample_role,
        "location": sample_location,
        "user": sample_user,
        "category": sample_category,
        "inventory_item": sample_inventory_item,
        "count": sample_count,
        "additional_categories": additional_categories,
        "additional_items": additional_items
    } 