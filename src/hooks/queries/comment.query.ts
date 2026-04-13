import {
  useMutation,
  useMutationState,
  useQueryClient,
  useSuspenseInfiniteQuery,
  useSuspenseQuery,
} from '@tanstack/react-query'
import { orpc, type CommentsListInput, type Inputs } from '@/orpc/client'
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
    onSettled: () => invalidateReactions(queryClient, targetId, targetType),
  })
}

export function useDeleteReaction(targetId: string, targetType: 'post' | 'comment') {
  const queryClient = useQueryClient()

  return useMutation({
    ...orpc.comments.deleteReaction.mutationOptions(),
    onSettled: () => invalidateReactions(queryClient, targetId, targetType),
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
