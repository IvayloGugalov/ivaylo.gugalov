import { z } from 'zod'
import { PostFrontmatterSchema } from '@/lib/mdx'

const PostSchema = PostFrontmatterSchema.extend({ slug: z.string() })

export const GetPostsInputSchema = z
  .object({
    tag: z.string().optional(),
    category: z.string().optional(),
  })
  .optional()
export const GetPostsOutputSchema = z.array(PostSchema)

export const GetPostInputSchema = z.object({ slug: z.string() })
export const GetPostOutputSchema = z.object({
  code: z.string(),
  frontmatter: PostFrontmatterSchema,
})

export const GetPostMetaInputSchema = z.object({ slug: z.string() })
export const GetPostMetaOutputSchema = z.object({
  views: z.number().int().nonnegative(),
})

export const IncrementViewsInputSchema = z.object({ slug: z.string() })
export const IncrementViewsOutputSchema = z.object({ ok: z.literal(true) })
