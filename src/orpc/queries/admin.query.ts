import { useQuery } from '@tanstack/react-query'
import { orpc } from '../client'
import type { z } from 'zod'
import type { TrendsInputSchema } from '../schemas/admin.schema'

export function useAdminStats() {
  return useQuery(orpc.admin.stats.queryOptions())
}

export function useAdminTrends(input: z.infer<typeof TrendsInputSchema>) {
  return useQuery(orpc.admin.trends.queryOptions(input))
}

export function useAdminPosts(input: { limit: number; offset: number }) {
  return useQuery(orpc.admin.posts.queryOptions(input))
}
