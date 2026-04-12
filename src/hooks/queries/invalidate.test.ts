import { describe, it, expect, vi } from 'vitest'
import type { QueryClient } from '@tanstack/react-query'

vi.mock('@/orpc/client', () => ({
  orpc: {
    comments: {
      listComments: { key: (opts: unknown) => ['comments', 'list', opts] },
      getReactions: { key: (opts: unknown) => ['comments', 'reactions', opts] },
    },
  },
}))

import { invalidateComments, invalidateReactions } from './invalidate'

const makeClient = () => ({
  invalidateQueries: vi.fn().mockResolvedValue(undefined),
})

describe('invalidateComments', () => {
  it('calls invalidateQueries with refetchType all', async () => {
    const client = makeClient()
    await invalidateComments(client as unknown as QueryClient, 'my-post')
    expect(client.invalidateQueries).toHaveBeenCalledOnce()
    const arg = client.invalidateQueries.mock.calls[0][0]
    expect(arg.refetchType).toBe('all')
    expect(arg.queryKey).toBeDefined()
  })
})

describe('invalidateReactions', () => {
  it('calls invalidateQueries without refetchType override', async () => {
    const client = makeClient()
    await invalidateReactions(client as unknown as QueryClient, 'abc', 'post')
    expect(client.invalidateQueries).toHaveBeenCalledOnce()
    const arg = client.invalidateQueries.mock.calls[0][0]
    expect(arg.refetchType).toBeUndefined()
    expect(arg.queryKey).toBeDefined()
  })
})
