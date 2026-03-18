import { z } from 'zod'

export const TrendsInputSchema = z.object({
  days: z.number().int().min(1).max(365),
  timezone: z.string().refine(
    (tz) => {
      try {
        Intl.DateTimeFormat(undefined, { timeZone: tz })
        return true
      } catch {
        return false
      }
    },
    { message: 'Invalid IANA timezone' },
  ),
})

export const TrendPointSchema = z.object({
  date: z.string(),
  comments: z.number(),
  reactions: z.number(),
})

export const StatsOutputSchema = z.object({
  totalUsers: z.number(),
  totalComments: z.number(),
  totalReactions: z.number(),
  totalPosts: z.number(),
})

export const PostRowSchema = z.object({
  slug: z.string(),
  title: z.string(),
  views: z.number(),
  commentCount: z.number(),
  createdAt: z.string(),
})

export const PostsInputSchema = z.object({
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
})
