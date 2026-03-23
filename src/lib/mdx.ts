import { compile } from '@mdx-js/mdx'
import rehypeShiki from '@shikijs/rehype'
import matter from 'gray-matter'
import remarkGfm from 'remark-gfm'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, sep } from 'node:path'
import { ORPCError } from '@orpc/server'
import { z } from 'zod'

const PostFrontmatterSchema = z.object({
  title: z.string(),
  date: z
    .union([z.string(), z.date()])
    .transform((v) => (v instanceof Date ? v.toISOString() : v)),
  tags: z.array(z.string()),
  category: z.string(),
  description: z.string(),
})

export interface PostFrontmatter {
  title: string
  date: string
  tags: string[]
  category: string
  description: string
}

const POSTS_DIR = join(process.cwd(), 'content', 'posts')

// Per-slug cache: slug → { code, mtime, frontmatter }
const cache = new Map<
  string,
  { code: string; mtime: number; frontmatter: PostFrontmatter }
>()

export async function compileMdx(
  slug: string,
): Promise<{ code: string; frontmatter: PostFrontmatter }> {
  const filePath = join(POSTS_DIR, `${slug}.mdx`)
  // Prevent path traversal
  if (!filePath.startsWith(POSTS_DIR + sep)) throw new ORPCError('NOT_FOUND')
  const mtime = statSync(filePath).mtimeMs
  const cached = cache.get(slug)

  if (cached && cached.mtime === mtime) {
    return { code: cached.code, frontmatter: cached.frontmatter }
  }

  const raw = readFileSync(filePath, 'utf-8')
  const { data, content } = matter(raw)
  const frontmatter = PostFrontmatterSchema.parse(data)

  const compiled = await compile(content, {
    outputFormat: 'function-body',
    remarkPlugins: [remarkGfm],
    rehypePlugins: [[rehypeShiki, { theme: 'github-dark-dimmed' }]],
  })

  const code = String(compiled)
  cache.set(slug, { code, mtime, frontmatter })
  return { code, frontmatter }
}

export function listPosts(): Array<PostFrontmatter & { slug: string }> {
  const files = readdirSync(POSTS_DIR).filter((f) => f.endsWith('.mdx'))

  return files
    .map((file) => {
      const slug = file.replace('.mdx', '')
      const raw = readFileSync(join(POSTS_DIR, file), 'utf-8')
      const { data } = matter(raw)
      const parsed = PostFrontmatterSchema.safeParse(data)
      if (!parsed.success) return null
      return { ...parsed.data, slug }
    })
    .filter((p): p is PostFrontmatter & { slug: string } => p !== null)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}
