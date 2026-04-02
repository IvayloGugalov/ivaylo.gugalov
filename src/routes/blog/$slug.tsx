import { useEffect, useState } from 'react'
import { createFileRoute, ErrorComponent, notFound } from '@tanstack/react-router'
import { run } from '@mdx-js/mdx'
import * as runtime from 'react/jsx-runtime'
import { Loader2 } from 'lucide-react'
import type { MDXModule } from 'mdx/types'

import { useGetPost, useGetPostMeta } from '@/hooks/queries/blog.query'
import { CommentThread } from '@/components/blog/CommentThread'
import { ReactionBar } from '@/components/blog/ReactionBar'
import { orpc, client } from '@/orpc/client'

function Loader() {
  return (
    <div className='flex justify-center items-center min-h-[25vh]'>
      <Loader2 className='size-8 animate-spin text-muted-foreground' />
    </div>
  )
}

export const Route = createFileRoute('/blog/$slug')({
  loader: ({ params, context }) => {
    const { slug } = params

    const post = context.queryClient.ensureQueryData(
      orpc.blog.getPost.queryOptions({ input: { slug } }),
    )

    if (!post) throw notFound()

    const postMeta = context.queryClient.ensureQueryData(
      orpc.blog.getPostMeta.queryOptions({ input: { slug } }),
    )

    const reactions = context.queryClient.ensureQueryData(
      orpc.comments.getReactions.queryOptions({
        input: { targetId: slug, targetType: 'post' },
      }),
    )

    const comments = context.queryClient.ensureInfiniteQueryData(
      orpc.comments.listComments.infiniteOptions({
        input: () => ({ postSlug: slug }),
        initialPageParam: undefined,
        getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
      }),
    )

    return { post, postMeta, reactions, comments }
  },
  head: ({ loaderData: _ }) => ({
    meta: [{ title: 'Blog Post | Portfolio' }],
  }),
  pendingComponent: () => <Loader />,
  notFoundComponent: () => <ErrorComponent error={new Error('Post not found')} />,
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
        {MDXContent ? <MDXContent /> : <Loader />}
      </article>

      <CommentThread postSlug={slug} />
    </main>
  )
}
