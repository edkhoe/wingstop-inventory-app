import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Input from '../../components/ui/Input'

describe('Input Component', () => {
  it('renders with default props', () => {
    render(<Input placeholder="Enter text" />)
    const input = screen.getByPlaceholderText('Enter text')
    expect(input).toBeInTheDocument()
    expect(input).toHaveClass('border-gray-300')
  })

  it('renders with different variants', () => {
    const { rerender } = render(<Input variant="filled" placeholder="Filled input" />)
    let input = screen.getByPlaceholderText('Filled input')
    expect(input).toHaveClass('bg-gray-50')

    rerender(<Input variant="outlined" placeholder="Outlined input" />)
    input = screen.getByPlaceholderText('Outlined input')
    expect(input).toHaveClass('bg-transparent')
  })

  it('renders with label', () => {
    render(<Input label="Test Label" placeholder="Test input" />)
    const label = screen.getByText('Test Label')
    expect(label).toBeInTheDocument()
  })

  it('handles value changes', () => {
    const handleChange = vi.fn()
    render(<Input onChange={handleChange} placeholder="Test input" />)
    const input = screen.getByPlaceholderText('Test input')
    fireEvent.change(input, { target: { value: 'test value' } })
    expect(handleChange).toHaveBeenCalledWith(expect.objectContaining({
      target: expect.objectContaining({ value: 'test value' })
    }))
  })

  it('shows error state', () => {
    render(<Input error="This field is required" placeholder="Error input" />)
    const input = screen.getByPlaceholderText('Error input')
    const errorMessage = screen.getByText('This field is required')
    expect(input).toHaveClass('border-red-300')
    expect(errorMessage).toBeInTheDocument()
  })

  it('shows helper text', () => {
    render(<Input helperText="This is helper text" placeholder="Helper input" />)
    const helperText = screen.getByText('This is helper text')
    expect(helperText).toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(<Input className="custom-class" placeholder="Custom input" />)
    const input = screen.getByPlaceholderText('Custom input')
    expect(input).toHaveClass('custom-class')
  })

  it('renders with left icon', () => {
    render(<Input leftIcon={<span data-testid="left-icon">🔍</span>} placeholder="Search" />)
    const input = screen.getByPlaceholderText('Search')
    expect(input.parentElement).toContainElement(screen.getByTestId('left-icon'))
  })

  it('renders with right icon', () => {
    render(<Input rightIcon={<span data-testid="right-icon">✓</span>} placeholder="Validated" />)
    const input = screen.getByPlaceholderText('Validated')
    expect(input.parentElement).toContainElement(screen.getByTestId('right-icon'))
  })

  it('is disabled when disabled prop is true', () => {
    render(<Input disabled placeholder="Disabled input" />)
    const input = screen.getByPlaceholderText('Disabled input')
    expect(input).toBeDisabled()
  })

  it('handles focus and blur events', () => {
    const handleFocus = vi.fn()
    const handleBlur = vi.fn()
    render(<Input onFocus={handleFocus} onBlur={handleBlur} placeholder="Test input" />)
    const input = screen.getByPlaceholderText('Test input')
    
    fireEvent.focus(input)
    expect(handleFocus).toHaveBeenCalledTimes(1)
    
    fireEvent.blur(input)
    expect(handleBlur).toHaveBeenCalledTimes(1)
  })

  it('handles clear functionality', () => {
    const handleClear = vi.fn()
    render(<Input clearable onClear={handleClear} placeholder="Clearable input" />)
    const input = screen.getByPlaceholderText('Clearable input')
    
    // Type something to show the clear button
    fireEvent.change(input, { target: { value: 'test' } })
    
    const clearButton = screen.getByRole('button')
    fireEvent.click(clearButton)
    expect(handleClear).toHaveBeenCalledTimes(1)
  })

  it('handles password visibility toggle', () => {
    render(<Input type="password" placeholder="Password input" />)
    const input = screen.getByPlaceholderText('Password input')
    expect(input).toHaveAttribute('type', 'password')
    
    const toggleButton = screen.getByRole('button')
    fireEvent.click(toggleButton)
    expect(input).toHaveAttribute('type', 'text')
  })
}) 