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
    </Form>
  )
}

const TestFormWithCustomClass = ({ onSubmit = vi.fn() }: { onSubmit?: any }) => {
  const form = useForm<TestFormData>({
    resolver: yupResolver(testSchema),
    defaultValues: {
      name: '',
      email: '',
      age: 0
    }
  })

  return (
    <Form form={form} onSubmit={onSubmit} className="custom-form">
      <div>Form content</div>
    </Form>
  )
}

describe('Form Component', () => {
  it('renders form with children', () => {
    render(<TestFormComponent />)
    expect(screen.getByLabelText('Name')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Age')).toBeInTheDocument()
    // Use getAllByRole since there are multiple submit buttons
    const submitButtons = screen.getAllByRole('button', { name: 'Submit' })
    expect(submitButtons.length).toBeGreaterThan(0)
  })

  it('handles form submission with valid data', async () => {
    const handleSubmit = vi.fn()
    render(<TestFormComponent onSubmit={handleSubmit} />)
    
    const nameInput = screen.getByLabelText('Name')
    const emailInput = screen.getByLabelText('Email')
    const ageInput = screen.getByLabelText('Age')
    // Use the first submit button
    const submitButtons = screen.getAllByRole('button', { name: 'Submit' })
    const submitButton = submitButtons[0]
    
    fireEvent.change(nameInput, { target: { value: 'John Doe' } })
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } })
    fireEvent.change(ageInput, { target: { value: '25' } })
    
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      // The form passes both the data and the event to the onSubmit handler
      expect(handleSubmit).toHaveBeenCalled()
      const callArgs = handleSubmit.mock.calls[0]
      expect(callArgs[0]).toEqual({
        name: 'John Doe',
        email: 'john@example.com',
        age: 25
      })
    })
  })

  it('shows validation errors for invalid data', async () => {
    render(<TestFormComponent />)
    
    // Use the first submit button
    const submitButtons = screen.getAllByRole('button', { name: 'Submit' })
    const submitButton = submitButtons[0]
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeInTheDocument()
      expect(screen.getByText('Email is required')).toBeInTheDocument()
      expect(screen.getByText('Must be at least 18')).toBeInTheDocument()
    })
  })

  it('shows email validation error for invalid email', async () => {
    render(<TestFormComponent />)
    
    const nameInput = screen.getByLabelText('Name')
    const emailInput = screen.getByLabelText('Email')
    // Use the first submit button
    const submitButtons = screen.getAllByRole('button', { name: 'Submit' })
    const submitButton = submitButtons[0]
    
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
    // Use the first submit button
    const submitButtons = screen.getAllByRole('button', { name: 'Submit' })
    const submitButton = submitButtons[0]
    
    fireEvent.change(nameInput, { target: { value: 'John Doe' } })
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } })
    fireEvent.change(ageInput, { target: { value: '16' } })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText('Must be at least 18')).toBeInTheDocument()
    })
  })

  it('applies custom className', () => {
    render(<TestFormWithCustomClass />)
    // Check that the form container has the custom class
    const formContainer = screen.getByText('Form content').closest('form')
    expect(formContainer).toHaveClass('custom-form')
  })
}) 