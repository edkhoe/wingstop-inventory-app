import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Form } from '../../components/forms/Form'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'

// Test schema
const testSchema = yup.object({
  name: yup.string().required('Name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  age: yup.number().min(18, 'Must be at least 18').required('Age is required')
})

type TestFormData = yup.InferType<typeof testSchema>

const TestFormComponent = ({ onSubmit = vi.fn() }: { onSubmit?: any }) => {
  const form = useForm<TestFormData>({
    resolver: yupResolver(testSchema),
    defaultValues: {
      name: '',
      email: '',
      age: 0
    }
  })

  return (
    <Form form={form} onSubmit={onSubmit}>
      <div>
        <label htmlFor="name">Name</label>
        <input id="name" {...form.register('name')} />
        {form.formState.errors.name && (
          <span>{form.formState.errors.name.message}</span>
        )}
      </div>
      
      <div>
        <label htmlFor="email">Email</label>
        <input id="email" {...form.register('email')} />
        {form.formState.errors.email && (
          <span>{form.formState.errors.email.message}</span>
        )}
      </div>
      
      <div>
        <label htmlFor="age">Age</label>
        <input id="age" type="number" {...form.register('age')} />
        {form.formState.errors.age && (
          <span>{form.formState.errors.age.message}</span>
        )}
      </div>
      
      <button type="submit">Submit</button>
    </Form>
  )
}

describe('Form Component', () => {
  it('renders form with children', () => {
    render(<TestFormComponent />)
    expect(screen.getByLabelText('Name')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Age')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument()
  })

  it('handles form submission with valid data', async () => {
    const handleSubmit = vi.fn()
    render(<TestFormComponent onSubmit={handleSubmit} />)
    
    const nameInput = screen.getByLabelText('Name')
    const emailInput = screen.getByLabelText('Email')
    const ageInput = screen.getByLabelText('Age')
    const submitButton = screen.getByRole('button', { name: 'Submit' })
    
    fireEvent.change(nameInput, { target: { value: 'John Doe' } })
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } })
    fireEvent.change(ageInput, { target: { value: '25' } })
    
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@example.com',
        age: 25
      })
    })
  })

  it('shows validation errors for invalid data', async () => {
    render(<TestFormComponent />)
    
    const submitButton = screen.getByRole('button', { name: 'Submit' })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeInTheDocument()
      expect(screen.getByText('Email is required')).toBeInTheDocument()
      expect(screen.getByText('Age is required')).toBeInTheDocument()
    })
  })

  it('shows email validation error for invalid email', async () => {
    render(<TestFormComponent />)
    
    const nameInput = screen.getByLabelText('Name')
    const emailInput = screen.getByLabelText('Email')
    const submitButton = screen.getByRole('button', { name: 'Submit' })
    
    fireEvent.change(nameInput, { target: { value: 'John Doe' } })
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('Invalid email')).toBeInTheDocument()
    })
  })

  it('shows age validation error for underage', async () => {
    render(<TestFormComponent />)
    
    const nameInput = screen.getByLabelText('Name')
    const emailInput = screen.getByLabelText('Email')
    const ageInput = screen.getByLabelText('Age')
    const submitButton = screen.getByRole('button', { name: 'Submit' })
    
    fireEvent.change(nameInput, { target: { value: 'John Doe' } })
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } })
    fireEvent.change(ageInput, { target: { value: '16' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('Must be at least 18')).toBeInTheDocument()
    })
  })

  it('applies custom className', () => {
    render(
      <Form form={useForm()} onSubmit={vi.fn()} className="custom-form">
        <div>Form content</div>
      </Form>
    )
    const form = screen.getByRole('form')
    expect(form).toHaveClass('custom-form')
  })

  it('handles form reset', async () => {
    const handleSubmit = vi.fn()
    render(<TestFormComponent onSubmit={handleSubmit} />)
    
    const nameInput = screen.getByLabelText('Name')
    const emailInput = screen.getByLabelText('Email')
    
    fireEvent.change(nameInput, { target: { value: 'John Doe' } })
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } })
    
    // Verify values are set
    expect(nameInput).toHaveValue('John Doe')
    expect(emailInput).toHaveValue('john@example.com')
    
    // Reset form
    const form = screen.getByRole('form')
    fireEvent.reset(form)
    
    // Verify values are cleared
    expect(nameInput).toHaveValue('')
    expect(emailInput).toHaveValue('')
  })
}) 