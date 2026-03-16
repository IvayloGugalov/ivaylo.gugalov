import { describe, expect, it } from 'vitest'

// Set required env vars before module import
process.env.DATABASE_URL = process.env.DATABASE_URL ?? 'postgresql://test:test@localhost/test'
process.env.BETTER_AUTH_SECRET = process.env.BETTER_AUTH_SECRET ?? 'test-secret'

import { useAuthStore } from './auth'

describe('useAuthStore', () => {
  it('initializes with null user and loading true', () => {
    const state = useAuthStore.getState()
    expect(state.user).toBeNull()
    expect(state.isLoading).toBe(true)
  })

  it('setUser updates user and stops loading', () => {
    const { setUser } = useAuthStore.getState()
    setUser({ id: '1', name: 'Test', email: 'test@test.com' } as any)
    expect(useAuthStore.getState().user?.id).toBe('1')
    expect(useAuthStore.getState().isLoading).toBe(false)
  })
})
