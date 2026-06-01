// @vitest-environment jsdom
import React from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, renderHook } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Hoist mock fns so they exist before vi.mock hoisting runs
const { addReactionFn, createCommentFn, deleteCommentFn, deleteReactionFn } = vi.hoisted(
  () => ({
    addReactionFn: vi.fn(),
    createCommentFn: vi.fn(),
    deleteCommentFn: vi.fn(),
    deleteReactionFn: vi.fn(),
  }),
)

vi.mock('@/orpc/client', () => ({
  orpc: {
    comments: {
      listComments: {
        key: (opts: unknown) => ['comments', 'list', opts],
      },
      createComment: {
        mutationOptions: () => ({ mutationFn: createCommentFn }),
      },
      deleteComment: {
        mutationOptions: () => ({ mutationFn: deleteCommentFn }),
      },
      getReactions: {
        // Mirror oRPC's generateOperationKey: `.key()` is a PARTIAL key (omits
        // `type` unless given), while `.queryKey()` / `queryOptions` produce the
        // FULL key with `type: 'query'`. Keeping these distinct is what lets this
        // suite catch the setQueryData-on-partial-key bug.
        key: (opts: { input?: unknown; type?: string } = {}) => [
          'comments',
          'reactions',
          {
            ...(opts.input !== undefined ? { input: opts.input } : {}),
            ...(opts.type !== undefined ? { type: opts.type } : {}),
          },
        ],
        queryKey: ({ input }: { input?: unknown } = {}) => [
          'comments',
          'reactions',
          { input, type: 'query' },
        ],
        queryOptions: ({ input, staleTime }: { input: unknown; staleTime?: number }) => ({
          queryKey: ['comments', 'reactions', { input, type: 'query' }],
          queryFn: vi.fn(),
          staleTime,
        }),
      },
      addReaction: {
        mutationOptions: () => ({ mutationFn: addReactionFn }),
      },
      deleteReaction: {
        mutationOptions: () => ({ mutationFn: deleteReactionFn }),
      },
    },
  },
}))

import {
  useAddReaction,
  useCreateComment,
  useDeleteComment,
  useDeleteReaction,
} from './comment.query'

type Reaction = { emoji: string; count: number; reactionId: string | null }

// Full key the component actually reads from (matches getReactions.queryKey()).
const reactionsKey = (targetId: string, targetType: 'post' | 'comment') =>
  ['comments', 'reactions', { input: { targetId, targetType }, type: 'query' }]


function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
  return { queryClient, wrapper: Wrapper }
}

afterEach(cleanup)

// ─── useCreateComment ─────────────────────────────────────────────────────────

describe('useCreateComment', () => {
  beforeEach(() => createCommentFn.mockReset())

  it('invalidates comment list with refetchType all on success', async () => {
    createCommentFn.mockResolvedValue({ id: 'c1' })
    const { queryClient, wrapper } = makeWrapper()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries').mockResolvedValue()

    const { result } = renderHook(() => useCreateComment('my-post'), { wrapper })
    await act(() => result.current.mutateAsync({} as never))

    expect(invalidateSpy).toHaveBeenCalledOnce()
    const [arg] = invalidateSpy.mock.calls[0]
    expect(arg?.refetchType).toBe('all')
    expect(arg?.queryKey).toBeDefined()
  })

})

// ─── useDeleteComment ─────────────────────────────────────────────────────────

describe('useDeleteComment', () => {
  beforeEach(() => deleteCommentFn.mockReset())

  it('invalidates comment list with refetchType all on success', async () => {
    deleteCommentFn.mockResolvedValue(undefined)
    const { queryClient, wrapper } = makeWrapper()
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries').mockResolvedValue()

    const { result } = renderHook(() => useDeleteComment('my-post'), { wrapper })
    await act(() => result.current.mutateAsync({} as never))

    expect(invalidateSpy).toHaveBeenCalledOnce()
    const [arg] = invalidateSpy.mock.calls[0]
    expect(arg?.refetchType).toBe('all')
  })

})

// ─── useAddReaction ───────────────────────────────────────────────────────────

