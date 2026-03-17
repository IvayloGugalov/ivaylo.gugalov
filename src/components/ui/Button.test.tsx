// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Button } from './Button'

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeDefined()
  })

  it('applies primary variant by default', () => {
    const { container } = render(<Button>Test</Button>)
    expect(container.firstElementChild?.className).toContain('bg--(--)')
  })

  it('applies ghost variant', () => {
    const { container } = render(<Button variant="ghost">Ghost</Button>)
    expect(container.firstElementChild?.className).toContain('hover:bg--(--)')
  })
})
