# Wingstop Inventory App - Testing Documentation

This document provides comprehensive testing instructions for the Wingstop Inventory App, covering all currently implemented features and testing from different perspectives.

## 🎯 Overview

The Wingstop Inventory App has been set up with a comprehensive testing infrastructure that allows you to test all implemented functionality from multiple perspectives:

- **Backend API Testing** - FastAPI endpoints and database operations
- **Frontend Component Testing** - React components and UI functionality
- **Integration Testing** - End-to-end workflows
- **Performance Testing** - Response times and load handling
- **Security Testing** - Input validation and security measures
- **Accessibility Testing** - Screen reader and keyboard navigation

## 📋 Currently Implemented Features

### ✅ Backend (FastAPI + SQLModel)
- Database models for all entities (User, Role, Location, Category, InventoryItem, Count, Transfer, Schedule)
- Complete CRUD API endpoints for all entities
- Database migrations with Alembic
- Configuration management with environment-specific settings
- Security middleware and CORS setup
- Comprehensive logging system
- Error handling and validation

### ✅ Frontend (React + TypeScript)
- React Router navigation with protected routes
- Responsive layout components (Header, Sidebar, Footer)
- Tailwind CSS for responsive design
- Zustand state management
- Comprehensive UI component library
- React Hook Form for form handling
- Axios and TanStack Query for API integration
- TypeScript interfaces for all data models

## 🚀 Quick Start Testing

### 1. Backend Testing

#### Prerequisites
```bash
cd backend
python --version  # Ensure Python 3.8+ is installed
```

#### Run Backend Tests
```bash
# Run all backend tests
.\run_tests.ps1

# Run specific test types
.\run_tests.ps1 -TestType "api" -Verbose "true"
.\run_tests.ps1 -TestType "unit" -Coverage "true"
.\run_tests.ps1 -TestType "integration"
```

#### Manual API Testing
```bash
# Start the backend server
python main.py

# Test endpoints using curl
curl http://localhost:8000/health
curl http://localhost:8000/api/v1/users/
curl http://localhost:8000/api/v1/categories/
curl http://localhost:8000/api/v1/inventory-items/
curl http://localhost:8000/api/v1/counts/
```

### 2. Frontend Testing

#### Prerequisites
```bash
cd frontend
npm install
```

#### Run Frontend Tests
```bash
# Run all frontend tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests with UI
npm run test:ui
```

#### Manual Frontend Testing
```bash
# Start the development server
npm run dev

# Open http://localhost:5173 in your browser
# Navigate through all pages and test functionality
```

### 3. Comprehensive Testing

#### Run All Tests
```bash
# From project root
.\test-all.ps1

# Run specific test modes
.\test-all.ps1 -TestMode "backend"
.\test-all.ps1 -TestMode "frontend"
.\test-all.ps1 -TestMode "e2e"
.\test-all.ps1 -TestMode "performance"
```

#### Generate Test Data
```bash
# Generate comprehensive test data
.\generate-test-data.ps1

# Generate with custom parameters
.\generate-test-data.ps1 -NumUsers 20 -NumItems 100 -NumCounts 200
```

## 🧪 Test Categories

### 1. Unit Tests

#### Backend Unit Tests
- **Models**: Test database model validation and relationships
- **Schemas**: Test Pydantic schema validation
- **Services**: Test business logic functions
- **Utilities**: Test helper functions

#### Frontend Unit Tests
- **Components**: Test individual React components
- **Hooks**: Test custom React hooks
- **Utils**: Test utility functions
- **Stores**: Test Zustand store logic

### 2. Integration Tests

#### Backend Integration Tests
- **API Endpoints**: Test complete API workflows
- **Database Operations**: Test CRUD operations with real database
- **Authentication**: Test auth flows (when implemented)
- **Middleware**: Test request/response processing

#### Frontend Integration Tests
- **Page Components**: Test complete page functionality
- **Form Submissions**: Test form validation and submission
- **API Integration**: Test frontend-backend communication
- **Navigation**: Test routing and navigation

### 3. End-to-End Tests

#### Manual E2E Testing
1. **User Journey Testing**
   - Register/Login flow
   - Inventory management workflow
   - Count entry process
   - Report generation

2. **Cross-Browser Testing**
   - Chrome, Firefox, Safari, Edge
   - Mobile browsers (iOS Safari, Chrome Mobile)

3. **Responsive Design Testing**
   - Desktop (1920x1080)
   - Tablet (768x1024)
   - Mobile (375x667)

## 📊 Test Data Setup

### Backend Test Data
The test fixtures in `backend/tests/conftest.py` create:
- Sample users with different roles
- Test locations
- Inventory categories
- Sample inventory items
- Test counts and transfers

### Frontend Test Data
Mock data is available in `frontend/src/tests/setup.ts`:
- Mock API responses
- Test user data
- Sample inventory items
- Mock authentication state

## 🔍 Testing Checklist

### Backend API Testing

#### User Management
- [ ] List all users
- [ ] Get user by ID
- [ ] Create new user
- [ ] Update user information
- [ ] Delete user
- [ ] Test user validation
- [ ] Test duplicate username/email handling

#### Category Management
- [ ] List all categories
- [ ] Get category by ID
- [ ] Create new category
- [ ] Update category
- [ ] Delete category
- [ ] Test color validation
- [ ] Test category-inventory relationships

