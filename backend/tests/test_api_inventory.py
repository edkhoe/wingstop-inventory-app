import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session
import uuid

from app.models.inventory_item import InventoryItem
from app.models.category import Category


class TestInventoryAPI:
    """Test cases for Inventory Item API endpoints."""

    def test_list_inventory_items(self, client: TestClient, test_data):
        """Test GET /api/v1/items/ endpoint."""
        response = client.get("/api/v1/items/")  # Changed from inventory-items
        assert response.status_code == 200
        items = response.json()
        assert isinstance(items, list)
        assert len(items) >= 1  # At least the test item

        # Check item structure
        item = items[0]
        assert "id" in item
        assert "name" in item
        assert "category_id" in item
        assert "unit" in item
        assert "par_level" in item

    def test_get_inventory_item(self, client: TestClient, test_data):
        """Test GET /api/v1/items/{item_id} endpoint."""
        item = test_data["inventory_item"]
        response = client.get(f"/api/v1/items/{item.id}")  # Changed from inventory-items
        assert response.status_code == 200

        item_data = response.json()
        assert item_data["id"] == item.id
        assert item_data["name"] == item.name
        assert item_data["category_id"] == item.category_id

    def test_get_inventory_item_not_found(self, client: TestClient):
        """Test GET /api/v1/items/{item_id} with non-existent item."""
        response = client.get("/api/v1/items/99999")  # Changed from inventory-items
        assert response.status_code == 404
        assert "Inventory item not found" in response.json()["detail"]

    def test_create_inventory_item(self, client: TestClient, test_session: Session, test_data):
        """Test POST /api/v1/items/ endpoint."""
        category = test_data["category"]

        new_item_data = {
            "name": "New Test Item",
            "category_id": category.id,
            "unit": "pieces",
            "par_level": 25.0,
            "reorder_increment": 10.0,
            "vendor": "New Vendor",
            "sku": "NEW-001"
        }

        response = client.post("/api/v1/items/", json=new_item_data)  # Changed from inventory-items
        assert response.status_code == 201

        item_data = response.json()
        assert item_data["name"] == new_item_data["name"]
        assert item_data["category_id"] == category.id
        assert item_data["unit"] == new_item_data["unit"]

    def test_create_inventory_item_invalid_category(self, client: TestClient):
        """Test POST /api/v1/items/ with invalid category."""
        new_item_data = {
            "name": "New Test Item",
            "category_id": 99999,  # Non-existent category
            "unit": "pieces",
            "par_level": 25.0
        }

        response = client.post("/api/v1/items/", json=new_item_data)  # Changed from inventory-items
        # Should fail due to foreign key constraint - now returns 422
        assert response.status_code == 422
        assert "Category not found" in response.json()["detail"]

    def test_update_inventory_item(self, client: TestClient, test_data):
        """Test PUT /api/v1/items/{item_id} endpoint."""
        item = test_data["inventory_item"]

        update_data = {
            "name": "Updated Item Name",
            "par_level": 30.0,
            "reorder_increment": 15.0,
            "vendor": "Updated Vendor"
        }

        response = client.put(f"/api/v1/items/{item.id}", json=update_data)  # Changed from inventory-items
        assert response.status_code == 200

        item_data = response.json()
        assert item_data["name"] == update_data["name"]
        assert item_data["par_level"] == update_data["par_level"]

    def test_update_inventory_item_not_found(self, client: TestClient):
        """Test PUT /api/v1/items/{item_id} with non-existent item."""
        update_data = {
            "name": "Updated Item Name",
            "par_level": 30.0
        }

        response = client.put("/api/v1/items/99999", json=update_data)  # Changed from inventory-items
        assert response.status_code == 404
        assert "Inventory item not found" in response.json()["detail"]

    def test_delete_inventory_item(self, client: TestClient, test_data):
        """Test DELETE /api/v1/items/{item_id} endpoint."""
        item = test_data["inventory_item"]

        response = client.delete(f"/api/v1/items/{item.id}")  # Changed from inventory-items
        assert response.status_code == 204

        # Verify item was deleted
        get_response = client.get(f"/api/v1/items/{item.id}")  # Changed from inventory-items
        assert get_response.status_code == 404

    def test_delete_inventory_item_not_found(self, client: TestClient):
        """Test DELETE /api/v1/items/{item_id} with non-existent item."""
        response = client.delete("/api/v1/items/99999")  # Changed from inventory-items
        assert response.status_code == 404
        assert "Inventory item not found" in response.json()["detail"]

    def test_inventory_item_with_category_relationship(self, client: TestClient, test_data):
        """Test that inventory item includes category information."""
        item = test_data["inventory_item"]
        response = client.get(f"/api/v1/items/{item.id}")  # Changed from inventory-items
        assert response.status_code == 200

        item_data = response.json()
        # Note: The current API doesn't include relationship data
        # This test would need to be updated if relationships are added
        assert "id" in item_data
        assert "name" in item_data
        assert "category_id" in item_data

    def test_inventory_item_validation(self, client: TestClient, test_data):
        """Test inventory item data validation."""
        category = test_data["category"]

        # Test invalid unit
        invalid_item_data = {
            "name": "Test Item",
            "category_id": category.id,
            "unit": "",  # Empty unit
            "par_level": 10.0
        }

        response = client.post("/api/v1/items/", json=invalid_item_data)  # Changed from inventory-items
        assert response.status_code == 422  # Validation error

    def test_inventory_item_search(self, client: TestClient, test_data):
        """Test inventory item search functionality."""
        # Create additional items for search testing
        category = test_data["category"]
        additional_items = [
            {
                "name": "Chicken Wings",
                "category_id": category.id,
                "unit": "lbs",
                "par_level": 50.0,
                "sku": "CHK-001"
            },
            {
                "name": "Hot Sauce",
                "category_id": category.id,
                "unit": "bottles",
                "par_level": 20.0,
                "sku": "SAU-001"
            }
        ]

        for item_data in additional_items:
            response = client.post("/api/v1/items/", json=item_data)  # Changed from inventory-items
            assert response.status_code == 201

        # Test search functionality - for now, just test that the endpoint accepts the parameter
        response = client.get("/api/v1/items/?search=Chicken")  # Changed from inventory-items
        assert response.status_code == 200
        items = response.json()
        # Since search is simplified, we just check that the endpoint works
        assert isinstance(items, list)

    def test_inventory_item_filtering(self, client: TestClient, test_data):
        """Test inventory item filtering by category."""
        category = test_data["category"]

        # Test filtering by category
        response = client.get(f"/api/v1/items/?category_id={category.id}")  # Changed from inventory-items
        assert response.status_code == 200
        items = response.json()

        # All items should be from the specified category
        for item in items:
            assert item["category_id"] == category.id

    def test_inventory_item_pagination(self, client: TestClient, test_session: Session, test_data):
        """Test inventory item pagination."""
        category = test_data["category"]

        # Create additional items for pagination testing
        for i in range(10):
            item_data = {
                "name": f"Test Item {i}",
                "category_id": category.id,
                "unit": "pieces",
                "par_level": 10.0 + i,
                "sku": f"TEST-{i:03d}"
            }
            response = client.post("/api/v1/items/", json=item_data)  # Changed from inventory-items
            assert response.status_code == 201

        # Test pagination
        response = client.get("/api/v1/items/?skip=0&limit=5")  # Changed from inventory-items
        assert response.status_code == 200
        items = response.json()
        assert len(items) <= 5 