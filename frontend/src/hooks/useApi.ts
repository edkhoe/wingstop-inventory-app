import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query'
import { authService, LoginRequest, RegisterRequest, User } from '../services/auth'
import { inventoryService, InventoryItem, Category, InventoryFilters, CreateItemRequest, CreateCategoryRequest } from '../services/inventory'
import { countsService, CountEntry, CountFilters, CreateCountRequest } from '../services/counts'

// Query Keys
export const queryKeys = {
  // Auth
  auth: {
    currentUser: ['auth', 'currentUser'] as const,
  },
  
  // Inventory
  inventory: {
    all: ['inventory'] as const,
    items: (filters?: InventoryFilters) => [...queryKeys.inventory.all, 'items', filters] as const,
    item: (id: number) => [...queryKeys.inventory.all, 'items', id] as const,
    categories: ['inventory', 'categories'] as const,
    category: (id: number) => [...queryKeys.inventory.all, 'categories', id] as const,
    lowStock: (threshold?: number) => [...queryKeys.inventory.all, 'lowStock', threshold] as const,
    analytics: ['inventory', 'analytics'] as const,
  },
  
  // Counts
  counts: {
    all: ['counts'] as const,
    list: (filters?: CountFilters) => [...queryKeys.counts.all, 'list', filters] as const,
    item: (id: number) => [...queryKeys.counts.all, 'item', id] as const,
    today: (locationId?: number) => [...queryKeys.counts.all, 'today', locationId] as const,
    pending: (locationId?: number) => [...queryKeys.counts.all, 'pending', locationId] as const,
    templates: ['counts', 'templates'] as const,
    analytics: ['counts', 'analytics'] as const,
    varianceAnalysis: (filters?: CountFilters) => [...queryKeys.counts.all, 'variance', filters] as const,
  },
}

// Auth Hooks
export const useCurrentUser = (options?: UseQueryOptions<User>) => {
  return useQuery({
    queryKey: queryKeys.auth.currentUser,
    queryFn: () => authService.getCurrentUser(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  })
}

export const useLogin = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (credentials: LoginRequest) => authService.login(credentials),
    onSuccess: (data) => {
      // Store tokens
      localStorage.setItem('access_token', data.access_token)
      localStorage.setItem('refresh_token', data.refresh_token)
      
      // Update current user cache
      queryClient.setQueryData(queryKeys.auth.currentUser, data.user)
    },
  })
}

export const useRegister = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (userData: RegisterRequest) => authService.register(userData),
    onSuccess: (data) => {
      // Store tokens
      localStorage.setItem('access_token', data.access_token)
      localStorage.setItem('refresh_token', data.refresh_token)
      
      // Update current user cache
      queryClient.setQueryData(queryKeys.auth.currentUser, data.user)
    },
  })
}

export const useLogout = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      // Clear tokens
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      
      // Clear all queries
      queryClient.clear()
    },
  })
}

// Inventory Hooks
export const useInventoryItems = (filters?: InventoryFilters, options?: UseQueryOptions<{ items: InventoryItem[]; total: number; page: number; size: number; pages: number }>) => {
  return useQuery({
    queryKey: queryKeys.inventory.items(filters),
    queryFn: () => inventoryService.getItems(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...options,
  })
}

export const useInventoryItem = (id: number, options?: UseQueryOptions<InventoryItem>) => {
  return useQuery({
    queryKey: queryKeys.inventory.item(id),
    queryFn: () => inventoryService.getItem(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  })
}

export const useCreateInventoryItem = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (itemData: CreateItemRequest) => inventoryService.createItem(itemData),
    onSuccess: () => {
      // Invalidate and refetch inventory items
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.items() })
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.analytics })
    },
  })
}

export const useUpdateInventoryItem = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, ...itemData }: { id: number } & Partial<CreateItemRequest>) =>
      inventoryService.updateItem(id, itemData),
    onSuccess: (updatedItem) => {
      // Update the specific item in cache
      queryClient.setQueryData(queryKeys.inventory.item(updatedItem.id), updatedItem)
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.items() })
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.analytics })
    },
  })
}

export const useDeleteInventoryItem = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: number) => inventoryService.deleteItem(id),
    onSuccess: (_, deletedId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: queryKeys.inventory.item(deletedId) })
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.items() })
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.analytics })
    },
  })
}

export const useCategories = (options?: UseQueryOptions<Category[]>) => {
  return useQuery({
    queryKey: queryKeys.inventory.categories,
    queryFn: () => inventoryService.getCategories(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  })
}

export const useCreateCategory = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (categoryData: CreateCategoryRequest) => inventoryService.createCategory(categoryData),
    onSuccess: () => {
      // Invalidate categories
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.categories })
    },
  })
}

