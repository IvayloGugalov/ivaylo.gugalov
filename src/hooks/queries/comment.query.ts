import {
  useMutation,
  useMutationState,
  useQueryClient,
  useSuspenseInfiniteQuery,
  useSuspenseQuery,
} from '@tanstack/react-query'
import { orpc, type CommentsListInput, type Inputs, type ReactionList } from '@/orpc/client'
import { invalidateComments, invalidateReactions } from './invalidate'

type AddReactionInput = Inputs['comments']['addReaction']

export function useListComments(input: (pageParam: Date | undefined) => CommentsListInput) {
  return useSuspenseInfiniteQuery(
    orpc.comments.listComments.infiniteOptions({
      input,
      initialPageParam: undefined,
      getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
      staleTime: 2 * 60 * 1000, // 2 min — user-generated content
    }),
  )
}

export function useCreateComment(postSlug: string) {
  const queryClient = useQueryClient()

  return useMutation({
    ...orpc.comments.createComment.mutationOptions(),
    onSuccess: () => void invalidateComments(queryClient, postSlug),
  })
}

export function useDeleteComment(postSlug: string) {
  const queryClient = useQueryClient()

  return useMutation({
    ...orpc.comments.deleteComment.mutationOptions(),
    onSuccess: () => void invalidateComments(queryClient, postSlug),
  })
}

export function useGetReactions(targetId: string, targetType: 'post' | 'comment') {
  return useSuspenseQuery(
    orpc.comments.getReactions.queryOptions({
      input: { targetId, targetType },
      staleTime: 30 * 1000, // 30s — high-frequency toggles
    }),
  )
}

export function useAddReaction(targetId: string, targetType: 'post' | 'comment') {
  const queryClient = useQueryClient()

  return useMutation({
    ...orpc.comments.addReaction.mutationOptions(),
    onSuccess: (data, variables) => {
      if ('already' in data) return
      queryClient.setQueryData(
        orpc.comments.getReactions.key({ input: { targetId, targetType } }),
        (old: ReactionList | undefined) => {
          if (!old) return old
          const exists = old.find((r) => r.emoji === variables.emoji)
          if (exists) {
            return old.map((r) =>
              r.emoji === variables.emoji
                ? { ...r, count: r.count + 1, reactionId: data.id }
                : r,
            )
          }
          return [...old, { emoji: variables.emoji, count: 1, reactionId: data.id }]
        },
      )
    },
    onError: () => invalidateReactions(queryClient, targetId, targetType),
  })
}

export function useDeleteReaction(targetId: string, targetType: 'post' | 'comment') {
  const queryClient = useQueryClient()

  return useMutation({
    ...orpc.comments.deleteReaction.mutationOptions(),
    onSuccess: (_data, variables) => {
      queryClient.setQueryData(
        orpc.comments.getReactions.key({ input: { targetId, targetType } }),
        (old: ReactionList | undefined) => {
          if (!old) return old
          return old
            .map((r) =>
              r.reactionId === variables.reactionId
                ? { ...r, count: r.count - 1, reactionId: null }
                : r,
            )
            .filter((r) => r.count > 0)
        },
      )
    },
    onError: () => invalidateReactions(queryClient, targetId, targetType),
  })
}

// Returns variables of all currently-pending addReaction mutations.
// Used by ReactionBar to show optimistic pending state.
export function usePendingReactions() {
  return useMutationState({
    filters: { status: 'pending' },
    select: (mutation) => {
      // Only surface addReaction mutations by checking variables shape
      const vars = mutation.state.variables as AddReactionInput | undefined
      if (vars && 'emoji' in vars && 'targetId' in vars) return vars
      return null
    },
  }).filter(Boolean) as AddReactionInput[]
}
