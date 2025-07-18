import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const API_TIMEOUT = 10000 // 10 seconds

// Response types
export interface ApiResponse<T = any> {
  data: T
  message?: string
  success: boolean
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  size: number
  pages: number
}

export interface ApiError {
  message: string
  code?: string
  details?: any
}

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor for authentication
apiClient.interceptors.request.use(
  (config) => {
    // Import here to avoid circular dependency
    const { tokenStorage } = require('../utils/tokenStorage')
    const token = tokenStorage.getAccessToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as any

    // Handle 401 Unauthorized - delegate to AuthContext's refresh method
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        // Import here to avoid circular dependency
        const { getTokenRefreshCallback } = require('../utils/tokenStorage')
        const refreshCallback = getTokenRefreshCallback()
        
        if (refreshCallback) {
          const refreshSuccess = await refreshCallback()
          
          if (refreshSuccess) {
            // Get the new token and retry the original request
            const { tokenStorage } = require('../utils/tokenStorage')
            const newToken = tokenStorage.getAccessToken()
            
            if (newToken) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`
              return apiClient(originalRequest)
            }
          }
        }
      } catch (refreshError) {
        // Refresh failed, tokens will be cleared by AuthContext
        console.warn('Token refresh failed:', refreshError)
      }
    }

    // Handle other errors
    const apiError: ApiError = {
      message: (error.response?.data as any)?.message || error.message || 'An error occurred',
      code: error.response?.status?.toString(),
      details: error.response?.data
    }

    return Promise.reject(apiError)
  }
)

// API Service class
export class ApiService {
  private client: AxiosInstance

  constructor(client: AxiosInstance = apiClient) {
    this.client = client
  }

  // Generic request methods
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config)
    return response.data
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config)
    return response.data
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config)
    return response.data
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch<T>(url, data, config)
    return response.data
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config)
    return response.data
  }

  // Upload file
  async upload<T>(url: string, file: File, onProgress?: (progress: number) => void): Promise<T> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await this.client.post<T>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          onProgress(progress)
        }
      },
    })

    return response.data
  }

  // Download file
  async download(url: string, filename?: string): Promise<void> {
    const response = await this.client.get(url, {
      responseType: 'blob',
    })

    const blob = new Blob([response.data])
    const downloadUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = filename || 'download'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(downloadUrl)
  }
}

// Create default API service instance
export const apiService = new ApiService()

// Export axios instance for direct use if needed
export { apiClient } 