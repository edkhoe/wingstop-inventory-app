import React from 'react'
import { cn } from '../../utils/cn'

interface ResponsiveGridProps {
  children: React.ReactNode
  className?: string
  cols?: {
    xs?: number
    sm?: number
    md?: number
    lg?: number
    xl?: number
    '2xl'?: number
  }
  gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
}

const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  className,
  cols = { xs: 1, sm: 2, md: 3, lg: 4, xl: 5, '2xl': 6 },
  gap = 'md'
}) => {
  const gapClasses = {
    none: '',
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8'
  }

  const getGridCols = () => {
    const gridCols = []
    
    if (cols.xs) gridCols.push(`grid-cols-${cols.xs}`)
    if (cols.sm) gridCols.push(`sm:grid-cols-${cols.sm}`)
    if (cols.md) gridCols.push(`md:grid-cols-${cols.md}`)
    if (cols.lg) gridCols.push(`lg:grid-cols-${cols.lg}`)
    if (cols.xl) gridCols.push(`xl:grid-cols-${cols.xl}`)
    if (cols['2xl']) gridCols.push(`2xl:grid-cols-${cols['2xl']}`)
    
    return gridCols.join(' ')
  }

  return (
    <div
      className={cn(
        'grid',
        getGridCols(),
        gapClasses[gap],
        className
      )}
    >
      {children}
    </div>
  )
}

export default ResponsiveGrid 