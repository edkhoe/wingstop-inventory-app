import * as yup from 'yup'

// Common validation patterns
export const emailSchema = yup.string()
  .email('Please enter a valid email address')
  .required('Email is required')

export const passwordSchema = yup.string()
  .min(8, 'Password must be at least 8 characters')
  .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
  .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .matches(/[0-9]/, 'Password must contain at least one number')
  .matches(/[^A-Za-z0-9]/, 'Password must contain at least one special character')
  .required('Password is required')

export const confirmPasswordSchema = yup.string()
  .oneOf([yup.ref('password')], 'Passwords must match')
  .required('Please confirm your password')

// User authentication schemas
export const loginSchema = yup.object({
  email: emailSchema,
  password: yup.string().required('Password is required')
})

export const registerSchema = yup.object({
  username: yup.string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must be less than 50 characters')
    .matches(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
    .required('Username is required'),
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: confirmPasswordSchema,
  firstName: yup.string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters')
    .required('First name is required'),
  lastName: yup.string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be less than 50 characters')
    .required('Last name is required'),
  roleId: yup.number()
    .min(1, 'Please select a role')
    .required('Role is required'),
  locationId: yup.number()
    .min(1, 'Please select a location')
    .required('Location is required')
})

// Inventory item schemas
export const inventoryItemSchema = yup.object({
  name: yup.string()
    .min(2, 'Item name must be at least 2 characters')
    .max(100, 'Item name must be less than 100 characters')
    .required('Item name is required'),
  categoryId: yup.string()
    .required('Please select a category'),
  unit: yup.string()
    .min(1, 'Unit must be at least 1 character')
    .max(20, 'Unit must be less than 20 characters')
    .required('Unit is required'),
  parLevel: yup.number()
    .min(0, 'Par level must be 0 or greater')
    .typeError('Par level must be a number')
    .required('Par level is required'),
  reorderIncrement: yup.number()
    .min(0, 'Reorder increment must be 0 or greater')
    .typeError('Reorder increment must be a number')
    .required('Reorder increment is required'),
  vendor: yup.string()
    .max(100, 'Vendor must be less than 100 characters'),
  sku: yup.string()
    .max(50, 'SKU must be less than 50 characters')
})

// Category schemas
export const categorySchema = yup.object({
  name: yup.string()
    .min(2, 'Category name must be at least 2 characters')
    .max(50, 'Category name must be less than 50 characters')
    .required('Category name is required'),
  color: yup.string()
    .matches(/^#[0-9A-F]{6}$/i, 'Color must be a valid hex color')
    .required('Color is required')
})

// Count entry schemas
export const countEntrySchema = yup.object({
  itemId: yup.string()
    .required('Please select an item'),
  quantity: yup.number()
    .min(0, 'Quantity must be 0 or greater')
    .typeError('Quantity must be a number')
    .required('Quantity is required'),
  locationId: yup.string()
    .required('Please select a location'),
  notes: yup.string()
    .max(500, 'Notes must be less than 500 characters')
})

// Location schemas
export const locationSchema = yup.object({
  name: yup.string()
    .min(2, 'Location name must be at least 2 characters')
    .max(100, 'Location name must be less than 100 characters')
    .required('Location name is required'),
  address: yup.string()
    .max(200, 'Address must be less than 200 characters'),
  phone: yup.string()
    .matches(/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number')
    .max(20, 'Phone number must be less than 20 characters'),
  email: yup.string()
    .email('Please enter a valid email address')
    .max(100, 'Email must be less than 100 characters')
})

// Search and filter schemas
export const searchSchema = yup.object({
  query: yup.string()
    .max(100, 'Search query must be less than 100 characters'),
  category: yup.string(),
  location: yup.string(),
  sortBy: yup.string()
    .oneOf(['name', 'category', 'parLevel', 'lastCount'], 'Invalid sort option'),
  sortOrder: yup.string()
    .oneOf(['asc', 'desc'], 'Sort order must be ascending or descending')
})

// Export types for TypeScript
export type LoginFormData = yup.InferType<typeof loginSchema>
export type RegisterFormData = yup.InferType<typeof registerSchema>
export type InventoryItemFormData = yup.InferType<typeof inventoryItemSchema>
export type CategoryFormData = yup.InferType<typeof categorySchema>
export type CountEntryFormData = yup.InferType<typeof countEntrySchema>
export type LocationFormData = yup.InferType<typeof locationSchema>
export type SearchFormData = yup.InferType<typeof searchSchema> 