export const useUpdateCategory = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, ...categoryData }: { id: number } & Partial<CreateCategoryRequest>) =>
      inventoryService.updateCategory(id, categoryData),
    onSuccess: (updatedCategory) => {
      // Update the specific category in cache
      queryClient.setQueryData(queryKeys.inventory.category(updatedCategory.id), updatedCategory)
      
      // Invalidate categories list
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.categories })
    },
  })
}

export const useDeleteCategory = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: number) => inventoryService.deleteCategory(id),
    onSuccess: (_, deletedId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: queryKeys.inventory.category(deletedId) })
      
      // Invalidate categories list
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.categories })
    },
  })
}

export const useLowStockItems = (threshold?: number, options?: UseQueryOptions<InventoryItem[]>) => {
  return useQuery({
    queryKey: queryKeys.inventory.lowStock(threshold),
    queryFn: () => inventoryService.getLowStockItems(threshold),
    staleTime: 1 * 60 * 1000, // 1 minute
    ...options,
  })
}

export const useInventoryAnalytics = (options?: UseQueryOptions<any>) => {
  return useQuery({
    queryKey: queryKeys.inventory.analytics,
    queryFn: () => inventoryService.getInventoryAnalytics(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  })
}

// Counts Hooks
export const useCounts = (filters?: CountFilters, options?: UseQueryOptions<{ items: CountEntry[]; total: number; page: number; size: number; pages: number }>) => {
  return useQuery({
    queryKey: queryKeys.counts.list(filters),
    queryFn: () => countsService.getCounts(filters),
    staleTime: 1 * 60 * 1000, // 1 minute
    ...options,
  })
}

export const useCount = (id: number, options?: UseQueryOptions<CountEntry>) => {
  return useQuery({
    queryKey: queryKeys.counts.item(id),
    queryFn: () => countsService.getCount(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...options,
  })
}

export const useCreateCount = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (countData: CreateCountRequest) => countsService.createCount(countData),
    onSuccess: () => {
      // Invalidate counts lists
      queryClient.invalidateQueries({ queryKey: queryKeys.counts.list() })
      queryClient.invalidateQueries({ queryKey: queryKeys.counts.today() })
      queryClient.invalidateQueries({ queryKey: queryKeys.counts.pending() })
      queryClient.invalidateQueries({ queryKey: queryKeys.counts.analytics })
    },
  })
}

export const useUpdateCount = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, ...countData }: { id: number } & Partial<CreateCountRequest>) =>
      countsService.updateCount(id, countData),
    onSuccess: (updatedCount) => {
      // Update the specific count in cache
      queryClient.setQueryData(queryKeys.counts.item(updatedCount.id), updatedCount)
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: queryKeys.counts.list() })
      queryClient.invalidateQueries({ queryKey: queryKeys.counts.today() })
      queryClient.invalidateQueries({ queryKey: queryKeys.counts.pending() })
    },
  })
}

export const useApproveCount = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, ...approvalData }: { id: number; approved: boolean; notes?: string }) =>
      countsService.approveCount(id, approvalData),
    onSuccess: (updatedCount) => {
      // Update the specific count in cache
      queryClient.setQueryData(queryKeys.counts.item(updatedCount.id), updatedCount)
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: queryKeys.counts.list() })
      queryClient.invalidateQueries({ queryKey: queryKeys.counts.pending() })
      queryClient.invalidateQueries({ queryKey: queryKeys.counts.analytics })
    },
  })
}

export const useTodayCounts = (locationId?: number, options?: UseQueryOptions<CountEntry[]>) => {
  return useQuery({
    queryKey: queryKeys.counts.today(locationId),
    queryFn: () => countsService.getTodayCounts(locationId),
    staleTime: 30 * 1000, // 30 seconds
    ...options,
  })
}

export const usePendingCounts = (locationId?: number, options?: UseQueryOptions<CountEntry[]>) => {
  return useQuery({
    queryKey: queryKeys.counts.pending(locationId),
    queryFn: () => countsService.getPendingCounts(locationId),
    staleTime: 1 * 60 * 1000, // 1 minute
    ...options,
  })
}

export const useCountTemplates = (options?: UseQueryOptions<any[]>) => {
  return useQuery({
    queryKey: queryKeys.counts.templates,
    queryFn: () => countsService.getCountTemplates(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  })
}

export const useCountAnalytics = (options?: UseQueryOptions<any>) => {
  return useQuery({
    queryKey: queryKeys.counts.analytics,
    queryFn: () => countsService.getCountAnalytics(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  })
}

export const useVarianceAnalysis = (filters?: CountFilters, options?: UseQueryOptions<any>) => {
  return useQuery({
    queryKey: queryKeys.counts.varianceAnalysis(filters),
    queryFn: () => countsService.getVarianceAnalysis(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  })
} 