describe('useAddReaction', () => {
  beforeEach(() => addReactionFn.mockReset())

  it('adds a new emoji to cache without a network refetch', async () => {
    addReactionFn.mockResolvedValue({ id: 'r2' })
    const { queryClient, wrapper } = makeWrapper()
    const key = reactionsKey('t1', 'post')
    queryClient.setQueryData(key, [{ emoji: '👍', count: 1, reactionId: 'r1' }])
    vi.spyOn(queryClient, 'invalidateQueries')

    const { result } = renderHook(() => useAddReaction('t1', 'post'), { wrapper })
    await act(() => result.current.mutateAsync({ emoji: '❤️' } as never))

    const cached = queryClient.getQueryData<Reaction[]>(key)
    expect(cached).toContainEqual(
      expect.objectContaining({ emoji: '❤️', count: 1, reactionId: 'r2' }),
    )
    expect(queryClient.invalidateQueries).not.toHaveBeenCalled()
  })

  it('increments count when the same emoji already exists', async () => {
    addReactionFn.mockResolvedValue({ id: 'r3' })
    const { queryClient, wrapper } = makeWrapper()
    const key = reactionsKey('t1', 'post')
    queryClient.setQueryData(key, [{ emoji: '👍', count: 2, reactionId: 'r1' }])

    const { result } = renderHook(() => useAddReaction('t1', 'post'), { wrapper })
    await act(() => result.current.mutateAsync({ emoji: '👍' } as never))

    const cached = queryClient.getQueryData<Reaction[]>(key)
    expect(cached).toContainEqual(
      expect.objectContaining({ emoji: '👍', count: 3, reactionId: 'r3' }),
    )
  })

  it('leaves cache unchanged when server signals already reacted', async () => {
    addReactionFn.mockResolvedValue({ already: true })
    const { queryClient, wrapper } = makeWrapper()
    const key = reactionsKey('t1', 'post')
    const initial: Reaction[] = [{ emoji: '👍', count: 1, reactionId: 'r1' }]
    queryClient.setQueryData(key, initial)

    const { result } = renderHook(() => useAddReaction('t1', 'post'), { wrapper })
    await act(() => result.current.mutateAsync({ emoji: '👍' } as never))

    expect(queryClient.getQueryData(key)).toEqual(initial)
  })

  // onError → invalidateReactions is covered by invalidate.test.ts.
  // Testing it here would require triggering a mutation failure, which causes an
  // unhandled rejection in Vitest 3's strict process-level tracking even when caught
  // (React Query's internal .catch(noop) races with Vitest's process.unhandledRejection).
})

// ─── useDeleteReaction ────────────────────────────────────────────────────────

describe('useDeleteReaction', () => {
  beforeEach(() => deleteReactionFn.mockReset())

  it('decrements reaction count in cache on success', async () => {
    deleteReactionFn.mockResolvedValue(undefined)
    const { queryClient, wrapper } = makeWrapper()
    const key = reactionsKey('t1', 'post')
    queryClient.setQueryData(key, [{ emoji: '👍', count: 2, reactionId: 'r1' }])

    const { result } = renderHook(() => useDeleteReaction('t1', 'post'), { wrapper })
    await act(() => result.current.mutateAsync({ reactionId: 'r1' } as never))

    const cached = queryClient.getQueryData<Reaction[]>(key)
    expect(cached).toContainEqual(
      expect.objectContaining({ emoji: '👍', count: 1, reactionId: null }),
    )
  })

  it('removes the emoji entry from cache when count reaches zero', async () => {
    deleteReactionFn.mockResolvedValue(undefined)
    const { queryClient, wrapper } = makeWrapper()
    const key = reactionsKey('t1', 'post')
    queryClient.setQueryData(key, [{ emoji: '👍', count: 1, reactionId: 'r1' }])

    const { result } = renderHook(() => useDeleteReaction('t1', 'post'), { wrapper })
    await act(() => result.current.mutateAsync({ reactionId: 'r1' } as never))

    expect(queryClient.getQueryData<Reaction[]>(key)).toEqual([])
  })

  // onError → invalidateReactions: same constraint as useAddReaction above.
})
