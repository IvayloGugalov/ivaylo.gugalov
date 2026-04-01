import * as z from 'zod'
import { InfiniteQuerySchema } from './common.schema'
import { commentWithUser } from '@/db/schemas'

export const ListCommentsInputSchema = InfiniteQuerySchema.extend({
  postSlug: z.string().min(1),
  parentId: z.string().optional(),
  sort: z.enum(['newest', 'oldest']).default('newest'),
  type: z.enum(['comments', 'replies']).default('comments'),
  highlightedCommentId: z.string().optional(),
})

export const ListCommentsOutputSchema = z.object({
  items: z.array(
    commentWithUser.extend({
      replies: z.array(commentWithUser).optional(),
    }),
  ),
  nextCursor: z.date().nullish(),
})

export const CreateCommentInputSchema = z.object({
  postSlug: z.string().min(1),
  content: z.string().min(1),
  parentId: z.string().optional(),
})

export const DeleteCommentInputSchema = z.object({
  commentId: z.uuid(),
})

export const GetReactionsInputSchema = z.object({
  targetId: z.string(),
  targetType: z.enum(['post', 'comment']),
})

export const GetReactionsOutputSchema = z.array(
  z.object({
    emoji: z.string(),
    count: z.number().int().nonnegative(),
    reactionId: z.uuid().nullable(),
  }),
)

export const AddReactionInputSchema = z.object({
  targetId: z.string(),
  targetType: z.enum(['post', 'comment']),
  emoji: z.string().min(1).max(8),
})

export const AddReactionOutputSchema = z.union([
  z.object({
    id: z.uuid(),
    targetId: z.string(),
    targetType: z.enum(['post', 'comment']),
    userId: z.string(),
    emoji: z.string(),
    createdAt: z.date(),
  }),
  z.object({ already: z.literal(true) }),
])

export const DeleteReactionInputSchema = z.object({
  reactionId: z.uuid(),
})
