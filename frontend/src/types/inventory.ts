import { BaseEntity, User, Category } from './index'

// Inventory Item types
export interface InventoryItem extends BaseEntity {
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

// Category types
export interface CreateCategoryRequest {
  name: string
  color: string
  description?: string
}

export interface UpdateCategoryRequest extends Partial<CreateCategoryRequest> {
  id: number
}

// Stock adjustment types
export interface StockAdjustment extends BaseEntity {
  itemId: number
  item: InventoryItem
  quantity: number
  reason: string
  adjustedBy: User
  adjustedAt: string
}

export interface CreateStockAdjustmentRequest {
  itemId: number
  quantity: number
  reason: string
}

// Inventory analytics types
export interface InventoryAnalytics {
  totalItems: number
  lowStockItems: number
  outOfStockItems: number
  categories: Array<{
    name: string
    count: number
  }>
  recentActivity: Array<{
    id: number
    type: 'count' | 'adjustment' | 'creation'
    itemName: string
    quantity?: number
    user: string
    timestamp: string
  }>
}

// Import/Export types
export interface ImportResult {
  imported: number
  errors: string[]
  warnings: string[]
}

export interface ExportOptions {
  format: 'csv' | 'excel' | 'pdf'
  filters?: InventoryFilters
  includeInactive?: boolean
}

// Vendor types
export interface Vendor extends BaseEntity {
  name: string
  contactPerson?: string
  email?: string
  phone?: string
  address?: string
  isActive: boolean
}

export interface CreateVendorRequest {
  name: string
  contactPerson?: string
  email?: string
  phone?: string
  address?: string
}

export interface UpdateVendorRequest extends Partial<CreateVendorRequest> {
  id: number
  isActive?: boolean
}

// SKU types
export interface SKU extends BaseEntity {
  code: string
  itemId: number
  item: InventoryItem
  vendorId?: number
  vendor?: Vendor
  cost?: number
  isActive: boolean
}

export interface CreateSKURequest {
  code: string
  itemId: number
  vendorId?: number
  cost?: number
}

export interface UpdateSKURequest extends Partial<CreateSKURequest> {
  id: number
  isActive?: boolean
} 