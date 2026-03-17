import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { orpc } from '#/orpc/client'

export function useGetComments(postSlug: string) {
  return useQuery(orpc.comments.getComments.queryOptions({ input: { postSlug } }))
}

export function useCreateComment(postSlug: string, onSuccess?: () => void) {
  const queryClient = useQueryClient()

  return useMutation({
    ...orpc.comments.createComment.mutationOptions(),
    onSuccess: () => {
      void queryClient.invalidateQueries(
        orpc.comments.getComments.queryOptions({ input: { postSlug } })
      )
      onSuccess?.()
    },
  })
}

export function useDeleteComment(postSlug: string) {
  const queryClient = useQueryClient()

  return useMutation({
    ...orpc.comments.deleteComment.mutationOptions(),
    onSuccess: () => {
      void queryClient.invalidateQueries(
        orpc.comments.getComments.queryOptions({ input: { postSlug } })
      )
    },
  })
}

export function useGetReactions(targetId: string, targetType: 'post' | 'comment') {
  return useQuery(orpc.comments.getReactions.queryOptions({ input: { targetId, targetType } }))
}

export function useAddReaction(targetId: string, targetType: 'post' | 'comment') {
  const queryClient = useQueryClient()

  return useMutation({
    ...orpc.comments.addReaction.mutationOptions(),
    onSuccess: () => {
      void queryClient.invalidateQueries(
        orpc.comments.getReactions.queryOptions({ input: { targetId, targetType } })
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
        orpc.comments.getReactions.queryOptions({ input: { targetId, targetType } })
      )
    },
  })
}
