import React from 'react'
import { useFormContext, Controller } from 'react-hook-form'
import { Input, Select, Checkbox } from '../ui'
import { cn } from '../../utils/cn'

export interface FormFieldProps {
  name: string
  label?: string
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url'
  placeholder?: string
  helperText?: string
  required?: boolean
  disabled?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  clearable?: boolean
  onClear?: () => void
  fullWidth?: boolean
  variant?: 'default' | 'filled' | 'outlined'
  className?: string
}

export interface SelectFieldProps extends Omit<FormFieldProps, 'type'> {
  options: Array<{ value: string; label: string; disabled?: boolean }>
  searchable?: boolean
  multiple?: boolean
}

export interface CheckboxFieldProps extends Omit<FormFieldProps, 'type' | 'placeholder' | 'leftIcon' | 'rightIcon' | 'clearable' | 'onClear' | 'fullWidth' | 'variant'> {
  indeterminate?: boolean
}

// Text Input Field
export const FormField: React.FC<FormFieldProps> = ({
  name,
  label,
  type = 'text',
  placeholder,
  helperText,
  required = false,
  disabled = false,
  leftIcon,
  rightIcon,
  clearable = false,
  onClear,
  fullWidth = false,
  variant = 'default',
  className
}) => {
  const { control, formState: { errors } } = useFormContext()
  const error = errors[name]?.message as string

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <Input
          {...field}
          type={type}
          label={label}
          placeholder={placeholder}
          helperText={helperText}
          error={error}
          disabled={disabled}
          leftIcon={leftIcon}
          rightIcon={rightIcon}
          clearable={clearable}
          onClear={onClear}
          fullWidth={fullWidth}
          variant={variant}
          className={className}
        />
      )}
    />
  )
}

// Select Field
export const SelectField: React.FC<SelectFieldProps> = ({
  name,
  label,
  options,
  placeholder,
  helperText,
  required = false,
  disabled = false,
  searchable = false,
  multiple = false,
  className
}) => {
  const { control, formState: { errors } } = useFormContext()
  const error = errors[name]?.message as string

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <Select
          {...field}
          options={options}
          placeholder={placeholder}
          label={label}
          error={error}
          disabled={disabled}
          searchable={searchable}
          multiple={multiple}
          className={className}
        />
      )}
    />
  )
}

// Checkbox Field
export const CheckboxField: React.FC<CheckboxFieldProps> = ({
  name,
  label,
  helperText,
  required = false,
  disabled = false,
  indeterminate = false,
  className
}) => {
  const { control, formState: { errors } } = useFormContext()
  const error = errors[name]?.message as string

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <Checkbox
          {...field}
          label={label}
          error={error}
          disabled={disabled}
          indeterminate={indeterminate}
          className={className}
        />
      )}
    />
  )
}

// Form Field Group
export interface FormFieldGroupProps {
  children: React.ReactNode
  className?: string
}

export const FormFieldGroup: React.FC<FormFieldGroupProps> = ({
  children,
  className
}) => {
  return (
    <div className={cn('space-y-4', className)}>
      {children}
    </div>
  )
}

// Form Field Row (for horizontal layouts)
export interface FormFieldRowProps {
  children: React.ReactNode
  className?: string
}

export const FormFieldRow: React.FC<FormFieldRowProps> = ({
  children,
  className
}) => {
  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 gap-4', className)}>
      {children}
    </div>
  )
} 