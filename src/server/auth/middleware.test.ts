import { describe, expect, it } from 'vitest'

// Set required env vars before module import
process.env.DATABASE_URL = process.env.DATABASE_URL ?? 'postgresql://test:test@localhost/test'
process.env.BETTER_AUTH_SECRET = process.env.BETTER_AUTH_SECRET ?? 'test-secret'

describe('requireAuth middleware', () => {
  it('exports publicProcedure and requireAuth', async () => {
    const mod = await import('./middleware')
    expect(mod.publicProcedure).toBeDefined()
    expect(mod.requireAuth).toBeDefined()
  })
})
