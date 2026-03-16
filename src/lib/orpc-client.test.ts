import { describe, expect, it } from 'vitest'
import { queryClient, orpc, orpcQuery } from './orpc-client'

describe('orpc-client', () => {
  it('exports a queryClient', () => {
    expect(queryClient).toBeDefined()
  })

  it('exports orpc client', () => {
    expect(orpc).toBeDefined()
  })

  it('exports orpcQuery utils', () => {
    expect(orpcQuery).toBeDefined()
  })
})
