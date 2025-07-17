import { BaseEntity, User, InventoryItem, Location } from './index'

// Count Entry types
export interface CountEntry extends BaseEntity {
  itemId: number
  item: {
    id: number
    name: string
    unit: string
    category: {
      id: number
      name: string
      color: string
    }
  }
  locationId: number
  location: {
    id: number
    name: string
  }
  quantity: number
  notes?: string
  variance?: number
  variancePercentage?: number
  status: 'pending' | 'approved' | 'rejected'
  submittedBy: User
  approvedBy?: User
  submittedAt: string
  approvedAt?: string
}

export interface CreateCountRequest {
  itemId: number
  locationId: number
  quantity: number
  notes?: string
}

export interface UpdateCountRequest extends Partial<CreateCountRequest> {
  id: number
}

export interface CountApprovalRequest {
  approved: boolean
  notes?: string
}

export interface CountFilters {
  itemId?: number
  locationId?: number
  status?: 'pending' | 'approved' | 'rejected'
  submittedBy?: number
  dateFrom?: string
  dateTo?: string
  page?: number
  size?: number
  sortBy?: 'submittedAt' | 'itemName' | 'quantity' | 'variance'
  sortOrder?: 'asc' | 'desc'
}

// Count Template types
export interface CountTemplate extends BaseEntity {
  name: string
  description: string
  items: Array<{
    itemId: number
    itemName: string
    unit: string
  }>
  createdBy: User
  isActive: boolean
}

export interface CreateCountTemplateRequest {
  name: string
  description: string
  itemIds: number[]
}

export interface UpdateCountTemplateRequest {
  name?: string
  description?: string
  itemIds?: number[]
  isActive?: boolean
}

// Count Analytics types
export interface CountAnalytics {
  totalCounts: number
  pendingCounts: number
  approvedCounts: number
  rejectedCounts: number
  averageVariance: number
  topVarianceItems: Array<{
    itemName: string
    averageVariance: number
    count: number
  }>
  countsByLocation: Array<{
    locationName: string
    count: number
  }>
  recentActivity: CountEntry[]
}

export interface VarianceAnalysis {
  totalVariance: number
  averageVariance: number
  varianceByItem: Array<{
    itemName: string
    totalVariance: number
    averageVariance: number
    count: number
  }>
  varianceByLocation: Array<{
    locationName: string
    totalVariance: number
    averageVariance: number
    count: number
  }>
}

// Offline Count types
export interface OfflineCount extends Omit<CreateCountRequest, 'itemId' | 'locationId'> {
  id: string // Local ID for offline storage
  itemId: number
  locationId: number
  synced: boolean
  syncError?: string
  createdAt: string
  updatedAt: string
}

export interface SyncResult {
  synced: number
  errors: string[]
}

// Count History types
export interface CountHistory extends BaseEntity {
  countId: number
  count: CountEntry
  action: 'created' | 'updated' | 'approved' | 'rejected'
  changes?: Record<string, any>
  performedBy: User
  notes?: string
}

// Count Schedule types
export interface CountSchedule extends BaseEntity {
  name: string
  description?: string
  locationId: number
  location: Location
  frequency: 'daily' | 'weekly' | 'monthly' | 'custom'
  frequencyConfig: {
    daysOfWeek?: number[]
    dayOfMonth?: number
    customInterval?: number
  }
  startDate: string
  endDate?: string
  isActive: boolean
  assignedTo?: User
  createdBy: User
}

export interface CreateCountScheduleRequest {
  name: string
  description?: string
  locationId: number
  frequency: 'daily' | 'weekly' | 'monthly' | 'custom'
  frequencyConfig: {
    daysOfWeek?: number[]
    dayOfMonth?: number
    customInterval?: number
  }
  startDate: string
  endDate?: string
  assignedToId?: number
} 