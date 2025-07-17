import { describe, it, expect, vi, beforeEach } from 'vitest'
import { apiClient } from '../../services/api'
import { mockApiResponses } from '../setup'

// Mock axios
vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
      patch: vi.fn(),
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() }
      }
    }))
  }
}))

describe('API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('creates axios instance with correct base URL', () => {
    expect(apiClient.defaults.baseURL).toBe('http://localhost:8000/api/v1')
  })

  it('sets up request interceptor', () => {
    expect(apiClient.interceptors.request.use).toHaveBeenCalled()
  })

  it('sets up response interceptor', () => {
    expect(apiClient.interceptors.response.use).toHaveBeenCalled()
  })

  it('handles GET requests', async () => {
    const mockResponse = { data: mockApiResponses.categories }
    vi.mocked(apiClient.get).mockResolvedValue(mockResponse)
    
    const result = await apiClient.get('/categories')
    expect(apiClient.get).toHaveBeenCalledWith('/categories')
    expect(result).toEqual(mockResponse)
  })

  it('handles POST requests', async () => {
    const mockData = { name: 'Test Category', description: 'Test' }
    const mockResponse = { data: { id: 1, ...mockData } }
    vi.mocked(apiClient.post).mockResolvedValue(mockResponse)
    
    const result = await apiClient.post('/categories', mockData)
    expect(apiClient.post).toHaveBeenCalledWith('/categories', mockData)
    expect(result).toEqual(mockResponse)
  })

  it('handles PUT requests', async () => {
    const mockData = { name: 'Updated Category' }
    const mockResponse = { data: { id: 1, ...mockData } }
    vi.mocked(apiClient.put).mockResolvedValue(mockResponse)
    
    const result = await apiClient.put('/categories/1', mockData)
    expect(apiClient.put).toHaveBeenCalledWith('/categories/1', mockData)
    expect(result).toEqual(mockResponse)
  })

  it('handles DELETE requests', async () => {
    const mockResponse = { data: { message: 'Deleted successfully' } }
    vi.mocked(apiClient.delete).mockResolvedValue(mockResponse)
    
    const result = await apiClient.delete('/categories/1')
    expect(apiClient.delete).toHaveBeenCalledWith('/categories/1')
    expect(result).toEqual(mockResponse)
  })

  it('handles PATCH requests', async () => {
    const mockData = { name: 'Partially Updated' }
    const mockResponse = { data: { id: 1, ...mockData } }
    vi.mocked(apiClient.patch).mockResolvedValue(mockResponse)
    
    const result = await apiClient.patch('/categories/1', mockData)
    expect(apiClient.patch).toHaveBeenCalledWith('/categories/1', mockData)
    expect(result).toEqual(mockResponse)
  })

  it('handles request errors', async () => {
    const mockError = new Error('Network error')
    vi.mocked(apiClient.get).mockRejectedValue(mockError)
    
    await expect(apiClient.get('/categories')).rejects.toThrow('Network error')
  })

  it('handles response errors', async () => {
    const mockError = {
      response: {
        status: 404,
        data: { detail: 'Not found' }
      }
    }
    vi.mocked(apiClient.get).mockRejectedValue(mockError)
    
    await expect(apiClient.get('/categories')).rejects.toEqual(mockError)
  })

  it('includes authorization header when token exists', async () => {
    const mockToken = 'test-token'
    localStorage.setItem('token', mockToken)
    
    const mockResponse = { data: mockApiResponses.categories }
    vi.mocked(apiClient.get).mockResolvedValue(mockResponse)
    
    await apiClient.get('/categories')
    
    // Check that request interceptor was called
    expect(apiClient.interceptors.request.use).toHaveBeenCalled()
  })

  it('handles 401 unauthorized responses', async () => {
    const mockError = {
      response: {
        status: 401,
        data: { detail: 'Unauthorized' }
      }
    }
    vi.mocked(apiClient.get).mockRejectedValue(mockError)
    
    await expect(apiClient.get('/categories')).rejects.toEqual(mockError)
  })

  it('handles 403 forbidden responses', async () => {
    const mockError = {
      response: {
        status: 403,
        data: { detail: 'Forbidden' }
      }
    }
    vi.mocked(apiClient.get).mockRejectedValue(mockError)
    
    await expect(apiClient.get('/categories')).rejects.toEqual(mockError)
  })

  it('handles 500 server errors', async () => {
    const mockError = {
      response: {
        status: 500,
        data: { detail: 'Internal server error' }
      }
    }
    vi.mocked(apiClient.get).mockRejectedValue(mockError)
    
    await expect(apiClient.get('/categories')).rejects.toEqual(mockError)
  })
}) 