import React from 'react'
import { cn } from '../../utils/cn'
import { Check } from 'lucide-react'

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
  error?: string
  indeterminate?: boolean
  className?: string
}

const Checkbox: React.FC<CheckboxProps> = ({
  label,
  error,
  indeterminate = false,
  className,
  ...props
}) => {
  const inputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = indeterminate
    }
  }, [indeterminate])

  return (
    <div className={cn('flex items-start', className)}>
      <div className="flex items-center h-5">
        <input
          ref={inputRef}
          type="checkbox"
          className={cn(
            'h-4 w-4 text-wingstop-red border-gray-300 rounded focus:ring-wingstop-red focus:ring-2',
            error && 'border-red-300 focus:ring-red-500'
          )}
          {...props}
        />
      </div>
      {label && (
        <div className="ml-3 text-sm">
          <label className="font-medium text-gray-700 cursor-pointer">
            {label}
          </label>
          {error && (
            <p className="mt-1 text-red-600">{error}</p>
          )}
        </div>
      )}
    </div>
  )
}

export default Checkbox 