import React from 'react'
import { cn } from '../../utils/cn'
import { Loader2 } from 'lucide-react'

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  className
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  }

  return (
    <Loader2
      className={cn(
        'animate-spin text-wingstop-red',
        sizeClasses[size],
        className
      )}
    />
  )
}

export interface SkeletonProps {
  className?: string
  lines?: number
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  lines = 1
}) => {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={cn(
            'animate-pulse bg-gray-200 rounded',
            className
          )}
          style={{ height: '1rem' }}
        />
      ))}
    </div>
  )
}

export interface LoadingOverlayProps {
  children: React.ReactNode
  loading: boolean
  text?: string
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  children,
  loading,
  text = 'Loading...'
}) => {
  if (!loading) return <>{children}</>

  return (
    <div className="relative">
      {children}
      <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" className="mb-2" />
          <p className="text-sm text-gray-600">{text}</p>
        </div>
      </div>
    </div>
  )
}

export default Spinner 