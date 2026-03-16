import { os } from '@orpc/server'
import { z } from 'zod'
import { db } from '#/server/db/client'
import { postsMeta } from '#/server/db/schema'
import { publicProcedure } from '#/server/auth/middleware'
import { compileMdx, listPosts } from './mdx'
import { eq, sql } from 'drizzle-orm'

export const blogRouter = os.router({
  getPosts: publicProcedure
    .input(
      z.object({
        tag: z.string().optional(),
        category: z.string().optional(),
      }).optional()
    )
    .handler(async ({ input }) => {
      let posts = listPosts()
      if (input?.tag) posts = posts.filter((p) => p.tags.includes(input.tag!))
      if (input?.category) posts = posts.filter((p) => p.category === input.category)
      return posts
    }),

  getPost: publicProcedure
    .input(z.object({ slug: z.string() }))
    .handler(async ({ input }) => compileMdx(input.slug)),

  getPostMeta: publicProcedure
    .input(z.object({ slug: z.string() }))
    .handler(async ({ input }) => {
      const [meta] = await db.select().from(postsMeta).where(eq(postsMeta.slug, input.slug))
      return { views: meta?.views ?? 0 }
    }),

  incrementViews: publicProcedure
    .input(z.object({ slug: z.string() }))
    .handler(async ({ input }) => {
      await db
        .insert(postsMeta)
        .values({ slug: input.slug, views: 1 })
        .onConflictDoUpdate({
          target: postsMeta.slug,
          set: { views: sql`${postsMeta.views} + 1` },
        })
      return { ok: true }
    }),
})
