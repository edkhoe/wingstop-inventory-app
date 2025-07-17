# Responsive Design System

This document outlines the responsive design system implemented for the Wingstop Inventory App.

## Overview

The responsive design system provides a comprehensive set of components and utilities that adapt to different screen sizes, ensuring optimal user experience across all devices.

## Breakpoints

The system uses the following breakpoints:

- **xs**: 475px (Extra small devices)
- **sm**: 640px (Small devices)
- **md**: 768px (Medium devices)
- **lg**: 1024px (Large devices)
- **xl**: 1280px (Extra large devices)
- **2xl**: 1536px (2X large devices)

## Responsive Components

### ResponsiveContainer

A container component that adapts its max-width and padding based on screen size.

```tsx
import { ResponsiveContainer } from '../components/ui'

<ResponsiveContainer maxWidth="xl" padding="md">
  {/* Content */}
</ResponsiveContainer>
```

**Props:**
- `maxWidth`: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
- `padding`: 'none' | 'sm' | 'md' | 'lg' | 'xl'
- `as`: HTML element to render as

### ResponsiveGrid

A grid component that adapts its column count based on screen size.

```tsx
import { ResponsiveGrid } from '../components/ui'

<ResponsiveGrid cols={{ xs: 1, sm: 2, md: 3, lg: 4, xl: 5, '2xl': 6 }}>
  {/* Grid items */}
</ResponsiveGrid>
```

**Props:**
- `cols`: Object defining columns for each breakpoint
- `gap`: 'none' | 'sm' | 'md' | 'lg' | 'xl'

### ResponsiveCard

A card component with different variants and responsive padding.

```tsx
import { ResponsiveCard } from '../components/ui'

<ResponsiveCard variant="default" padding="md" hover interactive>
  {/* Card content */}
</ResponsiveCard>
```

**Props:**
- `variant`: 'default' | 'elevated' | 'outlined' | 'flat'
- `padding`: 'none' | 'sm' | 'md' | 'lg' | 'xl'
- `hover`: boolean for hover effects
- `interactive`: boolean for click interactions

### ResponsiveText

A text component that adapts font size, weight, and color based on screen size.

```tsx
import { ResponsiveText } from '../components/ui'

<ResponsiveText
  size={{ xs: 'sm', sm: 'base', md: 'lg', lg: 'xl' }}
  weight="semibold"
  color="primary"
>
  Responsive text content
</ResponsiveText>
```

**Props:**
- `size`: Object defining font sizes for each breakpoint
- `weight`: 'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold'
- `color`: 'default' | 'muted' | 'primary' | 'secondary' | 'success' | 'warning' | 'error'
- `align`: 'left' | 'center' | 'right' | 'justify'
- `truncate`: boolean for text truncation
- `lineClamp`: 1 | 2 | 3 | 4 | 5 for line clamping

### ResponsiveButton

A button component with responsive sizing and variants.

```tsx
import { ResponsiveButton } from '../components/ui'

<ResponsiveButton
  variant="primary"
  responsiveSize={{ xs: 'sm', sm: 'md', md: 'lg', lg: 'xl' }}
  fullWidth
>
  Click me
</ResponsiveButton>
```

**Props:**
- `variant`: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success'
- `size`: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
- `responsiveSize`: Object defining sizes for each breakpoint
- `fullWidth`: boolean for full width
- `loading`: boolean for loading state
- `disabled`: boolean for disabled state

### ResponsiveLayout

A layout component that provides different layout patterns.

```tsx
import { ResponsiveLayout } from '../components/ui'

<ResponsiveLayout layout="sidebar" gap="md">
  <div>Sidebar content</div>
  <div>Main content</div>
</ResponsiveLayout>
```

**Props:**
- `layout`: 'stack' | 'grid' | 'sidebar' | 'split'
- `columns`: Object defining grid columns for each breakpoint
- `gap`: 'none' | 'sm' | 'md' | 'lg' | 'xl'
- `sidebarWidth`: 'sm' | 'md' | 'lg' | 'xl'
- `reverse`: boolean for reversed layout

### ResponsiveImage

An image component with responsive sizing and loading states.

```tsx
import { ResponsiveImage } from '../components/ui'

<ResponsiveImage
  src="/path/to/image.jpg"
  alt="Description"
  aspectRatio="video"
  objectFit="cover"
  sizes={{ xs: 'w-full', sm: 'w-full', md: 'w-1/2' }}
/>
```

**Props:**
- `sizes`: Object defining image sizes for each breakpoint
- `aspectRatio`: 'square' | 'video' | 'photo' | 'wide' | 'ultrawide' | 'custom'
- `objectFit`: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down'
- `loading`: 'lazy' | 'eager'
- `placeholder`: string for loading placeholder
- `fallback`: string for error fallback

### ResponsiveTable

A table component that adapts to mobile with cards or stacked layout.

```tsx
import { ResponsiveTable } from '../components/ui'

<ResponsiveTable
  data={tableData}
  columns={columns}
  variant="striped"
  mobileVariant="cards"
  sortable
  onSort={handleSort}
/>
```

**Props:**
- `data`: Array of data objects
- `columns`: Array of column definitions
- `variant`: 'default' | 'striped' | 'bordered' | 'compact'
- `mobileVariant`: 'stack' | 'cards' | 'scroll'
- `sortable`: boolean for sortable columns
- `onSort`: function for sort handling
- `loading`: boolean for loading state

## Responsive Hooks

### useResponsive

Main hook that provides screen size information.

```tsx
import { useResponsive } from '../hooks/useResponsive'

const { breakpoint, isMobile, isTablet, isDesktop, width, height } = useResponsive()
```

**Returns:**
- `breakpoint`: Current breakpoint string
- `isMobile`: boolean for mobile devices
- `isTablet`: boolean for tablet devices
- `isDesktop`: boolean for desktop devices
- `isLargeDesktop`: boolean for large desktop devices
- `width`: Current window width
- `height`: Current window height

### useBreakpoint

Hook for checking specific breakpoints.

```tsx
import { useBreakpoint } from '../hooks/useResponsive'

const isLargeScreen = useBreakpoint('lg')
```

### useIsMobile / useIsDesktop

Convenience hooks for device type detection.

```tsx
import { useIsMobile, useIsDesktop } from '../hooks/useResponsive'

const isMobile = useIsMobile()
const isDesktop = useIsDesktop()
```

## Utility Functions

### cn (className utility)

Utility for combining class names with Tailwind CSS.

```tsx
import { cn } from '../utils/cn'

const className = cn(
  'base-class',
  condition && 'conditional-class',
  'another-class'
)
```

## Best Practices

1. **Mobile-First Design**: Always start with mobile styles and enhance for larger screens
2. **Progressive Enhancement**: Add features and complexity as screen size increases
3. **Touch-Friendly**: Ensure all interactive elements are at least 44px on mobile
4. **Performance**: Use lazy loading for images and optimize for mobile networks
5. **Accessibility**: Maintain proper contrast ratios and focus states across all screen sizes
6. **Testing**: Test on actual devices, not just browser dev tools

## Examples

See the `ResponsiveDemo` page for comprehensive examples of all responsive components in action.

## Customization

The responsive system can be customized by:

1. Modifying breakpoints in `tailwind.config.js`
2. Adding new responsive components following the established patterns
3. Extending the responsive hooks with additional functionality
4. Creating custom responsive utilities for specific use cases 