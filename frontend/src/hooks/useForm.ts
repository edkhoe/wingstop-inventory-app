import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import {
  loginSchema,
  registerSchema,
  inventoryItemSchema,
  categorySchema,
  countEntrySchema,
  locationSchema,
  searchSchema,
  LoginFormData,
  RegisterFormData,
  InventoryItemFormData,
  CategoryFormData,
  CountEntryFormData,
  LocationFormData,
  SearchFormData
} from '../utils/validation'

// Pre-configured form hooks for common use cases
export function useLoginForm() {
  return useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      email: '',
      password: ''
    },
    mode: 'onBlur',
    reValidateMode: 'onChange'
  })
}

export function useRegisterForm() {
  return useForm<RegisterFormData>({
    resolver: yupResolver(registerSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      roleId: 0,
      locationId: 0
    },
    mode: 'onBlur',
    reValidateMode: 'onChange'
  })
}

export function useInventoryItemForm() {
  return useForm<InventoryItemFormData>({
    resolver: yupResolver(inventoryItemSchema),
    defaultValues: {
      name: '',
      categoryId: '',
      unit: '',
      parLevel: 0,
      reorderIncrement: 0,
      vendor: '',
      sku: ''
    },
    mode: 'onBlur',
    reValidateMode: 'onChange'
  })
}

export function useCategoryForm() {
  return useForm<CategoryFormData>({
    resolver: yupResolver(categorySchema),
    defaultValues: {
      name: '',
      color: '#E31837' // Wingstop red
    },
    mode: 'onBlur',
    reValidateMode: 'onChange'
  })
}

export function useCountEntryForm() {
  return useForm<CountEntryFormData>({
    resolver: yupResolver(countEntrySchema),
    defaultValues: {
      itemId: '',
      quantity: 0,
      locationId: '',
      notes: ''
    },
    mode: 'onBlur',
    reValidateMode: 'onChange'
  })
}

export function useLocationForm() {
  return useForm<LocationFormData>({
    resolver: yupResolver(locationSchema),
    defaultValues: {
      name: '',
      address: '',
      phone: '',
      email: ''
    },
    mode: 'onBlur',
    reValidateMode: 'onChange'
  })
}

export function useSearchForm() {
  return useForm<SearchFormData>({
    resolver: yupResolver(searchSchema),
    defaultValues: {
      query: '',
      category: '',
      location: '',
      sortBy: 'name',
      sortOrder: 'asc'
    },
    mode: 'onBlur',
    reValidateMode: 'onChange'
  })
} 