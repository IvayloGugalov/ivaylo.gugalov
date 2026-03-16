import { createFileRoute } from '@tanstack/react-router'
import { run } from '@mdx-js/mdx'
import * as runtime from 'react/jsx-runtime'
import { useEffect, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { orpcQuery } from '#/lib/orpc-client'
import { CommentThread } from '#/components/blog/CommentThread'
import { ReactionBar } from '#/components/blog/ReactionBar'
import type { MDXModule } from 'mdx/types'

export const Route = createFileRoute('/blog/$slug')({
  loader: async ({ params, context }) => {
    const [post, meta] = await Promise.all([
      context.queryClient.ensureQueryData(
        orpcQuery.blog.getPost.queryOptions({ slug: params.slug })
      ),
      context.queryClient.ensureQueryData(
        orpcQuery.blog.getPostMeta.queryOptions({ slug: params.slug })
      ),
    ])
    return { post, meta, slug: params.slug }
  },
  head: ({ loaderData }) => ({
    meta: [{ title: `${loaderData?.post.frontmatter.title ?? 'Post'} | Blog` }],
  }),
  component: BlogPostPage,
})

function BlogPostPage() {
  const { post, meta, slug } = Route.useLoaderData()
  const incrementViews = useMutation(orpcQuery.blog.incrementViews.mutationOptions())
  const [MDXContent, setMDXContent] = useState<React.ComponentType | null>(null)

  useEffect(() => {
    incrementViews.mutate({ slug })
  }, [slug]) // eslint-disable-line

  useEffect(() => {
    run(post.code, { ...runtime } as Parameters<typeof run>[1]).then((mod: MDXModule) => {
      setMDXContent(() => mod.default)
    })
  }, [post.code])

  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <header className="mb-10">
        <p className="text-sm text-[var(--sea-ink-soft)] mb-2">
          {new Date(post.frontmatter.date).toLocaleDateString('en-US', {
            month: 'long', day: 'numeric', year: 'numeric',
          })} · {meta.views} views
        </p>
        <h1 className="font-[Fraunces] text-4xl font-bold text-[var(--sea-ink)] mb-3">
          {post.frontmatter.title}
        </h1>
        <p className="text-[var(--sea-ink-soft)]">{post.frontmatter.description}</p>
      </header>

      <ReactionBar targetId={slug} targetType="post" />

      <article className="prose prose-neutral dark:prose-invert max-w-none mt-10">
        {MDXContent ? <MDXContent /> : <p className="text-[var(--sea-ink-soft)]">Loading...</p>}
      </article>

      <CommentThread postSlug={slug} />
    </main>
  )
}
