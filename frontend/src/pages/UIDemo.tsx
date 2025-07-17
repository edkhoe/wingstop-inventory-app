import React, { useState } from 'react'
import {
  Button,
  Input,
  Modal,
  Select,
  Checkbox,
  Badge,
  Alert,
  Spinner,
  Skeleton,
  LoadingOverlay,
  ResponsiveContainer,
  ResponsiveGrid,
  ResponsiveCard,
  ResponsiveText
} from '../components/ui'
import { Search, Plus, Trash2, Edit, Eye } from 'lucide-react'

const UIDemo: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedValue, setSelectedValue] = useState('')
  const [inputValue, setInputValue] = useState('')
  const [isChecked, setIsChecked] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const selectOptions = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
    { value: 'option4', label: 'Option 4' }
  ]

  const handleLoadingToggle = () => {
    setIsLoading(!isLoading)
    setTimeout(() => setIsLoading(false), 2000)
  }

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
            UI Components Demo
          </ResponsiveText>
          <ResponsiveText
            size={{ xs: 'sm', sm: 'base', md: 'lg' }}
            color="muted"
            className="max-w-2xl mx-auto"
          >
            This page demonstrates all the reusable UI components built for the Wingstop Inventory App.
          </ResponsiveText>
        </div>

        {/* Buttons Section */}
        <ResponsiveCard variant="default" padding="lg">
          <ResponsiveText as="h2" size={{ xs: 'lg', sm: 'xl', md: '2xl' }} weight="semibold" className="mb-6">
            Buttons
          </ResponsiveText>
          
          <ResponsiveGrid cols={{ xs: 1, sm: 2, md: 3, lg: 4 }} gap="md">
            <div className="space-y-4">
              <ResponsiveText size={{ xs: 'sm', sm: 'base' }} weight="medium">Variants</ResponsiveText>
              <div className="space-y-2">
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="danger">Danger</Button>
                <Button variant="success">Success</Button>
              </div>
            </div>
            
            <div className="space-y-4">
              <ResponsiveText size={{ xs: 'sm', sm: 'base' }} weight="medium">Sizes</ResponsiveText>
              <div className="space-y-2">
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg">Large</Button>
                <Button size="xl">Extra Large</Button>
              </div>
            </div>
            
            <div className="space-y-4">
              <ResponsiveText size={{ xs: 'sm', sm: 'base' }} weight="medium">States</ResponsiveText>
              <div className="space-y-2">
                <Button loading>Loading</Button>
                <Button disabled>Disabled</Button>
                <Button leftIcon={<Plus className="h-4 w-4" />}>
                  With Icon
                </Button>
              </div>
            </div>
            
            <div className="space-y-4">
              <ResponsiveText size={{ xs: 'sm', sm: 'base' }} weight="medium">Full Width</ResponsiveText>
              <div className="space-y-2">
                <Button fullWidth>Full Width Button</Button>
              </div>
            </div>
          </ResponsiveGrid>
        </ResponsiveCard>

        {/* Inputs Section */}
        <ResponsiveCard variant="default" padding="lg">
          <ResponsiveText as="h2" size={{ xs: 'lg', sm: 'xl', md: '2xl' }} weight="semibold" className="mb-6">
            Inputs
          </ResponsiveText>
          
          <ResponsiveGrid cols={{ xs: 1, sm: 2, md: 3 }} gap="md">
            <div className="space-y-4">
              <ResponsiveText size={{ xs: 'sm', sm: 'base' }} weight="medium">Basic Inputs</ResponsiveText>
              <Input
                placeholder="Enter text..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
              <Input
                placeholder="With label"
                label="Email Address"
                helperText="We'll never share your email"
              />
              <Input
                placeholder="With error"
                label="Username"
                error="Username is required"
              />
            </div>
            
            <div className="space-y-4">
              <ResponsiveText size={{ xs: 'sm', sm: 'base' }} weight="medium">Input Variants</ResponsiveText>
              <Input
                placeholder="Filled variant"
                variant="filled"
              />
              <Input
                placeholder="Outlined variant"
                variant="outlined"
              />
              <Input
                placeholder="With left icon"
                leftIcon={<Search className="h-4 w-4" />}
              />
            </div>
            
            <div className="space-y-4">
              <ResponsiveText size={{ xs: 'sm', sm: 'base' }} weight="medium">Special Inputs</ResponsiveText>
              <Input
                type="password"
                placeholder="Password"
                label="Password"
              />
              <Input
                placeholder="Clearable input"
                clearable
                onClear={() => setInputValue('')}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
              <Input
                placeholder="Disabled input"
                disabled
              />
            </div>
          </ResponsiveGrid>
        </ResponsiveCard>

        {/* Select Section */}
        <ResponsiveCard variant="default" padding="lg">
          <ResponsiveText as="h2" size={{ xs: 'lg', sm: 'xl', md: '2xl' }} weight="semibold" className="mb-6">
            Select Dropdown
          </ResponsiveText>
          
          <ResponsiveGrid cols={{ xs: 1, sm: 2 }} gap="md">
            <div className="space-y-4">
              <ResponsiveText size={{ xs: 'sm', sm: 'base' }} weight="medium">Basic Select</ResponsiveText>
              <Select
                options={selectOptions}
                value={selectedValue}
                onChange={setSelectedValue}
                placeholder="Choose an option"
              />
            </div>
            
            <div className="space-y-4">
              <ResponsiveText size={{ xs: 'sm', sm: 'base' }} weight="medium">Searchable Select</ResponsiveText>
              <Select
                options={selectOptions}
                searchable
                placeholder="Search options..."
              />
            </div>
          </ResponsiveGrid>
        </ResponsiveCard>

        {/* Checkbox Section */}
        <ResponsiveCard variant="default" padding="lg">
          <ResponsiveText as="h2" size={{ xs: 'lg', sm: 'xl', md: '2xl' }} weight="semibold" className="mb-6">
            Checkboxes
          </ResponsiveText>
          
          <div className="space-y-4">
            <Checkbox
              label="Accept terms and conditions"
              checked={isChecked}
              onChange={(e) => setIsChecked(e.target.checked)}
            />
            <Checkbox
              label="Subscribe to newsletter"
            />
            <Checkbox
              label="Disabled checkbox"
              disabled
            />
          </div>
        </ResponsiveCard>

        {/* Badges Section */}
        <ResponsiveCard variant="default" padding="lg">
          <ResponsiveText as="h2" size={{ xs: 'lg', sm: 'xl', md: '2xl' }} weight="semibold" className="mb-6">
            Badges
          </ResponsiveText>
          
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant="default">Default</Badge>
              <Badge variant="primary">Primary</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="danger">Danger</Badge>
              <Badge variant="info">Info</Badge>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Badge size="sm">Small</Badge>
              <Badge size="md">Medium</Badge>
              <Badge size="lg">Large</Badge>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Badge rounded>Rounded</Badge>
              <Badge variant="primary" rounded>Primary Rounded</Badge>
            </div>
          </div>
        </ResponsiveCard>

        {/* Alerts Section */}
        <ResponsiveCard variant="default" padding="lg">
          <ResponsiveText as="h2" size={{ xs: 'lg', sm: 'xl', md: '2xl' }} weight="semibold" className="mb-6">
            Alerts
          </ResponsiveText>
          
          <div className="space-y-4">
            <Alert type="success" title="Success!">
              Your changes have been saved successfully.
            </Alert>
            
            <Alert type="error" title="Error" dismissible>
              There was an error processing your request.
            </Alert>
            
            <Alert type="warning" title="Warning">
              Please review your input before submitting.
            </Alert>
            
            <Alert type="info" title="Information">
              This is an informational message.
            </Alert>
          </div>
        </ResponsiveCard>

        {/* Loading Section */}
        <ResponsiveCard variant="default" padding="lg">
          <ResponsiveText as="h2" size={{ xs: 'lg', sm: 'xl', md: '2xl' }} weight="semibold" className="mb-6">
            Loading Components
          </ResponsiveText>
          
          <ResponsiveGrid cols={{ xs: 1, sm: 2, md: 3 }} gap="md">
            <div className="space-y-4">
              <ResponsiveText size={{ xs: 'sm', sm: 'base' }} weight="medium">Spinners</ResponsiveText>
              <div className="flex items-center gap-4">
                <Spinner size="sm" />
                <Spinner size="md" />
                <Spinner size="lg" />
                <Spinner size="xl" />
              </div>
            </div>
            
            <div className="space-y-4">
              <ResponsiveText size={{ xs: 'sm', sm: 'base' }} weight="medium">Skeleton</ResponsiveText>
              <Skeleton lines={3} />
            </div>
            
            <div className="space-y-4">
              <ResponsiveText size={{ xs: 'sm', sm: 'base' }} weight="medium">Loading Overlay</ResponsiveText>
              <LoadingOverlay loading={isLoading} text="Processing...">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <p>This content will be covered by loading overlay</p>
                  <Button onClick={handleLoadingToggle} size="sm" className="mt-2">
                    Toggle Loading
                  </Button>
                </div>
              </LoadingOverlay>
            </div>
          </ResponsiveGrid>
        </ResponsiveCard>

        {/* Modal Section */}
        <ResponsiveCard variant="default" padding="lg">
          <ResponsiveText as="h2" size={{ xs: 'lg', sm: 'xl', md: '2xl' }} weight="semibold" className="mb-6">
            Modal
          </ResponsiveText>
          
          <div className="space-y-4">
            <Button onClick={() => setIsModalOpen(true)}>
              Open Modal
            </Button>
            
            <Modal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              title="Example Modal"
              size="md"
            >
              <div className="space-y-4">
                <p>This is an example modal with some content.</p>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => setIsModalOpen(false)}>
                    Confirm
                  </Button>
                </div>
              </div>
            </Modal>
          </div>
        </ResponsiveCard>
      </div>
    </ResponsiveContainer>
  )
}

export default UIDemo 