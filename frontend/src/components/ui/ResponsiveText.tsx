import React from 'react'
import { cn } from '../../utils/cn'

interface ResponsiveTextProps {
  children: React.ReactNode
  className?: string
  as?: keyof JSX.IntrinsicElements
  size?: {
    xs?: string
    sm?: string
    md?: string
    lg?: string
    xl?: string
    '2xl'?: string
  }
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold'
  color?: 'default' | 'muted' | 'primary' | 'secondary' | 'success' | 'warning' | 'error'
  align?: 'left' | 'center' | 'right' | 'justify'
  truncate?: boolean
  lineClamp?: 1 | 2 | 3 | 4 | 5
}

const ResponsiveText: React.FC<ResponsiveTextProps> = ({
  children,
  className,
  as: Component = 'p',
  size = { xs: 'sm', sm: 'base', md: 'lg', lg: 'xl', xl: '2xl', '2xl': '3xl' },
  weight = 'normal',
  color = 'default',
  align = 'left',
  truncate = false,
  lineClamp
}) => {
  const weightClasses = {
    light: 'font-light',
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
    extrabold: 'font-extrabold'
  }

  const colorClasses = {
    default: 'text-gray-900',
    muted: 'text-gray-600',
    primary: 'text-blue-600',
    secondary: 'text-gray-500',
    success: 'text-green-600',
    warning: 'text-yellow-600',
    error: 'text-red-600'
  }

  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
    justify: 'text-justify'
  }

  const getSizeClasses = () => {
    const sizeClasses = []
    
    if (size.xs) sizeClasses.push(`text-${size.xs}`)
    if (size.sm) sizeClasses.push(`sm:text-${size.sm}`)
    if (size.md) sizeClasses.push(`md:text-${size.md}`)
    if (size.lg) sizeClasses.push(`lg:text-${size.lg}`)
    if (size.xl) sizeClasses.push(`xl:text-${size.xl}`)
    if (size['2xl']) sizeClasses.push(`2xl:text-${size['2xl']}`)
    
    return sizeClasses.join(' ')
  }

  const truncateClass = truncate ? 'truncate' : ''
  const lineClampClass = lineClamp ? `line-clamp-${lineClamp}` : ''

  return (
    <Component
      className={cn(
        getSizeClasses(),
        weightClasses[weight],
        colorClasses[color],
        alignClasses[align],
        truncateClass,
        lineClampClass,
        className
      )}
    >
      {children}
    </Component>
  )
}

export default ResponsiveText 