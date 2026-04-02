import { eq, sql } from 'drizzle-orm'
import { db } from '@/db/client'
import { postsMeta } from '@/db/schemas'
import { publicProcedure } from '@/orpc/procedures'
import { compileMdx, listPosts } from '@/lib/mdx'
import {
  GetPostInputSchema,
  GetPostMetaInputSchema,
  GetPostMetaOutputSchema,
  GetPostOutputSchema,
  GetPostsInputSchema,
  GetPostsOutputSchema,
  IncrementViewsInputSchema,
  IncrementViewsOutputSchema,
} from '../schemas/blog.schema'

export const blogRouter = {
  getPosts: publicProcedure
    .input(GetPostsInputSchema)
    .output(GetPostsOutputSchema)
    .handler(async ({ input }) => {
      let posts = listPosts()

      if (input?.tag) posts = posts.filter((p) => p.tags.includes(input.tag!))
      if (input?.category) posts = posts.filter((p) => p.category === input.category)
      return posts
    }),

  getPost: publicProcedure
    .input(GetPostInputSchema)
    .output(GetPostOutputSchema)
    .handler(async ({ input }) => compileMdx(input.slug)),

  getPostMeta: publicProcedure
    .input(GetPostMetaInputSchema)
    .output(GetPostMetaOutputSchema)
    .handler(async ({ input }) => {
      const [meta] = await db
        .select()
        .from(postsMeta)
        .where(eq(postsMeta.slug, input.slug))
      return { views: meta?.views ?? 0 }
    }),

  incrementViews: publicProcedure
    .input(IncrementViewsInputSchema)
    .output(IncrementViewsOutputSchema)
    .handler(async ({ input }) => {
      await db
        .insert(postsMeta)
        .values({ slug: input.slug, views: 1, title: input.title })
        .onConflictDoUpdate({
          target: postsMeta.slug,
          set: { views: sql`${postsMeta.views} + 1` },
        })
      return { ok: true as const }
    }),
}
