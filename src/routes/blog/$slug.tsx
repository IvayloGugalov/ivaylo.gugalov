import { Suspense, useEffect, useState } from 'react'
import { Link, createFileRoute, ErrorComponent, notFound } from '@tanstack/react-router'
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

    context.queryClient.prefetchQuery(
      orpc.blog.getPostMeta.queryOptions({ input: { slug } }),
    )
    context.queryClient.prefetchQuery(
      orpc.comments.getReactions.queryOptions({
        input: { targetId: slug, targetType: 'post' },
      }),
    )
    context.queryClient.prefetchInfiniteQuery(
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

function PostMetaLine({ slug, date }: { slug: string; date: string }) {
  const { data: meta } = useGetPostMeta(slug)
  return (
    <p className='text-sm text-text-muted mb-2'>
      {new Date(date).toLocaleString()} · {m.blog_views({ count: meta.views })}
    </p>
  )
}

function BlogPostPage() {
  const { slug } = Route.useParams()
  const { data: post } = useGetPost(slug)
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
    <main id='main-content' className='mx-auto max-w-3xl px-4 py-24 md:py-32'>
      <Link
        to='/blog'
        className='inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary transition-colors mb-8'
      >
        <span aria-hidden>←</span>
        {m.blog_back_to_posts()}
      </Link>

      <header className='mb-10'>
        <Suspense
          fallback={
            <p className='text-sm text-text-muted mb-2'>
              {new Date(post.frontmatter.date).toLocaleString()}
            </p>
          }
        >
          <PostMetaLine slug={slug} date={post.frontmatter.date} />
        </Suspense>
        <h1 className='text-4xl font-bold tracking-tight text-text-primary mb-3'>
          {post.frontmatter.title}
        </h1>
        <p className='text-text-secondary leading-relaxed'>{post.frontmatter.description}</p>
      </header>

      <Suspense
        fallback={
          <div className='flex gap-2'>
            <div className='h-8 w-14 rounded-full bg-surface-raised animate-pulse' />
            <div className='h-8 w-14 rounded-full bg-surface-raised animate-pulse' />
            <div className='h-8 w-14 rounded-full bg-surface-raised animate-pulse' />
            <div className='h-8 w-14 rounded-full bg-surface-raised animate-pulse' />
            <div className='h-8 w-14 rounded-full bg-surface-raised animate-pulse' />
          </div>
        }
      >
        <ReactionBar targetId={slug} targetType='post' />
      </Suspense>

      <article className='prose prose-neutral dark:prose-invert max-w-none mt-10'>
        {MDXContent ? <MDXContent /> : <Loader />}
      </article>

      <Suspense
        fallback={
          <div className='mt-16 space-y-4'>
            <div className='h-16 rounded-lg bg-surface-raised animate-pulse' />
            <div className='h-16 rounded-lg bg-surface-raised animate-pulse' />
            <div className='h-16 rounded-lg bg-surface-raised animate-pulse' />
          </div>
        }
      >
        <CommentThread postSlug={slug} />
      </Suspense>
    </main>
  )
}
