import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ApiService } from '../../services/api'

// Create a mock axios client
const mockAxiosClient = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
  patch: vi.fn(),
  interceptors: {
    request: { use: vi.fn() },
    response: { use: vi.fn() }
  },
  defaults: {
    baseURL: 'http://localhost:8000/api/v1'
  }
}

// Mock axios
vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => mockAxiosClient)
  }
}))

describe('API Service', () => {
  let apiService: ApiService

  beforeEach(() => {
    vi.clearAllMocks()
    apiService = new ApiService()
  })

  it('creates axios instance', () => {
    expect(apiService).toBeDefined()
  })

  it('has get method', () => {
    expect(typeof apiService.get).toBe('function')
  })

  it('has post method', () => {
    expect(typeof apiService.post).toBe('function')
  })

  it('has put method', () => {
    expect(typeof apiService.put).toBe('function')
  })

  it('has delete method', () => {
    expect(typeof apiService.delete).toBe('function')
  })

  it('has patch method', () => {
    expect(typeof apiService.patch).toBe('function')
  })

  it('handles GET requests', async () => {
    const mockResponse = { data: { items: [] } }
    mockAxiosClient.get.mockResolvedValue(mockResponse)
    
    const result = await apiService.get('/categories')
    expect(mockAxiosClient.get).toHaveBeenCalledWith('/categories', undefined)
    expect(result).toEqual(mockResponse)
  })

  it('handles POST requests', async () => {
    const mockData = { name: 'Test Category', description: 'Test' }
    const mockResponse = { data: { id: 1, ...mockData } }
    mockAxiosClient.post.mockResolvedValue(mockResponse)
    
    const result = await apiService.post('/categories', mockData)
    expect(mockAxiosClient.post).toHaveBeenCalledWith('/categories', mockData, undefined)
    expect(result).toEqual(mockResponse)
  })

  it('handles PUT requests', async () => {
    const mockData = { name: 'Updated Category' }
    const mockResponse = { data: { id: 1, ...mockData } }
    mockAxiosClient.put.mockResolvedValue(mockResponse)
    
    const result = await apiService.put('/categories/1', mockData)
    expect(mockAxiosClient.put).toHaveBeenCalledWith('/categories/1', mockData, undefined)
    expect(result).toEqual(mockResponse)
  })

  it('handles DELETE requests', async () => {
    const mockResponse = { data: { message: 'Deleted successfully' } }
    mockAxiosClient.delete.mockResolvedValue(mockResponse)
    
    const result = await apiService.delete('/categories/1')
    expect(mockAxiosClient.delete).toHaveBeenCalledWith('/categories/1', undefined)
    expect(result).toEqual(mockResponse)
  })

  it('handles PATCH requests', async () => {
    const mockData = { name: 'Partially Updated' }
    const mockResponse = { data: { id: 1, ...mockData } }
    mockAxiosClient.patch.mockResolvedValue(mockResponse)
    
    const result = await apiService.patch('/categories/1', mockData)
    expect(mockAxiosClient.patch).toHaveBeenCalledWith('/categories/1', mockData, undefined)
    expect(result).toEqual(mockResponse)
  })

  it('handles request errors', async () => {
    const mockError = new Error('Network error')
    mockAxiosClient.get.mockRejectedValue(mockError)
    
    await expect(apiService.get('/categories')).rejects.toThrow('Network error')
  })

  it('handles response errors', async () => {
    const mockError = {
      response: {
        status: 404,
        data: { detail: 'Not found' }
      }
    }
    mockAxiosClient.get.mockRejectedValue(mockError)
    
    await expect(apiService.get('/categories')).rejects.toEqual(mockError)
  })
}) 