#### Inventory Management
- [ ] List all inventory items
- [ ] Get item by ID
- [ ] Create new item
- [ ] Update item
- [ ] Delete item
- [ ] Test item validation
- [ ] Test category relationships
- [ ] Test search and filtering

#### Count Management
- [ ] List all counts
- [ ] Get count by ID
- [ ] Create new count
- [ ] Update count
- [ ] Delete count
- [ ] Test quantity validation
- [ ] Test date validation
- [ ] Test user-item relationships

### Frontend Component Testing

#### UI Components
- [ ] Button component (all variants)
- [ ] Input component (validation, types)
- [ ] Modal component (open/close, content)
- [ ] Table component (sorting, pagination)
- [ ] Form components (validation, submission)
- [ ] Alert component (types, dismissal)
- [ ] Loading components (spinner, skeleton)

#### Page Components
- [ ] Dashboard page
- [ ] Inventory page
- [ ] Counts page
- [ ] Reports page
- [ ] Settings page
- [ ] Login/Register pages

#### Responsive Design
- [ ] Desktop layout (1200px+)
- [ ] Tablet layout (768px-1199px)
- [ ] Mobile layout (<768px)
- [ ] Navigation responsiveness
- [ ] Form responsiveness
- [ ] Table responsiveness

### API Integration Testing

#### Authentication
- [ ] Login flow
- [ ] Logout flow
- [ ] Token refresh
- [ ] Protected routes
- [ ] Error handling

#### Data Operations
- [ ] Fetch inventory items
- [ ] Create inventory item
- [ ] Update inventory item
- [ ] Delete inventory item
- [ ] Fetch categories
- [ ] Create count entry
- [ ] Update count entry
- [ ] Error handling for API calls

## 🐛 Common Testing Scenarios

### 1. Error Handling
- Test with invalid data
- Test with missing required fields
- Test with non-existent IDs
- Test network errors
- Test server errors

### 2. Edge Cases
- Empty lists
- Large datasets
- Special characters in input
- Very long text
- Zero/null values

### 3. Performance
- Large dataset loading
- Search performance
- Form submission speed
- Page load times

### 4. Security
- Input sanitization
- XSS prevention
- CSRF protection
- Authentication bypass attempts

## 📈 Test Coverage Goals

### Backend Coverage
- **Models**: 100% (validation, relationships)
- **API Endpoints**: 100% (all CRUD operations)
- **Services**: 90%+ (business logic)
- **Utilities**: 90%+ (helper functions)

### Frontend Coverage
- **Components**: 90%+ (UI components)
- **Pages**: 80%+ (page functionality)
- **Hooks**: 90%+ (custom hooks)
- **Utils**: 90%+ (utility functions)

## 🔧 Test Environment Setup

### Backend Test Environment
```bash
# Environment variables for testing
ENVIRONMENT=test
DATABASE_URL=sqlite:///./test.db
DEBUG=true
LOG_LEVEL=DEBUG
```

### Frontend Test Environment
```bash
# Environment variables for testing
VITE_API_URL=http://localhost:8000
VITE_ENVIRONMENT=test
```

## 📝 Test Documentation

### Writing New Tests

#### Backend Test Example
```python
def test_create_inventory_item(self, client: TestClient, test_data):
    """Test POST /api/v1/inventory-items/ endpoint."""
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
    
    response = client.post("/api/v1/inventory-items/", json=new_item_data)
    assert response.status_code == 201
    
    item_data = response.json()
    assert item_data["name"] == new_item_data["name"]
    assert item_data["category_id"] == category.id
```

#### Frontend Test Example
```typescript
it('renders with default props', () => {
  render(<Button>Click me</Button>)
  
  const button = screen.getByRole('button', { name: /click me/i })
  expect(button).toBeInTheDocument()
  expect(button).toHaveClass('bg-blue-600')
})
```

## 🚨 Troubleshooting

### Common Issues

#### Backend Test Issues
1. **Database Connection**: Ensure test database is properly configured
2. **Import Errors**: Check that all models are imported in `__init__.py`
3. **Fixture Issues**: Verify test data is properly created

#### Frontend Test Issues
1. **Component Import**: Check component export/import paths
2. **Mock Setup**: Ensure mocks are properly configured
3. **Async Operations**: Use proper async testing utilities

### Debug Commands
```bash
# Backend debugging
python -m pytest tests/ -v -s --tb=long

# Frontend debugging
npm test -- --verbose --no-coverage
```

## 📞 Support

If you encounter issues with testing:
1. Check the console for error messages
2. Verify all dependencies are installed
3. Ensure the test environment is properly configured
4. Review the test logs for specific failure details

## 🎯 Next Steps

After completing the current test suite:
1. Implement authentication testing
2. Add performance testing
3. Set up continuous integration
4. Add visual regression testing
5. Implement accessibility testing

## 📚 Additional Resources

- [TESTING_GUIDE.md](./TESTING_GUIDE.md) - Comprehensive testing guide
- [backend/tests/](./backend/tests/) - Backend test files
- [frontend/src/tests/](./frontend/src/tests/) - Frontend test files
- [test_data.json](./test_data.json) - Generated test data

---

**Note**: This testing documentation covers all currently implemented features. As new features are added, update this documentation accordingly. 