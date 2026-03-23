import { describe, expect, it, beforeEach } from 'vitest'
import { useThemeStore } from './theme'

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
