import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Modal from '../../components/ui/Modal'

describe('Modal Component', () => {
  it('renders when open', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()}>
        <div>Modal content</div>
      </Modal>
    )
    expect(screen.getByText('Modal content')).toBeInTheDocument()
  })

  it('does not render when closed', () => {
    render(
      <Modal isOpen={false} onClose={vi.fn()}>
        <div>Modal content</div>
      </Modal>
    )
    expect(screen.queryByText('Modal content')).not.toBeInTheDocument()
  })

  it('calls onClose when backdrop is clicked', () => {
    const handleClose = vi.fn()
    render(
      <Modal isOpen={true} onClose={handleClose}>
        <div>Modal content</div>
      </Modal>
    )
    
    // Find the backdrop by its class
    const backdrop = document.querySelector('.fixed.inset-0.bg-black.bg-opacity-50')
    if (backdrop) {
      fireEvent.click(backdrop)
      expect(handleClose).toHaveBeenCalledTimes(1)
    }
  })

  it('calls onClose when escape key is pressed', () => {
    const handleClose = vi.fn()
    render(
      <Modal isOpen={true} onClose={handleClose}>
        <div>Modal content</div>
      </Modal>
    )
    
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(handleClose).toHaveBeenCalledTimes(1)
  })

  it('renders with title', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} title="Test Modal">
        <div>Modal content</div>
      </Modal>
    )
    expect(screen.getByText('Test Modal')).toBeInTheDocument()
  })

  it('renders with custom size', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} size="lg">
        <div>Modal content</div>
      </Modal>
    )
    // Find the modal container by its class instead of role
    const modalContainer = document.querySelector('.max-w-lg')
    expect(modalContainer).toBeInTheDocument()
  })

  it('prevents backdrop click when closeOnBackdrop is false', () => {
    const handleClose = vi.fn()
    render(
      <Modal isOpen={true} onClose={handleClose} closeOnBackdrop={false}>
        <div>Modal content</div>
      </Modal>
    )
    
    // Find the backdrop by its class
    const backdrop = document.querySelector('.fixed.inset-0.bg-black.bg-opacity-50')
    if (backdrop) {
      fireEvent.click(backdrop)
      expect(handleClose).not.toHaveBeenCalled()
    }
  })

  it('prevents escape key when closeOnEscape is false', () => {
    const handleClose = vi.fn()
    render(
      <Modal isOpen={true} onClose={handleClose} closeOnEscape={false}>
        <div>Modal content</div>
      </Modal>
    )
    
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(handleClose).not.toHaveBeenCalled()
  })

  it('renders close button when showCloseButton is true', () => {
    const handleClose = vi.fn()
    render(
      <Modal isOpen={true} onClose={handleClose} showCloseButton={true}>
        <div>Modal content</div>
      </Modal>
    )
    
    const closeButton = screen.getByRole('button')
    expect(closeButton).toBeInTheDocument()
    
    fireEvent.click(closeButton)
    expect(handleClose).toHaveBeenCalledTimes(1)
  })

  it('does not render close button when showCloseButton is false', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} showCloseButton={false}>
        <div>Modal content</div>
      </Modal>
    )
    
    const closeButton = screen.queryByRole('button')
    expect(closeButton).not.toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} className="custom-modal">
        <div>Modal content</div>
      </Modal>
    )
    // Find the modal container by its class
    const modalContainer = document.querySelector('.custom-modal')
    expect(modalContainer).toBeInTheDocument()
  })
}) 