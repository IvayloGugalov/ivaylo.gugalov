import { useSuspenseQuery } from '@tanstack/react-query'
import { orpc } from '../client'
import type { z } from 'zod'
import type { PostsInputSchema, TrendsInputSchema } from '../schemas/admin.schema'

export function useAdminStats() {
  return useSuspenseQuery(orpc.admin.stats.queryOptions())
}

export function useAdminTrends(input: z.infer<typeof TrendsInputSchema>) {
  return useSuspenseQuery(orpc.admin.trends.queryOptions({ input }))
}

export function useAdminPosts(input: z.infer<typeof PostsInputSchema>) {
  return useSuspenseQuery(orpc.admin.posts.queryOptions({ input }))
}
