import React from 'react'
import { cn } from '../../utils/cn'

interface ResponsiveCardProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'elevated' | 'outlined' | 'flat'
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  hover?: boolean
  interactive?: boolean
}

const ResponsiveCard: React.FC<ResponsiveCardProps> = ({
  children,
  className,
  variant = 'default',
  padding = 'md',
  hover = false,
  interactive = false
}) => {
  const variantClasses = {
    default: 'bg-white shadow-soft border border-gray-200',
    elevated: 'bg-white shadow-medium border-0',
    outlined: 'bg-white border-2 border-gray-200 shadow-none',
    flat: 'bg-gray-50 border border-gray-200 shadow-none'
  }

  const paddingClasses = {
    none: '',
    sm: 'p-3 sm:p-4',
    md: 'p-4 sm:p-6',
    lg: 'p-6 sm:p-8',
    xl: 'p-8 sm:p-12'
  }

  const hoverClasses = hover ? 'hover:shadow-medium hover:-translate-y-0.5 transition-all duration-200' : ''
  const interactiveClasses = interactive ? 'cursor-pointer active:scale-95' : ''

  return (
    <div
      className={cn(
        'rounded-xl transition-all duration-200',
        variantClasses[variant],
        paddingClasses[padding],
        hoverClasses,
        interactiveClasses,
        className
      )}
    >
      {children}
    </div>
  )
}

export default ResponsiveCard 