import type { QueryClient } from '@tanstack/react-query'
import { orpc } from '@/orpc/client'

export const invalidateComments = (queryClient: QueryClient, postSlug: string) =>
  queryClient.invalidateQueries({
    queryKey: orpc.comments.listComments.key({ input: { postSlug } }),
    refetchType: 'all',
  })

export const invalidateReactions = (
  queryClient: QueryClient,
  targetId: string,
  targetType: 'post' | 'comment',
) =>
  queryClient.invalidateQueries({
    queryKey: orpc.comments.getReactions.key({ input: { targetId, targetType } }),
  })
