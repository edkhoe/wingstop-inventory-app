import React from 'react'
import { cn } from '../../utils/cn'

interface ResponsiveButtonProps {
  children: React.ReactNode
  className?: string
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  responsiveSize?: {
    xs?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
    sm?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
    md?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
    lg?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
    xl?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  }
  disabled?: boolean
  loading?: boolean
  fullWidth?: boolean
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
}

const ResponsiveButton: React.FC<ResponsiveButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  responsiveSize,
  disabled = false,
  loading = false,
  fullWidth = false,
  onClick,
  type = 'button'
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'

  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
    outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
  }

  const sizeClasses = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
    xl: 'px-8 py-4 text-lg'
  }

  const getResponsiveSizeClasses = () => {
    if (!responsiveSize) return sizeClasses[size]
    
    const classes = []
    if (responsiveSize.xs) classes.push(`text-xs px-2 py-1`)
    if (responsiveSize.sm) classes.push(`sm:text-sm sm:px-3 sm:py-1.5`)
    if (responsiveSize.md) classes.push(`md:text-sm md:px-4 md:py-2`)
    if (responsiveSize.lg) classes.push(`lg:text-base lg:px-6 lg:py-3`)
    if (responsiveSize.xl) classes.push(`xl:text-lg xl:px-8 xl:py-4`)
    
    return classes.length > 0 ? classes.join(' ') : sizeClasses[size]
  }

  const widthClass = fullWidth ? 'w-full' : ''
  const loadingClass = loading ? 'opacity-75 cursor-wait' : ''

  return (
    <button
      type={type}
      className={cn(
        baseClasses,
        variantClasses[variant],
        getResponsiveSizeClasses(),
        widthClass,
        loadingClass,
        className
      )}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  )
}

export default ResponsiveButton 