import { os } from '@orpc/server'
import { z } from 'zod'
import { and, eq } from 'drizzle-orm'
import { db } from '#/server/db/client'
import { comments, reactions } from '#/server/db/schema'
import { publicProcedure, requireAuth } from '#/server/auth/middleware'

export const commentsRouter = os.router({
  getComments: publicProcedure
    .input(z.object({ postSlug: z.string() }))
    .handler(async ({ input }) => {
      const all = await db
        .select()
        .from(comments)
        .where(eq(comments.postSlug, input.postSlug))
        .orderBy(comments.createdAt)

      const topLevel = all.filter((c) => c.parentId === null)
      return topLevel.map((parent) => ({
        ...parent,
        replies: all.filter((c) => c.parentId === parent.id),
      }))
    }),

  createComment: requireAuth
    .input(
      z.object({
        postSlug: z.string(),
        content: z.string().min(1).max(2000),
        parentId: z.string().uuid().optional(),
      })
    )
    .handler(async ({ input, context }) => {
      if (input.parentId) {
        const [parent] = await db.select().from(comments).where(eq(comments.id, input.parentId)).limit(1)
        if (!parent) throw new Error('Parent comment not found')
        if (parent.parentId !== null) throw new Error('Cannot nest more than 1 level deep')
      }

      const [created] = await db
        .insert(comments)
        .values({
          postSlug: input.postSlug,
          userId: context.user.id,
          content: input.content,
          parentId: input.parentId ?? null,
        })
        .returning()

      return created
    }),

  deleteComment: requireAuth
    .input(z.object({ commentId: z.string().uuid() }))
    .handler(async ({ input, context }) => {
      const [deleted] = await db
        .delete(comments)
        .where(and(eq(comments.id, input.commentId), eq(comments.userId, context.user.id)))
        .returning()

      if (!deleted) throw new Error('Comment not found or not yours')
      return { ok: true }
    }),

  addReaction: requireAuth
    .input(
      z.object({
        targetId: z.string(),
        targetType: z.enum(['post', 'comment']),
        emoji: z.string().min(1).max(8),
      })
    )
    .handler(async ({ input, context }) => {
      const [reaction] = await db
        .insert(reactions)
        .values({
          targetId: input.targetId,
          targetType: input.targetType,
          userId: context.user.id,
          emoji: input.emoji,
        })
        .onConflictDoNothing()
        .returning()

      return reaction ?? { already: true }
    }),

  deleteReaction: requireAuth
    .input(z.object({ reactionId: z.string().uuid() }))
    .handler(async ({ input, context }) => {
      const [deleted] = await db
        .delete(reactions)
        .where(and(eq(reactions.id, input.reactionId), eq(reactions.userId, context.user.id)))
        .returning()

      if (!deleted) throw new Error('Reaction not found or not yours')
      return { ok: true }
    }),
})
