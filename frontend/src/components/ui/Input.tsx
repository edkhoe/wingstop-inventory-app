import React, { forwardRef } from 'react'
import { cn } from '../../utils/cn'
import { Eye, EyeOff, Search, X } from 'lucide-react'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  clearable?: boolean
  onClear?: () => void
  fullWidth?: boolean
  variant?: 'default' | 'filled' | 'outlined'
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  clearable = false,
  onClear,
  fullWidth = false,
  variant = 'default',
  className,
  type = 'text',
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = React.useState(false)
  const [hasValue, setHasValue] = React.useState(false)
  
  const inputType = type === 'password' && showPassword ? 'text' : type
  
  const baseClasses = 'block w-full rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variantClasses = {
    default: 'border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:border-wingstop-red focus:ring-wingstop-red',
    filled: 'border-transparent bg-gray-50 text-gray-900 placeholder-gray-500 focus:bg-white focus:border-wingstop-red focus:ring-wingstop-red',
    outlined: 'border-gray-300 bg-transparent text-gray-900 placeholder-gray-500 focus:border-wingstop-red focus:ring-wingstop-red'
  }
  
  const errorClasses = error ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500' : ''
  const widthClass = fullWidth ? 'w-full' : ''
  
  const sizeClasses = 'px-3 py-2 text-sm'
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHasValue(e.target.value.length > 0)
    props.onChange?.(e)
  }
  
  const handleClear = () => {
    if (onClear) {
      onClear()
    }
    setHasValue(false)
  }
  
  return (
    <div className={cn('space-y-1', widthClass)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <div className="h-5 w-5 text-gray-400">
              {leftIcon}
            </div>
          </div>
        )}
        
        <input
          ref={ref}
          type={inputType}
          className={cn(
            baseClasses,
            variantClasses[variant],
            errorClasses,
            sizeClasses,
            leftIcon && 'pl-10',
            (rightIcon || clearable || type === 'password') && 'pr-10',
            className
          )}
          onChange={handleInputChange}
          {...props}
        />
        
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
          {type === 'password' && (
            <button
              type="button"
              className="text-gray-400 hover:text-gray-600 focus:outline-none"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          )}
          
          {clearable && hasValue && (
            <button
              type="button"
              className="text-gray-400 hover:text-gray-600 focus:outline-none"
              onClick={handleClear}
            >
              <X className="h-4 w-4" />
            </button>
          )}
          
          {rightIcon && !clearable && type !== 'password' && (
            <div className="text-gray-400">
              {rightIcon}
            </div>
          )}
        </div>
      </div>
      
      {(error || helperText) && (
        <div className="text-sm">
          {error && (
            <p className="text-red-600">{error}</p>
          )}
          {helperText && !error && (
            <p className="text-gray-500">{helperText}</p>
          )}
        </div>
      )}
    </div>
  )
})

Input.displayName = 'Input'

export default Input 