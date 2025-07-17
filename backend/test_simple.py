#!/usr/bin/env python3
"""
Simple test script to verify Category model and schema changes
"""

import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from app.models.category import Category
from app.schemas.category import CategoryCreate, CategoryUpdate, CategoryRead
from datetime import datetime

def test_category_model():
    """Test Category model creation"""
    print("Testing Category model...")
    
    # Test basic category creation
    category = Category(
        name="Test Category",
        description="Test description",
        color="#FF5733"
    )
    
    print(f"✓ Category created: {category.name}, color: {category.color}")
    
    # Test default color
    category2 = Category(
        name="Test Category 2",
        description="Test description 2"
    )
    print(f"✓ Category with default color: {category2.name}, color: {category2.color}")
    
    return True

def test_category_schema():
    """Test Category schema validation"""
    print("\nTesting Category schema...")
    
    # Test valid category creation
    try:
        category_data = {
            "name": "Test Category",
            "description": "Test description",
            "color": "#FF5733"
        }
        category = CategoryCreate(**category_data)
        print(f"✓ Valid category schema: {category.name}, color: {category.color}")
    except Exception as e:
        print(f"✗ Valid category schema failed: {e}")
        return False
    
    # Test invalid color
    try:
        category_data = {
            "name": "Test Category",
            "description": "Test description",
            "color": "invalid-color"
        }
        category = CategoryCreate(**category_data)
        print(f"✗ Invalid color should have failed but didn't")
        return False
    except Exception as e:
        print(f"✓ Invalid color correctly rejected: {e}")
    
    # Test valid colors
    valid_colors = ["#FF5733", "#33FF57", "#3357FF", "#F0F0F0", "#000000"]
    for color in valid_colors:
        try:
            category_data = {
                "name": f"Test Category {color}",
                "description": "Test description",
                "color": color
            }
            category = CategoryCreate(**category_data)
            print(f"✓ Valid color {color} accepted")
        except Exception as e:
            print(f"✗ Valid color {color} rejected: {e}")
            return False
    
    return True

def test_category_update():
    """Test Category update schema"""
    print("\nTesting Category update schema...")
    
    # Test partial update
    try:
        update_data = {
            "name": "Updated Category",
            "color": "#33FF57"
        }
        category_update = CategoryUpdate(**update_data)
        print(f"✓ Category update schema: {category_update.name}, color: {category_update.color}")
    except Exception as e:
        print(f"✗ Category update schema failed: {e}")
        return False
    
    return True

if __name__ == "__main__":
    print("Running simple Category tests...\n")
    
    success = True
    success &= test_category_model()
    success &= test_category_schema()
    success &= test_category_update()
    
    if success:
        print("\n🎉 All tests passed!")
    else:
        print("\n❌ Some tests failed!")
        sys.exit(1) 