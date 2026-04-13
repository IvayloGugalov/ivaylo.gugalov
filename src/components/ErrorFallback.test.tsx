// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { ErrorFallback } from './ErrorFallback'

afterEach(cleanup)

describe('ErrorFallback', () => {
  it('renders the error message', () => {
    render(<ErrorFallback message='Something broke' onRetry={() => {}} />)
    expect(screen.getByText(/Something broke/)).toBeTruthy()
  })

  it('calls onRetry when button is clicked', () => {
    const onRetry = vi.fn()
    render(<ErrorFallback message='Oops' onRetry={onRetry} />)
    fireEvent.click(screen.getByRole('button', { name: /try again/i }))
    expect(onRetry).toHaveBeenCalledOnce()
  })
})
