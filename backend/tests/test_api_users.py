import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session
from app.models.user import User
from app.models.role import Role
from app.models.location import Location
from app.core.security import AuthenticationManager

class TestUserAPI:
    """Test cases for User API endpoints."""
    
    def __init__(self):
        self.auth_manager = AuthenticationManager()
    
    def test_list_users(self, client: TestClient, test_data):
        """Test GET /api/v1/users/ endpoint."""
        response = client.get("/api/v1/users/")
        assert response.status_code == 200
        users = response.json()
        assert isinstance(users, list)
        assert len(users) >= 1  # At least the test user
        
        # Check user structure
        user = users[0]
        assert "id" in user
        assert "username" in user
        assert "email" in user
        assert "is_active" in user
        assert "role" in user
        assert "created_at" in user
    
    def test_get_user(self, client: TestClient, test_data):
        """Test GET /api/v1/users/{user_id} endpoint."""
        user = test_data["user"]
        response = client.get(f"/api/v1/users/{user.id}")
        assert response.status_code == 200
        
        user_data = response.json()
        assert user_data["id"] == user.id
        assert user_data["username"] == user.username
        assert user_data["email"] == user.email
        assert user_data["is_active"] == user.is_active
    
    def test_get_user_not_found(self, client: TestClient):
        """Test GET /api/v1/users/{user_id} with non-existent user."""
        response = client.get("/api/v1/users/99999")
        assert response.status_code == 404
        assert "User not found" in response.json()["detail"]
    
    def test_create_user(self, client: TestClient, test_session: Session, test_data):
        """Test POST /api/v1/users/ endpoint."""
        role = test_data["role"]
        
        new_user_data = {
            "username": "newuser",
            "email": "newuser@wingstop.com",
            "hashed_password": self.auth_manager.hash_password("NewPassword123!"),
            "is_active": True,
            "role_id": role.id,
            "first_name": "New",
            "last_name": "User"
        }
        
        response = client.post("/api/v1/users/", json=new_user_data)
        assert response.status_code == 201
        
        user_data = response.json()
        assert user_data["username"] == new_user_data["username"]
        assert user_data["email"] == new_user_data["email"]
        assert user_data["is_active"] == new_user_data["is_active"]
        assert user_data["role_id"] == role.id
    
    def test_create_user_duplicate_username(self, client: TestClient, test_data):
        """Test POST /api/v1/users/ with duplicate username."""
        role = test_data["role"]
        existing_user = test_data["user"]
        
        new_user_data = {
            "username": existing_user.username,  # Duplicate username
            "email": "different@wingstop.com",
            "hashed_password": self.auth_manager.hash_password("NewPassword123!"),
            "is_active": True,
            "role_id": role.id,
            "first_name": "New",
            "last_name": "User"
        }
        
        response = client.post("/api/v1/users/", json=new_user_data)
        # Should fail due to unique constraint
        assert response.status_code in [400, 422]
    
    def test_create_user_duplicate_email(self, client: TestClient, test_data):
        """Test POST /api/v1/users/ with duplicate email."""
        role = test_data["role"]
        existing_user = test_data["user"]
        
        new_user_data = {
            "username": "differentuser",
            "email": existing_user.email,  # Duplicate email
            "hashed_password": self.auth_manager.hash_password("NewPassword123!"),
            "is_active": True,
            "role_id": role.id,
            "first_name": "New",
            "last_name": "User"
        }
        
        response = client.post("/api/v1/users/", json=new_user_data)
        # Should fail due to unique constraint
        assert response.status_code in [400, 422]
    
    def test_update_user(self, client: TestClient, test_data):
        """Test PUT /api/v1/users/{user_id} endpoint."""
        user = test_data["user"]
        
        update_data = {
            "first_name": "Updated",
            "last_name": "Name",
            "is_active": False
        }
        
        response = client.put(f"/api/v1/users/{user.id}", json=update_data)
        assert response.status_code == 200
        
        user_data = response.json()
        assert user_data["first_name"] == update_data["first_name"]
        assert user_data["last_name"] == update_data["last_name"]
        assert user_data["is_active"] == update_data["is_active"]
    
    def test_update_user_not_found(self, client: TestClient):
        """Test PUT /api/v1/users/{user_id} with non-existent user."""
        update_data = {
            "first_name": "Updated",
            "last_name": "Name"
        }
        
        response = client.put("/api/v1/users/99999", json=update_data)
        assert response.status_code == 404
        assert "User not found" in response.json()["detail"]
    
    def test_delete_user(self, client: TestClient, test_data):
        """Test DELETE /api/v1/users/{user_id} endpoint."""
        user = test_data["user"]
        
        response = client.delete(f"/api/v1/users/{user.id}")
        assert response.status_code == 204
        
        # Verify user is deleted
        get_response = client.get(f"/api/v1/users/{user.id}")
        assert get_response.status_code == 404
    
    def test_delete_user_not_found(self, client: TestClient):
        """Test DELETE /api/v1/users/{user_id} with non-existent user."""
        response = client.delete("/api/v1/users/99999")
        assert response.status_code == 404
        assert "User not found" in response.json()["detail"]
    
    def test_user_with_role_relationship(self, client: TestClient, test_data):
        """Test that user includes role information."""
        user = test_data["user"]
        response = client.get(f"/api/v1/users/{user.id}")
        assert response.status_code == 200
        
        user_data = response.json()
        assert "role" in user_data
        assert user_data["role"]["id"] == user.role_id
        assert user_data["role"]["name"] == "Test Role"
    
    def test_user_validation(self, client: TestClient, test_data):
        """Test user data validation."""
        role = test_data["role"]
        
        # Test invalid email
        invalid_user_data = {
            "username": "testuser",
            "email": "invalid-email",
            "hashed_password": self.auth_manager.hash_password("TestPassword123!"),
            "is_active": True,
            "role_id": role.id,
            "first_name": "Test",
            "last_name": "User"
        }
        
        response = client.post("/api/v1/users/", json=invalid_user_data)
        assert response.status_code == 422  # Validation error
    
    def test_user_pagination(self, client: TestClient, test_session: Session, test_data):
        """Test user list pagination (if implemented)."""
        # Create additional users for pagination testing
        role = test_data["role"]
        for i in range(5):
            user_data = {
                "username": f"user{i}",
                "email": f"user{i}@wingstop.com",
                "hashed_password": self.auth_manager.hash_password("TestPassword123!"),
                "is_active": True,
                "role_id": role.id,
                "first_name": f"User{i}",
                "last_name": "Test"
            }
            response = client.post("/api/v1/users/", json=user_data)
            assert response.status_code == 201
        
        # Test listing all users
        response = client.get("/api/v1/users/")
        assert response.status_code == 200
        users = response.json()
        assert len(users) >= 6  # Original user + 5 new users 