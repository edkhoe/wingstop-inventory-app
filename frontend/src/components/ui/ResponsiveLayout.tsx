import React from 'react'
import { cn } from '../../utils/cn'
import { useResponsive } from '../../hooks/useResponsive'

interface ResponsiveLayoutProps {
  children: React.ReactNode
  className?: string
  layout?: 'stack' | 'grid' | 'sidebar' | 'split'
  columns?: {
    xs?: number
    sm?: number
    md?: number
    lg?: number
    xl?: number
    '2xl'?: number
  }
  gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  sidebarWidth?: 'sm' | 'md' | 'lg' | 'xl'
  reverse?: boolean
}

const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({
  children,
  className,
  layout = 'stack',
  columns = { xs: 1, sm: 2, md: 3, lg: 4, xl: 5, '2xl': 6 },
  gap = 'md',
  padding = 'md',
  sidebarWidth = 'md',
  reverse = false
}) => {
  const { isMobile, isTablet, isDesktop } = useResponsive()

  const gapClasses = {
    none: '',
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8'
  }

  const paddingClasses = {
    none: '',
    sm: 'p-2',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8'
  }

  const sidebarWidthClasses = {
    sm: 'w-48',
    md: 'w-64',
    lg: 'w-80',
    xl: 'w-96'
  }

  const getLayoutClasses = () => {
    switch (layout) {
      case 'stack':
        return 'flex flex-col'
      case 'grid':
        return 'grid'
      case 'sidebar':
        return isMobile ? 'flex flex-col' : 'flex'
      case 'split':
        return 'grid grid-cols-1 lg:grid-cols-2'
      default:
        return 'flex flex-col'
    }
  }

  const getGridCols = () => {
    if (layout !== 'grid') return ''
    
    const gridCols = []
    if (columns.xs) gridCols.push(`grid-cols-${columns.xs}`)
    if (columns.sm) gridCols.push(`sm:grid-cols-${columns.sm}`)
    if (columns.md) gridCols.push(`md:grid-cols-${columns.md}`)
    if (columns.lg) gridCols.push(`lg:grid-cols-${columns.lg}`)
    if (columns.xl) gridCols.push(`xl:grid-cols-${columns.xl}`)
    if (columns['2xl']) gridCols.push(`2xl:grid-cols-${columns['2xl']}`)
    
    return gridCols.join(' ')
  }

  const getSidebarClasses = () => {
    if (layout !== 'sidebar') return ''
    
    if (isMobile) {
      return 'order-2'
    }
    
    const order = reverse ? 'order-2' : 'order-1'
    const width = sidebarWidthClasses[sidebarWidth]
    
    return `${order} ${width}`
  }

  const getMainClasses = () => {
    if (layout !== 'sidebar') return ''
    
    if (isMobile) {
      return 'order-1'
    }
    
    const order = reverse ? 'order-1' : 'order-2'
    return `${order} flex-1`
  }

  return (
    <div
      className={cn(
        getLayoutClasses(),
        getGridCols(),
        gapClasses[gap],
        paddingClasses[padding],
        className
      )}
    >
      {React.Children.map(children, (child, index) => {
        if (layout === 'sidebar' && React.Children.count(children) === 2) {
          if (index === 0) {
            return (
              <div className={getSidebarClasses()}>
                {child}
              </div>
            )
          } else {
            return (
              <div className={getMainClasses()}>
                {child}
              </div>
            )
          }
        }
        return child
      })}
    </div>
  )
}

export default ResponsiveLayout 