import { describe, expect, it } from 'vitest'
import { useThemeStore } from './theme'

describe('useThemeStore', () => {
  it('initializes with auto mode', () => {
    expect(useThemeStore.getState().mode).toBe('auto')
  })

  it('setMode changes the mode', () => {
    useThemeStore.getState().setMode('dark')
    expect(useThemeStore.getState().mode).toBe('dark')
    useThemeStore.getState().setMode('auto')
  })

  it('toggle cycles: auto → light → dark → auto', () => {
    useThemeStore.getState().setMode('auto')
    useThemeStore.getState().toggle()
    expect(useThemeStore.getState().mode).toBe('light')
    useThemeStore.getState().toggle()
    expect(useThemeStore.getState().mode).toBe('dark')
    useThemeStore.getState().toggle()
    expect(useThemeStore.getState().mode).toBe('auto')
  })
})
