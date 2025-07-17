import React from 'react'
import { cn } from '../../utils/cn'
import { useResponsive } from '../../hooks/useResponsive'

interface Column<T> {
  key: keyof T
  header: string
  render?: (value: T[keyof T], item: T) => React.ReactNode
  sortable?: boolean
  width?: string
  hideOnMobile?: boolean
}

interface ResponsiveTableProps<T> {
  data: T[]
  columns: Column<T>[]
  className?: string
  variant?: 'default' | 'striped' | 'bordered' | 'compact'
  mobileVariant?: 'stack' | 'cards' | 'scroll'
  onRowClick?: (item: T) => void
  sortable?: boolean
  onSort?: (key: keyof T, direction: 'asc' | 'desc') => void
  sortKey?: keyof T
  sortDirection?: 'asc' | 'desc'
  loading?: boolean
  emptyMessage?: string
}

const ResponsiveTable = <T extends Record<string, any>>({
  data,
  columns,
  className,
  variant = 'default',
  mobileVariant = 'cards',
  onRowClick,
  sortable = false,
  onSort,
  sortKey,
  sortDirection,
  loading = false,
  emptyMessage = 'No data available'
}: ResponsiveTableProps<T>) => {
  const { isMobile, isTablet } = useResponsive()

  const variantClasses = {
    default: 'bg-white',
    striped: 'bg-white [&>tbody>tr:nth-child(odd)]:bg-gray-50',
    bordered: 'bg-white border border-gray-200',
    compact: 'bg-white [&>tbody>tr]:border-b [&>tbody>tr]:border-gray-100'
  }

  const mobileVariantClasses = {
    stack: 'space-y-2',
    cards: 'space-y-4',
    scroll: 'overflow-x-auto'
  }

  const handleSort = (key: keyof T) => {
    if (!sortable || !onSort) return
    
    const direction = sortKey === key && sortDirection === 'asc' ? 'desc' : 'asc'
    onSort(key, direction)
  }

  const renderSortIcon = (key: keyof T) => {
    if (!sortable || sortKey !== key) return null
    
    return (
      <span className="ml-1">
        {sortDirection === 'asc' ? '↑' : '↓'}
      </span>
    )
  }

  const renderMobileCard = (item: T) => (
    <div
      key={JSON.stringify(item)}
      className={cn(
        'bg-white rounded-lg border border-gray-200 p-4 space-y-2',
        onRowClick && 'cursor-pointer hover:bg-gray-50 transition-colors'
      )}
      onClick={() => onRowClick?.(item)}
    >
      {columns
        .filter(col => !col.hideOnMobile)
        .map((column) => (
          <div key={String(column.key)} className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-500">{column.header}:</span>
            <span className="text-sm text-gray-900">
              {column.render 
                ? column.render(item[column.key], item)
                : String(item[column.key] || '')
              }
            </span>
          </div>
        ))}
    </div>
  )

  const renderMobileStack = (item: T) => (
    <div
      key={JSON.stringify(item)}
      className={cn(
        'bg-white border-b border-gray-200 py-3',
        onRowClick && 'cursor-pointer hover:bg-gray-50 transition-colors'
      )}
      onClick={() => onRowClick?.(item)}
    >
      <div className="space-y-2">
        {columns
          .filter(col => !col.hideOnMobile)
          .map((column) => (
            <div key={String(column.key)} className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-500">{column.header}:</span>
              <span className="text-sm text-gray-900">
                {column.render 
                  ? column.render(item[column.key], item)
                  : String(item[column.key] || '')
                }
              </span>
            </div>
          ))}
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className={cn('animate-pulse', className)}>
        <div className="bg-gray-200 h-8 rounded mb-4"></div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-gray-200 h-12 rounded mb-2"></div>
        ))}
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className={cn('text-center py-8 text-gray-500', className)}>
        {emptyMessage}
      </div>
    )
  }

  // Mobile rendering
  if (isMobile || isTablet) {
    return (
      <div className={cn(mobileVariantClasses[mobileVariant], className)}>
        {mobileVariant === 'cards' 
          ? data.map(renderMobileCard)
          : data.map(renderMobileStack)
        }
      </div>
    )
  }

  // Desktop rendering
  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className={cn('min-w-full divide-y divide-gray-200', variantClasses[variant])}>
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column) => (
              <th
                key={String(column.key)}
                className={cn(
                  'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
                  column.width && column.width,
                  sortable && column.sortable && 'cursor-pointer hover:bg-gray-100'
                )}
                onClick={() => column.sortable && handleSort(column.key)}
              >
                <div className="flex items-center">
                  {column.header}
                  {column.sortable && renderSortIcon(column.key)}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((item, index) => (
            <tr
              key={index}
              className={cn(
                onRowClick && 'cursor-pointer hover:bg-gray-50 transition-colors'
              )}
              onClick={() => onRowClick?.(item)}
            >
              {columns.map((column) => (
                <td
                  key={String(column.key)}
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                >
                  {column.render 
                    ? column.render(item[column.key], item)
                    : String(item[column.key] || '')
                  }
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default ResponsiveTable 