import { apiService, PaginatedResponse } from './api'

// Types
export interface CountEntry {
  id: number
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
  submittedBy: {
    id: number
    username: string
    firstName: string
    lastName: string
  }
  approvedBy?: {
    id: number
    username: string
    firstName: string
    lastName: string
  }
  submittedAt: string
  approvedAt?: string
  createdAt: string
  updatedAt: string
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

export interface CountApprovalRequest {
  approved: boolean
  notes?: string
}

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

// Counts API Service
export class CountsService {
  // Count entries
  async getCounts(filters?: CountFilters): Promise<PaginatedResponse<CountEntry>> {
    const params = new URLSearchParams()
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString())
        }
      })
    }
    return apiService.get<PaginatedResponse<CountEntry>>(`/counts?${params.toString()}`)
  }

  async getCount(id: number): Promise<CountEntry> {
    return apiService.get<CountEntry>(`/counts/${id}`)
  }

  async createCount(countData: CreateCountRequest): Promise<CountEntry> {
    return apiService.post<CountEntry>('/counts', countData)
  }

  async updateCount(id: number, countData: Partial<CreateCountRequest>): Promise<CountEntry> {
    return apiService.put<CountEntry>(`/counts/${id}`, countData)
  }

  async deleteCount(id: number): Promise<void> {
    return apiService.delete<void>(`/counts/${id}`)
  }

  async approveCount(id: number, approvalData: CountApprovalRequest): Promise<CountEntry> {
    return apiService.post<CountEntry>(`/counts/${id}/approve`, approvalData)
  }

  async bulkApproveCounts(ids: number[], approvalData: CountApprovalRequest): Promise<CountEntry[]> {
    return apiService.post<CountEntry[]>('/counts/bulk-approve', {
      ids,
      ...approvalData
    })
  }

  // Offline support
  async syncOfflineCounts(counts: CreateCountRequest[]): Promise<CountEntry[]> {
    return apiService.post<CountEntry[]>('/counts/sync', { counts })
  }

  async getOfflineCounts(): Promise<CountEntry[]> {
    return apiService.get<CountEntry[]>('/counts/offline')
  }

  // Count templates
  async getCountTemplates(): Promise<Array<{
    id: number
    name: string
    description: string
    items: Array<{
      itemId: number
      itemName: string
      unit: string
    }>
  }>> {
    return apiService.get<any[]>('/counts/templates')
  }

  async createCountFromTemplate(templateId: number, locationId: number): Promise<CountEntry[]> {
    return apiService.post<CountEntry[]>('/counts/from-template', {
      templateId,
      locationId
    })
  }

  // Variance analysis
  async getVarianceAnalysis(filters?: CountFilters): Promise<{
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
  }> {
    const params = new URLSearchParams()
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString())
        }
      })
    }
    return apiService.get<any>(`/counts/variance-analysis?${params.toString()}`)
  }

  // Analytics
  async getCountAnalytics(): Promise<CountAnalytics> {
    return apiService.get<CountAnalytics>('/counts/analytics')
  }

  // Export
  async exportCounts(filters?: CountFilters): Promise<void> {
    const params = new URLSearchParams()
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString())
        }
      })
    }
    return apiService.download(`/counts/export?${params.toString()}`, 'count-entries.csv')
  }

  // Mobile optimized endpoints
  async getTodayCounts(locationId?: number): Promise<CountEntry[]> {
    const params = locationId ? `?locationId=${locationId}` : ''
    return apiService.get<CountEntry[]>(`/counts/today${params}`)
  }

  async getPendingCounts(locationId?: number): Promise<CountEntry[]> {
    const params = locationId ? `?locationId=${locationId}` : ''
    return apiService.get<CountEntry[]>(`/counts/pending${params}`)
  }

  async submitQuickCount(itemId: number, locationId: number, quantity: number): Promise<CountEntry> {
    return apiService.post<CountEntry>('/counts/quick', {
      itemId,
      locationId,
      quantity
    })
  }
}

// Create counts service instance
export const countsService = new CountsService() 