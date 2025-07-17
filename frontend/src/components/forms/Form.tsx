import React from 'react'
import { FormProvider, UseFormReturn, FieldValues } from 'react-hook-form'
import { Button, Alert } from '../ui'
import { cn } from '../../utils/cn'

export interface FormProps<T extends FieldValues = FieldValues> {
  form: UseFormReturn<T>
  onSubmit: (data: T) => void | Promise<void>
  children: React.ReactNode
  className?: string
  submitText?: string
  cancelText?: string
  onCancel?: () => void
  loading?: boolean
  error?: string
  success?: string
  showActions?: boolean
  submitVariant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success'
  submitSize?: 'sm' | 'md' | 'lg' | 'xl'
}

export const Form = <T extends FieldValues = FieldValues>({
  form,
  onSubmit,
  children,
  className,
  submitText = 'Submit',
  cancelText = 'Cancel',
  onCancel,
  loading = false,
  error,
  success,
  showActions = true,
  submitVariant = 'primary',
  submitSize = 'md'
}: FormProps<T>) => {
  const handleSubmit = form.handleSubmit(onSubmit)

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit} className={cn('space-y-6', className)}>
        {/* Error Alert */}
        {error && (
          <Alert type="error" title="Error" dismissible>
            {error}
          </Alert>
        )}

        {/* Success Alert */}
        {success && (
          <Alert type="success" title="Success" dismissible>
            {success}
          </Alert>
        )}

        {/* Form Fields */}
        <div className="space-y-4">
          {children}
        </div>

        {/* Form Actions */}
        {showActions && (
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                size={submitSize}
                onClick={onCancel}
                disabled={loading}
              >
                {cancelText}
              </Button>
            )}
            <Button
              type="submit"
              variant={submitVariant}
              size={submitSize}
              loading={loading}
              disabled={loading}
            >
              {submitText}
            </Button>
          </div>
        )}
      </form>
    </FormProvider>
  )
}

// Form Section for grouping related fields
export interface FormSectionProps {
  title?: string
  description?: string
  children: React.ReactNode
  className?: string
}

export const FormSection: React.FC<FormSectionProps> = ({
  title,
  description,
  children,
  className
}) => {
  return (
    <div className={cn('space-y-4', className)}>
      {(title || description) && (
        <div className="border-b border-gray-200 pb-4">
          {title && (
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-sm text-gray-600">
              {description}
            </p>
          )}
        </div>
      )}
      <div className="space-y-4">
        {children}
      </div>
    </div>
  )
}

// Form Actions for custom action layouts
export interface FormActionsProps {
  children: React.ReactNode
  className?: string
}

export const FormActions: React.FC<FormActionsProps> = ({
  children,
  className
}) => {
  return (
    <div className={cn('flex items-center justify-end space-x-3 pt-4 border-t border-gray-200', className)}>
      {children}
    </div>
  )
} 