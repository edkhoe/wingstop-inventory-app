// Base types
export interface BaseEntity {
  id: number
  createdAt: string
  updatedAt: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  size: number
  pages: number
}

export interface ApiResponse<T = any> {
  data: T
  message?: string
  success: boolean
}

export interface ApiError {
  message: string
  code?: string
  details?: any
}

// User and Authentication types
export interface User extends BaseEntity {
  username: string
  email: string
  firstName: string
  lastName: string
  role: Role
  location: Location
  isActive: boolean
}

export interface Role extends BaseEntity {
  name: string
  description?: string
  permissions: string[]
  isActive: boolean
}

export interface Location extends BaseEntity {
  name: string
  address?: string
  phone?: string
  email?: string
  isActive: boolean
}

export interface AuthTokens {
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
}

export interface AuthResponse {
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
  user: User
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
  confirmPassword: string
  firstName: string
  lastName: string
  roleId: number
  locationId: number
}

export interface RefreshTokenRequest {
  refresh_token: string
}

export interface ChangePasswordRequest {
  current_password: string
  new_password: string
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  token: string
  new_password: string
}

// Inventory types
export interface Category extends BaseEntity {
  name: string
  color: string
  description?: string
  itemCount: number
  isActive: boolean
}

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

export interface CreateCategoryRequest {
  name: string
  color: string
  description?: string
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

export interface StockAdjustment {
  id: number
  itemId: number
  item: InventoryItem
  quantity: number
  reason: string
  adjustedBy: User
  adjustedAt: string
}

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

// Count types
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

export interface CountTemplate {
  id: number
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

// Transfer types
export interface Transfer extends BaseEntity {
  fromLocationId: number
  fromLocation: Location
  toLocationId: number
  toLocation: Location
  itemId: number
  item: InventoryItem
  quantity: number
  reason: string
  status: 'pending' | 'approved' | 'completed' | 'cancelled'
  requestedBy: User
  approvedBy?: User
  completedBy?: User
  requestedAt: string
  approvedAt?: string
  completedAt?: string
}

export interface CreateTransferRequest {
  fromLocationId: number
  toLocationId: number
  itemId: number
  quantity: number
  reason: string
}

export interface TransferFilters {
  fromLocationId?: number
  toLocationId?: number
  itemId?: number
  status?: 'pending' | 'approved' | 'completed' | 'cancelled'
  requestedBy?: number
  dateFrom?: string
  dateTo?: string
  page?: number
  size?: number
}

// Schedule types
export interface Schedule extends BaseEntity {
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
  createdBy: User
  assignedTo?: User
}

export interface CreateScheduleRequest {
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

export interface ScheduleFilters {
  locationId?: number
  frequency?: 'daily' | 'weekly' | 'monthly' | 'custom'
  isActive?: boolean
  assignedTo?: number
  dateFrom?: string
  dateTo?: string
  page?: number
  size?: number
}

// Notification types
export interface Notification extends BaseEntity {
  type: 'email' | 'sms' | 'in_app'
  title: string
  message: string
  recipientId: number
  recipient: User
  status: 'pending' | 'sent' | 'failed'
  sentAt?: string
  readAt?: string
  metadata?: Record<string, any>
}

export interface CreateNotificationRequest {
  type: 'email' | 'sms' | 'in_app'
  title: string
  message: string
  recipientId: number
  metadata?: Record<string, any>
}

// Report types
export interface Report extends BaseEntity {
  name: string
  description?: string
  type: 'inventory' | 'counts' | 'transfers' | 'analytics' | 'custom'
  parameters: Record<string, any>
  format: 'pdf' | 'excel' | 'csv'
  status: 'pending' | 'generating' | 'completed' | 'failed'
  fileUrl?: string
  generatedBy: User
  scheduledAt?: string
  completedAt?: string
}

export interface CreateReportRequest {
  name: string
  description?: string
  type: 'inventory' | 'counts' | 'transfers' | 'analytics' | 'custom'
  parameters: Record<string, any>
  format: 'pdf' | 'excel' | 'csv'
  scheduledAt?: string
}

export interface ReportFilters {
  type?: 'inventory' | 'counts' | 'transfers' | 'analytics' | 'custom'
  status?: 'pending' | 'generating' | 'completed' | 'failed'
  generatedBy?: number
  dateFrom?: string
  dateTo?: string
  page?: number
  size?: number
}

// Dashboard types
export interface DashboardMetrics {
  totalItems: number
  lowStockItems: number
  outOfStockItems: number
  pendingCounts: number
  pendingTransfers: number
  todayCounts: number
  recentActivity: Array<{
    id: number
    type: 'count' | 'transfer' | 'adjustment' | 'creation'
    title: string
    description: string
    user: string
    timestamp: string
  }>
  topItems: Array<{
    itemName: string
    currentStock: number
    parLevel: number
    variance: number
  }>
  locationStats: Array<{
    locationName: string
    itemCount: number
    lowStockCount: number
    pendingCounts: number
  }>
}

// Search and Filter types
export interface SearchFilters {
  query?: string
  category?: string
  location?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  page?: number
  size?: number
}

// File upload types
export interface FileUpload {
  id: number
  filename: string
  originalName: string
  mimeType: string
  size: number
  uploadedBy: User
  uploadedAt: string
  url: string
}

export interface UploadProgress {
  loaded: number
  total: number
  percentage: number
}

// All types are already exported above 