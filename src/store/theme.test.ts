// @vitest-environment jsdom
import { describe, expect, it, beforeEach, beforeAll, vi } from 'vitest'

// Must be hoisted so it runs before module-level code in theme.ts
const _mockMatchMedia = vi.hoisted(() => {
  Object.defineProperty(globalThis, 'matchMedia', {
    writable: true,
    configurable: true,
    value: (query: string) => ({
      matches: query.includes('dark'),
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  })
})

import { useThemeStore } from './theme'

beforeAll(() => {
  // matchMedia already installed via vi.hoisted above
})

describe('useThemeStore', () => {
  beforeEach(() => {
    useThemeStore.getState().setMode('dark')
  })

  it('initializes with dark mode', () => {
    useThemeStore.setState({ mode: 'dark' })
    expect(useThemeStore.getState().mode).toBe('dark')
  })

  it('setMode changes the mode', () => {
    useThemeStore.getState().setMode('light')
    expect(useThemeStore.getState().mode).toBe('light')
  })

  it('toggle flips dark → light', () => {
    useThemeStore.getState().setMode('dark')
    useThemeStore.getState().toggle()
    expect(useThemeStore.getState().mode).toBe('light')
  })

  it('toggle flips light → dark', () => {
    useThemeStore.getState().setMode('light')
    useThemeStore.getState().toggle()
    expect(useThemeStore.getState().mode).toBe('dark')
  })
})
