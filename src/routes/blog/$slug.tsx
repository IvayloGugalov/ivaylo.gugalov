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
import { SITE_URL, SITE_NAME, OG_IMAGE } from '@/constants/site'
import { buildMeta } from '@/lib/seo'
import * as m from '../../paraglide/messages'

function Loader() {
  return (
    <div className='flex justify-center items-center min-h-dvh'>
      <Loader2 className='size-8 animate-spin text-muted-foreground' />
    </div>
  )
}

export const Route = createFileRoute('/blog/$slug')({
  loader: async ({ params, context }) => {
    const { slug } = params

    const post = await context.queryClient.ensureQueryData(
      orpc.blog.getPost.queryOptions({ input: { slug } }),
    )

    if (!post) throw notFound()

    context.queryClient.ensureQueryData(
      orpc.blog.getPostMeta.queryOptions({ input: { slug } }),
    )
    context.queryClient.ensureQueryData(
      orpc.comments.getReactions.queryOptions({
        input: { targetId: slug, targetType: 'post' },
      }),
    )
    context.queryClient.ensureInfiniteQueryData(
      orpc.comments.listComments.infiniteOptions({
        input: () => ({ postSlug: slug }),
        initialPageParam: undefined,
        getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
      }),
    )

    return { post }
  },
  staleTime: 60 * 60_000,
  headers: () => ({
    'Cache-Control': 'public, max-age=3600, stale-while-revalidate=604800',
  }),
  head: ({ loaderData, params }) => {
    const url = `${SITE_URL}/blog/${params.slug}`

    if (!loaderData?.post) {
      return buildMeta({
        title: `Blog | ${SITE_NAME}`,
        description: '',
        url,
        type: 'article',
      })
    }

    const { title, description, date } = loaderData.post.frontmatter
    return {
      ...buildMeta({
        title: `${title} | ${SITE_NAME}`,
        description,
        url,
        type: 'article',
      }),
      scripts: [
        {
          type: 'application/ld+json',
          children: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: title,
            description,
            datePublished: date,
            author: { '@type': 'Person', name: SITE_NAME, url: SITE_URL },
            image: OG_IMAGE,
            url,
          }),
        },
      ],
    }
  },
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
    client.blog.incrementViews({ slug, title: post.frontmatter.title })
  }, [slug, post.frontmatter.title])

  useEffect(() => {
    run(post.code, { ...runtime } as Parameters<typeof run>[1]).then((mod: MDXModule) => {
      setMDXContent(() => mod.default)
    })
  }, [post.code])

  return (
    <main className='mx-auto max-w-3xl px-4 py-16'>
      <header className='mb-10'>
        <p className='text-sm text-(--sea-ink-soft) mb-2'>
          {new Date(post.frontmatter.date).toLocaleString()} · {m.blog_views({ count: meta.views })}
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
