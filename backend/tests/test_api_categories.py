import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session
import uuid

from app.models.category import Category


class TestCategoryAPI:
    """Test cases for Category API endpoints."""

    def test_list_categories(self, client: TestClient, test_data):
        """Test GET /api/v1/categories/ endpoint."""
        response = client.get("/api/v1/categories/")
        assert response.status_code == 200
        categories = response.json()
        assert isinstance(categories, list)
        assert len(categories) >= 1  # At least the test category

        # Check category structure
        category = categories[0]
        assert "id" in category
        assert "name" in category
        assert "description" in category
        assert "color" in category  # Added color field

    def test_get_category(self, client: TestClient, test_data):
        """Test GET /api/v1/categories/{category_id} endpoint."""
        category = test_data["category"]
        response = client.get(f"/api/v1/categories/{category.id}")
        assert response.status_code == 200

        category_data = response.json()
        assert category_data["id"] == category.id
        assert category_data["name"] == category.name
        assert category_data["description"] == category.description
        assert category_data["color"] == category.color  # Added color field

    def test_get_category_not_found(self, client: TestClient):
        """Test GET /api/v1/categories/{category_id} with non-existent category."""
        response = client.get("/api/v1/categories/99999")
        assert response.status_code == 404
        assert "Category not found" in response.json()["detail"]

    def test_create_category(self, client: TestClient, test_session: Session):
        """Test POST /api/v1/categories/ endpoint."""
        unique_name = f"Test Category {uuid.uuid4()}"
        new_category_data = {
            "name": unique_name,
            "description": "Test category for testing",
            "color": "#FF5733"  # Added required color field
        }

        response = client.post("/api/v1/categories/", json=new_category_data)
        assert response.status_code == 201

        category_data = response.json()
        assert category_data["name"] == new_category_data["name"]
        assert category_data["description"] == new_category_data["description"]
        assert category_data["color"] == new_category_data["color"]  # Added color field

    def test_create_category_duplicate_name(self, client: TestClient, test_data):
        """Test POST /api/v1/categories/ with duplicate name."""
        existing_category = test_data["category"]

        new_category_data = {
            "name": existing_category.name,  # Duplicate name
            "description": "Different description",
            "color": "#FF5733"  # Added required color field
        }

        response = client.post("/api/v1/categories/", json=new_category_data)
        # Should fail due to unique constraint - now returns 409
        assert response.status_code == 409
        assert "Category with this name already exists" in response.json()["detail"]

    def test_update_category(self, client: TestClient, test_data):
        """Test PUT /api/v1/categories/{category_id} endpoint."""
        category = test_data["category"]

        update_data = {
            "name": "Updated Category Name",
            "description": "Updated description",
            "color": "#33FF57"  # Added color field
        }

        response = client.put(f"/api/v1/categories/{category.id}", json=update_data)
        assert response.status_code == 200

        category_data = response.json()
        assert category_data["name"] == update_data["name"]
        assert category_data["description"] == update_data["description"]
        assert category_data["color"] == update_data["color"]  # Added color field

    def test_update_category_not_found(self, client: TestClient):
        """Test PUT /api/v1/categories/{category_id} with non-existent category."""
        update_data = {
            "name": "Updated Category Name",
            "color": "#33FF57"  # Added color field
        }

        response = client.put("/api/v1/categories/99999", json=update_data)
        assert response.status_code == 404
        assert "Category not found" in response.json()["detail"]

    def test_delete_category(self, client: TestClient, test_data):
        """Test DELETE /api/v1/categories/{category_id} endpoint."""
        category = test_data["category"]

        response = client.delete(f"/api/v1/categories/{category.id}")
        assert response.status_code == 204

        # Verify category was deleted
        get_response = client.get(f"/api/v1/categories/{category.id}")
        assert get_response.status_code == 404

    def test_delete_category_not_found(self, client: TestClient):
        """Test DELETE /api/v1/categories/{category_id} with non-existent category."""
        response = client.delete("/api/v1/categories/99999")
        assert response.status_code == 404
        assert "Category not found" in response.json()["detail"]

    def test_category_pagination(self, client: TestClient, test_session: Session):
        """Test category pagination."""
        # Create additional categories for pagination testing
        for i in range(15):
            short_uuid = str(uuid.uuid4())[:8]
            unique_name = f"Cat{i}_{short_uuid}"
            category_data = {
                "name": unique_name,
                "description": f"Test category {i} for pagination testing",
                "color": f"#{i:06x}"  # Added color field
            }
            response = client.post("/api/v1/categories/", json=category_data)
            if response.status_code != 201:
                print(f"Failed to create category {i}: {response.status_code}")
                print(f"Request data: {category_data}")
                print(f"Response: {response.json()}")
            assert response.status_code == 201

        # Test pagination
        response = client.get("/api/v1/categories/?skip=0&limit=5")
        assert response.status_code == 200
        categories = response.json()
        assert len(categories) <= 5

    def test_category_color_validation(self, client: TestClient):
        """Test category color validation."""
        # Test valid hex colors
        valid_colors = ["#FF5733", "#33FF57", "#3357FF", "#F0F0F0", "#000000"]

        for i, color in enumerate(valid_colors):
            short_uuid = str(uuid.uuid4())[:8]
            unique_name = f"Color{i}_{short_uuid}"
            category_data = {
                "name": unique_name,
                "description": f"Test category with color {color}",
                "color": color
            }
            response = client.post("/api/v1/categories/", json=category_data)
            if response.status_code != 201:
                print(f"Failed to create category {i}: {response.status_code}")
                print(f"Request data: {category_data}")
                print(f"Response: {response.json()}")
            assert response.status_code == 201

        # Test invalid hex colors
        invalid_colors = ["#GGGGGG", "#12345", "FF5733", "#FF573", "#FF57333"]

        for i, color in enumerate(invalid_colors):
            short_uuid = str(uuid.uuid4())[:8]
            unique_name = f"BadColor{i}_{short_uuid}"
            category_data = {
                "name": unique_name,
                "description": f"Test category with invalid color {color}",
                "color": color
            }
            response = client.post("/api/v1/categories/", json=category_data)
            assert response.status_code == 422  # Validation error

    def test_category_name_validation(self, client: TestClient):
        """Test category name validation."""
        # Test valid names
        valid_names = ["Test Category", "AB", "B" * 50]  # Min 2, max 50 characters

        for i, name in enumerate(valid_names):
            short_uuid = str(uuid.uuid4())[:8]
            # Truncate if needed to fit 50 chars
            max_name_len = 50 - len(short_uuid) - 1
            safe_name = name[:max_name_len]
            category_data = {
                "name": f"{safe_name}_{short_uuid}",
                "description": f"Test category with name {name}",
                "color": "#FF5733"  # Added color field
            }
            response = client.post("/api/v1/categories/", json=category_data)
            if response.status_code != 201:
                print(f"Failed to create category {i}: {response.status_code}")
                print(f"Request data: {category_data}")
                print(f"Response: {response.json()}")
            assert response.status_code == 201

        # Test invalid names
        invalid_names = ["", "A"]  # Too short

        for i, name in enumerate(invalid_names):
            short_uuid = str(uuid.uuid4())[:8]
            unique_name = f"BadName{i}_{short_uuid}"
            category_data = {
                "name": name,
                "description": f"Test category with invalid name {name}",
                "color": "#FF5733"  # Added color field
            }
            response = client.post("/api/v1/categories/", json=category_data)
            assert response.status_code == 422  # Validation error 