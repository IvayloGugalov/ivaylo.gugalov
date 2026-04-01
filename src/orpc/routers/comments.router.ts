import { ORPCError } from '@orpc/server'
import { and, asc, desc, eq, gt, lt } from 'drizzle-orm'

import { db } from '@/db/client'
import { comments, reactions, selectCommentsSchema } from '@/db/schemas'
import { protectedProcedure, publicProcedure } from '@/orpc/procedures'
import { auth } from '@/lib/auth'
import { commentRatelimit, reactionRatelimit } from '@/lib/rate-limiter'
import {
  AddReactionInputSchema,
  AddReactionOutputSchema,
  CreateCommentInputSchema,
  DeleteCommentInputSchema,
  DeleteReactionInputSchema,
  GetReactionsInputSchema,
  GetReactionsOutputSchema,
  ListCommentsInputSchema,
  ListCommentsOutputSchema,
} from '../schemas/comments.schema'
import { EmptyOutputSchema } from '../schemas/common.schema'

export const commentsRouter = {
  listComments: publicProcedure
    .input(ListCommentsInputSchema)
    .output(ListCommentsOutputSchema)
    .handler(async ({ input, context }) => {
      function getCursorFilter() {
        if (!input.cursor) return

        return input.sort === 'newest'
          ? lt(comments.createdAt, input.cursor)
          : gt(comments.createdAt, input.cursor)
      }

      const all = await context.db.query.comments.findMany({
        where: and(eq(comments.postSlug, input.postSlug), getCursorFilter()),
        limit: input.limit,
        with: {
          user: {
            columns: {
              name: true,
              image: true,
              role: true,
              id: true,
            },
          },
        },
        orderBy:
          input.sort === 'newest' ? desc(comments.createdAt) : asc(comments.createdAt),
      })

      const topLevel = all.filter((c) => c.parentId === null)

      return {
        items: topLevel.map((parent) => ({
          ...parent,
          replies: all.filter((c) => c.parentId === parent.id),
        })),
        nextCursor: all.length >= input.limit ? all.at(-1)?.createdAt : undefined,
      }
    }),

  createComment: protectedProcedure
    .input(CreateCommentInputSchema)
    .output(selectCommentsSchema)
    .handler(async ({ input, context }) => {
      const { allowed, retryAfter } = commentRatelimit.check(
        context.session?.user.id ?? '',
      )
      if (!allowed)
        throw new ORPCError('TOO_MANY_REQUESTS', {
          message: `Rate limited. Retry in ${Math.ceil(retryAfter / 1000)}s`,
        })
      if (input.parentId) {
        const [parent] = await db
          .select()
          .from(comments)
          .where(eq(comments.id, input.parentId))
          .limit(1)
        if (!parent)
          throw new ORPCError('NOT_FOUND', { message: 'Parent comment not found' })
        if (parent.parentId !== null)
          throw new ORPCError('BAD_REQUEST', {
            message: 'Cannot nest more than 1 level deep',
          })
      }

      const [created] = await db
        .insert(comments)
        .values({
          postSlug: input.postSlug,
          userId: context.session?.user.id ?? '',
          content: input.content,
          parentId: input.parentId ?? null,
        })
        .returning()

      return created
    }),

  deleteComment: protectedProcedure
    .input(DeleteCommentInputSchema)
    .output(EmptyOutputSchema)
    .handler(async ({ input, context }) => {
      const [deleted] = await db
        .delete(comments)
        .where(
          and(
            eq(comments.id, input.commentId),
            eq(comments.userId, context.session?.user.id ?? ''),
          ),
        )
        .returning()

      if (!deleted)
        throw new ORPCError('NOT_FOUND', { message: 'Comment not found or not yours' })

      return
    }),

  getReactions: publicProcedure
    .input(GetReactionsInputSchema)
    .output(GetReactionsOutputSchema)
    .handler(async ({ input, context }) => {
      const headers = (context as { headers?: Headers }).headers
      let userId: string | null = null
      if (headers) {
        const session = await auth.api.getSession({ headers }).catch(() => null)
        userId = session?.user?.id ?? null
      }

      const all = await db
        .select()
        .from(reactions)
        .where(
          and(
            eq(reactions.targetId, input.targetId),
            eq(reactions.targetType, input.targetType),
          ),
        )

      const grouped = new Map<string, { count: number; reactionId: string | null }>()
      for (const r of all) {
        const entry = grouped.get(r.emoji) ?? { count: 0, reactionId: null }
        entry.count++
        if (userId && r.userId === userId) entry.reactionId = r.id
        grouped.set(r.emoji, entry)
      }

      return Array.from(grouped.entries()).map(([emoji, { count, reactionId }]) => ({
        emoji,
        count,
        reactionId,
      }))
    }),

  addReaction: protectedProcedure
    .input(AddReactionInputSchema)
    .output(AddReactionOutputSchema)
    .handler(async ({ input, context }) => {
      const { allowed, retryAfter } = reactionRatelimit.check(
        context.session?.user.id ?? '',
      )
      if (!allowed)
        throw new ORPCError('TOO_MANY_REQUESTS', {
          message: `Rate limited. Retry in ${Math.ceil(retryAfter / 1000)}s`,
        })
      const [reaction] = await db
        .insert(reactions)
        .values({
          targetId: input.targetId,
          targetType: input.targetType,
          userId: context.session?.user.id ?? '',
          emoji: input.emoji,
        })
        .onConflictDoNothing()
        .returning()

      return reaction ?? { already: true }
    }),

  deleteReaction: protectedProcedure
    .input(DeleteReactionInputSchema)
    .output(EmptyOutputSchema)
    .handler(async ({ input, context }) => {
      const [deleted] = await db
        .delete(reactions)
        .where(
          and(
            eq(reactions.id, input.reactionId),
            eq(reactions.userId, context.session?.user.id ?? ''),
          ),
        )
        .returning()

      if (!deleted)
        throw new ORPCError('NOT_FOUND', { message: 'Reaction not found or not yours' })

      return
    }),
}
