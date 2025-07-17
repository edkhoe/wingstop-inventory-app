import React from 'react'
import { cn } from '../../utils/cn'
import { AlertCircle, CheckCircle, Info, XCircle, X } from 'lucide-react'

export interface AlertProps {
  children: React.ReactNode
  type?: 'success' | 'error' | 'warning' | 'info'
  title?: string
  dismissible?: boolean
  onDismiss?: () => void
  className?: string
}

const Alert: React.FC<AlertProps> = ({
  children,
  type = 'info',
  title,
  dismissible = false,
  onDismiss,
  className
}) => {
  const typeConfig = {
    success: {
      icon: CheckCircle,
      classes: 'bg-green-50 border-green-200 text-green-800',
      iconClasses: 'text-green-400'
    },
    error: {
      icon: XCircle,
      classes: 'bg-red-50 border-red-200 text-red-800',
      iconClasses: 'text-red-400'
    },
    warning: {
      icon: AlertCircle,
      classes: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      iconClasses: 'text-yellow-400'
    },
    info: {
      icon: Info,
      classes: 'bg-blue-50 border-blue-200 text-blue-800',
      iconClasses: 'text-blue-400'
    }
  }

  const config = typeConfig[type]
  const Icon = config.icon

  return (
    <div
      className={cn(
        'border rounded-lg p-4',
        config.classes,
        className
      )}
    >
      <div className="flex">
        <div className="flex-shrink-0">
          <Icon className={cn('h-5 w-5', config.iconClasses)} />
        </div>
        <div className="ml-3 flex-1">
          {title && (
            <h3 className="text-sm font-medium mb-1">
              {title}
            </h3>
          )}
          <div className="text-sm">
            {children}
          </div>
        </div>
        {dismissible && (
          <div className="ml-auto pl-3">
            <button
              type="button"
              onClick={onDismiss}
              className={cn(
                'inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2',
                config.iconClasses,
                'hover:bg-opacity-20 hover:bg-current'
              )}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Alert 