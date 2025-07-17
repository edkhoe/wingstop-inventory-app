import { apiService, PaginatedResponse } from './api'

// Types
export interface InventoryItem {
  id: number
  name: string
  categoryId: number
  category: Category
  unit: string
  parLevel: number
  reorderIncrement: number
  vendor?: string
  sku?: string
  currentStock?: number
  lastCountDate?: string
  lastCountQuantity?: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Category {
  id: number
  name: string
  color: string
  itemCount: number
  createdAt: string
  updatedAt: string
}

export interface CreateItemRequest {
  name: string
  categoryId: number
  unit: string
  parLevel: number
  reorderIncrement: number
  vendor?: string
  sku?: string
}

export interface UpdateItemRequest extends Partial<CreateItemRequest> {
  id: number
}

export interface CreateCategoryRequest {
  name: string
  color: string
}

export interface UpdateCategoryRequest extends Partial<CreateCategoryRequest> {
  id: number
}

export interface InventoryFilters {
  search?: string
  categoryId?: number
  locationId?: number
  lowStock?: boolean
  active?: boolean
  page?: number
  size?: number
  sortBy?: 'name' | 'category' | 'parLevel' | 'lastCount' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
}

// Inventory API Service
export class InventoryService {
  // Items
  async getItems(filters?: InventoryFilters): Promise<PaginatedResponse<InventoryItem>> {
    const params = new URLSearchParams()
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString())
        }
      })
    }
    return apiService.get<PaginatedResponse<InventoryItem>>(`/inventory/items?${params.toString()}`)
  }

  async getItem(id: number): Promise<InventoryItem> {
    return apiService.get<InventoryItem>(`/inventory/items/${id}`)
  }

  async createItem(itemData: CreateItemRequest): Promise<InventoryItem> {
    return apiService.post<InventoryItem>('/inventory/items', itemData)
  }

  async updateItem(id: number, itemData: Partial<CreateItemRequest>): Promise<InventoryItem> {
    return apiService.put<InventoryItem>(`/inventory/items/${id}`, itemData)
  }

  async deleteItem(id: number): Promise<void> {
    return apiService.delete<void>(`/inventory/items/${id}`)
  }

  async bulkDeleteItems(ids: number[]): Promise<void> {
    return apiService.post<void>('/inventory/items/bulk-delete', { ids })
  }

  async importItems(file: File, onProgress?: (progress: number) => void): Promise<{ imported: number; errors: string[] }> {
    return apiService.upload<{ imported: number; errors: string[] }>('/inventory/items/import', file, onProgress)
  }

  async exportItems(filters?: InventoryFilters): Promise<void> {
    const params = new URLSearchParams()
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString())
        }
      })
    }
    return apiService.download(`/inventory/items/export?${params.toString()}`, 'inventory-items.csv')
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    return apiService.get<Category[]>('/inventory/categories')
  }

  async getCategory(id: number): Promise<Category> {
    return apiService.get<Category>(`/inventory/categories/${id}`)
  }

  async createCategory(categoryData: CreateCategoryRequest): Promise<Category> {
    return apiService.post<Category>('/inventory/categories', categoryData)
  }

  async updateCategory(id: number, categoryData: Partial<CreateCategoryRequest>): Promise<Category> {
    return apiService.put<Category>(`/inventory/categories/${id}`, categoryData)
  }

  async deleteCategory(id: number): Promise<void> {
    return apiService.delete<void>(`/inventory/categories/${id}`)
  }

  // Stock operations
  async adjustStock(itemId: number, quantity: number, reason: string): Promise<InventoryItem> {
    return apiService.post<InventoryItem>(`/inventory/items/${itemId}/adjust-stock`, {
      quantity,
      reason
    })
  }

  async getLowStockItems(threshold?: number): Promise<InventoryItem[]> {
    const params = threshold ? `?threshold=${threshold}` : ''
    return apiService.get<InventoryItem[]>(`/inventory/items/low-stock${params}`)
  }

  async getStockHistory(itemId: number, page?: number, size?: number): Promise<PaginatedResponse<any>> {
    const params = new URLSearchParams()
    if (page) params.append('page', page.toString())
    if (size) params.append('size', size.toString())
    return apiService.get<PaginatedResponse<any>>(`/inventory/items/${itemId}/history?${params.toString()}`)
  }

  // Analytics
  async getInventoryAnalytics(): Promise<{
    totalItems: number
    lowStockItems: number
    outOfStockItems: number
    categories: { name: string; count: number }[]
    recentActivity: any[]
  }> {
    return apiService.get<any>('/inventory/analytics')
  }
}

// Create inventory service instance
export const inventoryService = new InventoryService() 