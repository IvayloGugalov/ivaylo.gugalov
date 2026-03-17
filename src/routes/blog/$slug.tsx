import { createFileRoute } from '@tanstack/react-router'
import { run } from '@mdx-js/mdx'
import * as runtime from 'react/jsx-runtime'
import { useEffect, useState } from 'react'
import { useGetPost, useGetPostMeta } from '@/hooks/queries/blog'
import { CommentThread } from '@/components/blog/CommentThread'
import { ReactionBar } from '@/components/blog/ReactionBar'
import type { MDXModule } from 'mdx/types'
import { orpc, client } from '@/orpc/client'

export const Route = createFileRoute('/blog/$slug')({
  loader: async ({ params, context }) => {
    const { slug } = params

    await Promise.all([
      context.queryClient.ensureQueryData(
        orpc.blog.getPost.queryOptions({ input: { slug } }),
      ),
      context.queryClient.ensureQueryData(
        orpc.blog.getPostMeta.queryOptions({ input: { slug } }),
      ),
      context.queryClient.ensureQueryData(
        orpc.comments.getComments.queryOptions({ input: { postSlug: slug } }),
      ),
      context.queryClient.ensureQueryData(
        orpc.comments.getReactions.queryOptions({
          input: { targetId: slug, targetType: 'post' },
        }),
      ),
    ])
  },
  head: ({ loaderData: _ }) => ({
    meta: [{ title: 'Blog Post | Portfolio' }],
  }),
  component: BlogPostPage,
})

function BlogPostPage() {
  const { slug } = Route.useParams()
  const { data: post } = useGetPost(slug)
  const { data: meta } = useGetPostMeta(slug)
  const [MDXContent, setMDXContent] = useState<React.ComponentType | null>(null)

  useEffect(() => {
    client.blog.incrementViews({ slug })
  }, [slug])

  useEffect(() => {
    run(post.code, { ...runtime } as Parameters<typeof run>[1]).then((mod: MDXModule) => {
      setMDXContent(() => mod.default)
    })
  }, [post.code])

  return (
    <main className='mx-auto max-w-3xl px-4 py-16'>
      <header className='mb-10'>
        <p className='text-sm text-(--sea-ink-soft) mb-2'>
          {new Date(post.frontmatter.date).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })}{' '}
          · {meta.views} views
        </p>
        <h1 className='font-[Fraunces] text-4xl font-bold text-(--sea-ink) mb-3'>
          {post.frontmatter.title}
        </h1>
        <p className='text-(--sea-ink-soft)'>{post.frontmatter.description}</p>
      </header>

      <ReactionBar targetId={slug} targetType='post' />

      <article className='prose prose-neutral dark:prose-invert max-w-none mt-10'>
        {MDXContent ? (
          <MDXContent />
        ) : (
          <p className='text-(--sea-ink-soft)'>Loading...</p>
        )}
      </article>

      <CommentThread postSlug={slug} />
    </main>
  )
}
