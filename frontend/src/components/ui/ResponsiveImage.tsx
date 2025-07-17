import React, { useState } from 'react'
import { cn } from '../../utils/cn'

interface ResponsiveImageProps {
  src: string
  alt: string
  className?: string
  sizes?: {
    xs?: string
    sm?: string
    md?: string
    lg?: string
    xl?: string
    '2xl'?: string
  }
  aspectRatio?: 'square' | 'video' | 'photo' | 'wide' | 'ultrawide' | 'custom'
  customAspectRatio?: string
  loading?: 'lazy' | 'eager'
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down'
  placeholder?: string
  fallback?: string
  onLoad?: () => void
  onError?: () => void
}

const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  src,
  alt,
  className,
  sizes = { xs: 'w-full', sm: 'w-full', md: 'w-full', lg: 'w-full', xl: 'w-full', '2xl': 'w-full' },
  aspectRatio = 'square',
  customAspectRatio,
  loading = 'lazy',
  objectFit = 'cover',
  placeholder,
  fallback,
  onLoad,
  onError
}) => {
  const [imageSrc, setImageSrc] = useState(src)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const aspectRatioClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    photo: 'aspect-[4/3]',
    wide: 'aspect-[16/9]',
    ultrawide: 'aspect-[21/9]',
    custom: customAspectRatio || 'aspect-square'
  }

  const objectFitClasses = {
    cover: 'object-cover',
    contain: 'object-contain',
    fill: 'object-fill',
    none: 'object-none',
    'scale-down': 'object-scale-down'
  }

  const getSizeClasses = () => {
    const sizeClasses = []
    
    if (sizes.xs) sizeClasses.push(sizes.xs)
    if (sizes.sm) sizeClasses.push(`sm:${sizes.sm}`)
    if (sizes.md) sizeClasses.push(`md:${sizes.md}`)
    if (sizes.lg) sizeClasses.push(`lg:${sizes.lg}`)
    if (sizes.xl) sizeClasses.push(`xl:${sizes.xl}`)
    if (sizes['2xl']) sizeClasses.push(`2xl:${sizes['2xl']}`)
    
    return sizeClasses.join(' ')
  }

  const handleLoad = () => {
    setIsLoading(false)
    onLoad?.()
  }

  const handleError = () => {
    setIsLoading(false)
    setHasError(true)
    if (fallback && imageSrc !== fallback) {
      setImageSrc(fallback)
    }
    onError?.()
  }

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Loading Placeholder */}
      {isLoading && placeholder && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="text-gray-400 text-sm">Loading...</div>
        </div>
      )}

      {/* Error State */}
      {hasError && !fallback && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="text-gray-400 text-sm">Image failed to load</div>
        </div>
      )}

      <img
        src={imageSrc}
        alt={alt}
        loading={loading}
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          'transition-opacity duration-300',
          aspectRatioClasses[aspectRatio],
          objectFitClasses[objectFit],
          getSizeClasses(),
          isLoading ? 'opacity-0' : 'opacity-100',
          hasError ? 'hidden' : ''
        )}
      />
    </div>
  )
}

export default ResponsiveImage 