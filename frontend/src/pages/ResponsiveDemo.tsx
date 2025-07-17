import React from 'react'
import {
  ResponsiveContainer,
  ResponsiveGrid,
  ResponsiveCard,
  ResponsiveText,
  ResponsiveButton,
  ResponsiveLayout,
  useResponsive,
  useIsMobile
} from '../components/ui'
import { Package, TrendingUp, Users, DollarSign, BarChart3, Settings } from 'lucide-react'

const ResponsiveDemo: React.FC = () => {
  const { breakpoint, isMobile, isTablet, isDesktop } = useResponsive()
  const isMobileDevice = useIsMobile()

  const stats = [
    {
      title: 'Total Items',
      value: '1,234',
      change: '+12%',
      icon: Package,
      color: 'bg-blue-500'
    },
    {
      title: 'Active Counts',
      value: '89',
      change: '+5%',
      icon: TrendingUp,
      color: 'bg-green-500'
    },
    {
      title: 'Users Online',
      value: '23',
      change: '+2%',
      icon: Users,
      color: 'bg-purple-500'
    },
    {
      title: 'Revenue',
      value: '$45,678',
      change: '+8%',
      icon: DollarSign,
      color: 'bg-orange-500'
    }
  ]

  return (
    <ResponsiveContainer maxWidth="full" padding="lg">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <ResponsiveText
            as="h1"
            size={{ xs: '2xl', sm: '3xl', md: '4xl', lg: '5xl' }}
            weight="bold"
            className="text-gray-900 mb-4"
          >
            Responsive Design Demo
          </ResponsiveText>
          <ResponsiveText
            size={{ xs: 'sm', sm: 'base', md: 'lg' }}
            color="muted"
            className="max-w-2xl mx-auto"
          >
            This page demonstrates the responsive components and utilities built for the Wingstop Inventory App.
            Resize your browser window to see how the layout adapts to different screen sizes.
          </ResponsiveText>
        </div>

        {/* Current Breakpoint Info */}
        <ResponsiveCard variant="outlined" padding="md">
          <div className="text-center">
            <ResponsiveText weight="semibold" className="mb-2">
              Current Breakpoint: {breakpoint}
            </ResponsiveText>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
              <span className={isMobile ? 'text-blue-600 font-medium' : ''}>
                Mobile: {isMobile ? 'Yes' : 'No'}
              </span>
              <span className={isTablet ? 'text-blue-600 font-medium' : ''}>
                Tablet: {isTablet ? 'Yes' : 'No'}
              </span>
              <span className={isDesktop ? 'text-blue-600 font-medium' : ''}>
                Desktop: {isDesktop ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
        </ResponsiveCard>

        {/* Stats Grid */}
        <div>
          <ResponsiveText
            as="h2"
            size={{ xs: 'xl', sm: '2xl', md: '3xl' }}
            weight="semibold"
            className="mb-6"
          >
            Responsive Stats Grid
          </ResponsiveText>
          <ResponsiveGrid
            cols={{ xs: 1, sm: 2, md: 2, lg: 4, xl: 4, '2xl': 4 }}
            gap="md"
          >
            {stats.map((stat, index) => (
              <ResponsiveCard
                key={index}
                variant="default"
                padding="md"
                hover
                interactive
              >
                <div className="flex items-center justify-between">
                  <div>
                    <ResponsiveText
                      size={{ xs: 'sm', sm: 'base' }}
                      color="muted"
                      className="mb-1"
                    >
                      {stat.title}
                    </ResponsiveText>
                    <ResponsiveText
                      size={{ xs: 'xl', sm: '2xl', md: '3xl' }}
                      weight="bold"
                      className="mb-1"
                    >
                      {stat.value}
                    </ResponsiveText>
                    <ResponsiveText
                      size="sm"
                      color="success"
                      weight="medium"
                    >
                      {stat.change}
                    </ResponsiveText>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.color}`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </ResponsiveCard>
            ))}
          </ResponsiveGrid>
        </div>

        {/* Responsive Layout Examples */}
        <div>
          <ResponsiveText
            as="h2"
            size={{ xs: 'xl', sm: '2xl', md: '3xl' }}
            weight="semibold"
            className="mb-6"
          >
            Responsive Layout Examples
          </ResponsiveText>

          {/* Sidebar Layout */}
          <div className="mb-8">
            <ResponsiveText
              as="h3"
              size={{ xs: 'lg', sm: 'xl' }}
              weight="medium"
              className="mb-4"
            >
              Sidebar Layout
            </ResponsiveText>
            <ResponsiveLayout layout="sidebar" gap="md">
              <ResponsiveCard variant="outlined" padding="md">
                <div className="space-y-4">
                  <ResponsiveText weight="semibold">Sidebar Content</ResponsiveText>
                  <ResponsiveText size="sm" color="muted">
                    This sidebar adapts to mobile by stacking vertically.
                  </ResponsiveText>
                  <ResponsiveButton size="sm" fullWidth>
                    Sidebar Action
                  </ResponsiveButton>
                </div>
              </ResponsiveCard>
              <ResponsiveCard variant="default" padding="md">
                <div className="space-y-4">
                  <ResponsiveText weight="semibold">Main Content</ResponsiveText>
                  <ResponsiveText size="sm" color="muted">
                    This is the main content area that takes up the remaining space.
                  </ResponsiveText>
                  <ResponsiveButton size="sm">
                    Main Action
                  </ResponsiveButton>
                </div>
              </ResponsiveCard>
            </ResponsiveLayout>
          </div>

          {/* Split Layout */}
          <div className="mb-8">
            <ResponsiveText
              as="h3"
              size={{ xs: 'lg', sm: 'xl' }}
              weight="medium"
              className="mb-4"
            >
              Split Layout
            </ResponsiveText>
            <ResponsiveLayout layout="split" gap="md">
              <ResponsiveCard variant="outlined" padding="md">
                <div className="space-y-4">
                  <ResponsiveText weight="semibold">Left Panel</ResponsiveText>
                  <ResponsiveText size="sm" color="muted">
                    This panel splits the screen on desktop and stacks on mobile.
                  </ResponsiveText>
                </div>
              </ResponsiveCard>
              <ResponsiveCard variant="outlined" padding="md">
                <div className="space-y-4">
                  <ResponsiveText weight="semibold">Right Panel</ResponsiveText>
                  <ResponsiveText size="sm" color="muted">
                    This panel shows alongside the left panel on desktop.
                  </ResponsiveText>
                </div>
              </ResponsiveCard>
            </ResponsiveLayout>
          </div>
        </div>

        {/* Responsive Button Examples */}
        <div>
          <ResponsiveText
            as="h2"
            size={{ xs: 'xl', sm: '2xl', md: '3xl' }}
            weight="semibold"
            className="mb-6"
          >
            Responsive Buttons
          </ResponsiveText>
          <ResponsiveGrid
            cols={{ xs: 1, sm: 2, md: 3, lg: 4, xl: 5, '2xl': 6 }}
            gap="md"
          >
            <ResponsiveButton
              variant="primary"
              responsiveSize={{ xs: 'sm', sm: 'md', md: 'lg', lg: 'xl' }}
              fullWidth
            >
              Primary Button
            </ResponsiveButton>
            <ResponsiveButton
              variant="secondary"
              responsiveSize={{ xs: 'sm', sm: 'md', md: 'lg', lg: 'xl' }}
              fullWidth
            >
              Secondary
            </ResponsiveButton>
            <ResponsiveButton
              variant="outline"
              responsiveSize={{ xs: 'sm', sm: 'md', md: 'lg', lg: 'xl' }}
              fullWidth
            >
              Outline
            </ResponsiveButton>
            <ResponsiveButton
              variant="ghost"
              responsiveSize={{ xs: 'sm', sm: 'md', md: 'lg', lg: 'xl' }}
              fullWidth
            >
              Ghost
            </ResponsiveButton>
            <ResponsiveButton
              variant="danger"
              responsiveSize={{ xs: 'sm', sm: 'md', md: 'lg', lg: 'xl' }}
              fullWidth
            >
              Danger
            </ResponsiveButton>
            <ResponsiveButton
              variant="success"
              responsiveSize={{ xs: 'sm', sm: 'md', md: 'lg', lg: 'xl' }}
              fullWidth
            >
              Success
            </ResponsiveButton>
          </ResponsiveGrid>
        </div>

        {/* Responsive Text Examples */}
        <div>
          <ResponsiveText
            as="h2"
            size={{ xs: 'xl', sm: '2xl', md: '3xl' }}
            weight="semibold"
            className="mb-6"
          >
            Responsive Text Examples
          </ResponsiveText>
          <ResponsiveCard variant="default" padding="lg">
            <div className="space-y-4">
              <ResponsiveText
                size={{ xs: 'lg', sm: 'xl', md: '2xl', lg: '3xl' }}
                weight="bold"
                color="primary"
              >
                This text scales with screen size
              </ResponsiveText>
              <ResponsiveText
                size={{ xs: 'sm', sm: 'base', md: 'lg', lg: 'xl' }}
                color="muted"
                lineClamp={3}
              >
                This is a longer paragraph that demonstrates responsive text sizing and line clamping. 
                The text will automatically adjust its size based on the screen size, and if you set 
                a lineClamp property, it will truncate after the specified number of lines.
              </ResponsiveText>
              <ResponsiveText
                size={{ xs: 'xs', sm: 'sm', md: 'base', lg: 'lg' }}
                color="secondary"
                align="center"
              >
                This text is centered and has different sizes for different breakpoints
              </ResponsiveText>
            </div>
          </ResponsiveCard>
        </div>
      </div>
    </ResponsiveContainer>
  )
}

export default ResponsiveDemo 