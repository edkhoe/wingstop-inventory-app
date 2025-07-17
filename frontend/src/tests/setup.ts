/// <reference types="vitest" />
import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
window.localStorage = localStorageMock as any

// Mock sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
window.sessionStorage = sessionStorageMock as any

// Cleanup after each test
afterEach(() => {
  // cleanup() // This line was removed as per the new_code, as cleanup is no longer imported.
  vi.clearAllMocks()
})

// Mock API responses
export const mockApiResponses = {
  users: [
    {
      id: 1,
      username: 'testuser',
      email: 'test@wingstop.com',
      first_name: 'Test',
      last_name: 'User',
      is_active: true,
      role: {
        id: 1,
        name: 'Manager',
        description: 'Store Manager',
        permissions: ['read', 'write']
      },
      created_at: '2023-01-01T00:00:00Z'
    }
  ],
  categories: [
    {
      id: 1,
      name: 'Chicken',
      description: 'Chicken products',
      color: '#FF6B6B',
      created_at: '2023-01-01T00:00:00Z'
    },
    {
      id: 2,
      name: 'Sauces',
      description: 'Wing sauces',
      color: '#4ECDC4',
      created_at: '2023-01-01T00:00:00Z'
    }
  ],
  inventoryItems: [
    {
      id: 1,
      name: 'Chicken Wings',
      category_id: 1,
      category: {
        id: 1,
        name: 'Chicken',
        description: 'Chicken products',
        color: '#FF6B6B'
      },
      unit: 'lbs',
      par_level: 50.0,
      reorder_increment: 25.0,
      vendor: 'Chicken Supplier',
      sku: 'CHK-001',
      created_at: '2023-01-01T00:00:00Z'
    },
    {
      id: 2,
      name: 'Hot Sauce',
      category_id: 2,
      category: {
        id: 2,
        name: 'Sauces',
        description: 'Wing sauces',
        color: '#4ECDC4'
      },
      unit: 'bottles',
      par_level: 20.0,
      reorder_increment: 10.0,
      vendor: 'Sauce Supplier',
      sku: 'SAU-001',
      created_at: '2023-01-01T00:00:00Z'
    }
  ],
  counts: [
    {
      id: 1,
      user_id: 1,
      user: {
        id: 1,
        username: 'testuser',
        first_name: 'Test',
        last_name: 'User'
      },
      inventory_item_id: 1,
      inventory_item: {
        id: 1,
        name: 'Chicken Wings',
        unit: 'lbs'
      },
      quantity: 45.0,
      count_date: '2023-12-01',
      notes: 'Daily count',
      created_at: '2023-12-01T10:00:00Z'
    }
  ]
}

// Mock API client
export const mockApiClient = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
  patch: vi.fn()
}

// Mock auth store
export const mockAuthStore = {
  user: mockApiResponses.users[0],
  isAuthenticated: true,
  login: vi.fn(),
  logout: vi.fn(),
  register: vi.fn(),
  refreshToken: vi.fn()
}

// Mock inventory store
export const mockInventoryStore = {
  items: mockApiResponses.inventoryItems,
  categories: mockApiResponses.categories,
  loading: false,
  error: null,
  fetchItems: vi.fn(),
  fetchCategories: vi.fn(),
  createItem: vi.fn(),
  updateItem: vi.fn(),
  deleteItem: vi.fn()
}

// Mock counts store
export const mockCountsStore = {
  counts: mockApiResponses.counts,
  loading: false,
  error: null,
  fetchCounts: vi.fn(),
  createCount: vi.fn(),
  updateCount: vi.fn(),
  deleteCount: vi.fn()
}

// Test utilities
export const testUtils = {
  // Wait for async operations
  waitFor: (ms: number = 100) => new Promise(resolve => setTimeout(resolve, ms)),
  
  // Mock API delay
  mockApiDelay: (ms: number = 100) => new Promise(resolve => setTimeout(resolve, ms)),
  
  // Generate test data
  generateTestUser: (overrides = {}) => ({
    id: Math.floor(Math.random() * 1000),
    username: 'testuser',
    email: 'test@wingstop.com',
    first_name: 'Test',
    last_name: 'User',
    is_active: true,
    role: {
      id: 1,
      name: 'Manager',
      description: 'Store Manager',
      permissions: ['read', 'write']
    },
    created_at: '2023-01-01T00:00:00Z',
    ...overrides
  }),
  
  generateTestCategory: (overrides = {}) => ({
    id: Math.floor(Math.random() * 1000),
    name: 'Test Category',
    description: 'Test category description',
    color: '#FF6B6B',
    created_at: '2023-01-01T00:00:00Z',
    ...overrides
  }),
  
  generateTestInventoryItem: (overrides = {}) => ({
    id: Math.floor(Math.random() * 1000),
    name: 'Test Item',
    category_id: 1,
    category: {
      id: 1,
      name: 'Test Category',
      description: 'Test category',
      color: '#FF6B6B'
    },
    unit: 'pieces',
    par_level: 10.0,
    reorder_increment: 5.0,
    vendor: 'Test Vendor',
    sku: 'TEST-001',
    created_at: '2023-01-01T00:00:00Z',
    ...overrides
  }),
  
  generateTestCount: (overrides = {}) => ({
    id: Math.floor(Math.random() * 1000),
    user_id: 1,
    user: {
      id: 1,
      username: 'testuser',
      first_name: 'Test',
      last_name: 'User'
    },
    inventory_item_id: 1,
    inventory_item: {
      id: 1,
      name: 'Test Item',
      unit: 'pieces'
    },
    quantity: 15.0,
    count_date: '2023-12-01',
    notes: 'Test count',
    created_at: '2023-12-01T10:00:00Z',
    ...overrides
  })
} 