import {
  useMutation,
  useQueryClient,
  useSuspenseInfiniteQuery,
  useSuspenseQuery,
} from '@tanstack/react-query'
import { orpc, type CommentsListInput } from '@/orpc/client'

export function useListComments(input: (pageParam: Date | undefined) => CommentsListInput) {
  return useSuspenseInfiniteQuery(
    orpc.comments.listComments.infiniteOptions({
      input,
      initialPageParam: undefined,
      getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    }),
  )
}

export function useCreateComment(postSlug: string, onSuccess?: () => void) {
  const queryClient = useQueryClient()

  return useMutation({
    ...orpc.comments.createComment.mutationOptions(),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: orpc.comments.listComments.key({ input: { postSlug } }),
      })
      onSuccess?.()
    },
  })
}

export function useDeleteComment(postSlug: string) {
  const queryClient = useQueryClient()

  return useMutation({
    ...orpc.comments.deleteComment.mutationOptions(),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: orpc.comments.listComments.key({ input: { postSlug } }),
      })
    },
  })
}

export function useGetReactions(targetId: string, targetType: 'post' | 'comment') {
  return useSuspenseQuery(
    orpc.comments.getReactions.queryOptions({ input: { targetId, targetType } }),
  )
}

export function useAddReaction(targetId: string, targetType: 'post' | 'comment') {
  const queryClient = useQueryClient()

  return useMutation({
    ...orpc.comments.addReaction.mutationOptions(),
    onSuccess: () => {
      void queryClient.invalidateQueries(
        orpc.comments.getReactions.queryOptions({ input: { targetId, targetType } }),
      )
    },
  })
}

export function useDeleteReaction(targetId: string, targetType: 'post' | 'comment') {
  const queryClient = useQueryClient()

  return useMutation({
    ...orpc.comments.deleteReaction.mutationOptions(),
    onSuccess: () => {
      void queryClient.invalidateQueries(
        orpc.comments.getReactions.queryOptions({ input: { targetId, targetType } }),
      )
    },
  })
}
