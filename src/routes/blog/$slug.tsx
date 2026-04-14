import { Suspense } from 'react'
import { createFileRoute, ErrorComponent, notFound } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { CompositeComponent } from '@tanstack/react-start/rsc'

import { orpc } from '@/orpc/client'
import { postPageQueryOptions } from '@/hooks/queries/blog.query'
import { CommentThread } from '@/components/blog/CommentThread'
import { ReactionBar } from '@/components/blog/ReactionBar'
import { PostMetaAndViews } from '@/components/blog/PostMetaAndViews'
import { ErrorFallback } from '@/components/ErrorFallback'
import { SITE_URL, SITE_NAME, OG_IMAGE } from '@/constants/site'
import { buildMeta } from '@/lib/seo'

function PostSkeleton() {
  return (
    <div className='mx-auto max-w-3xl px-4 py-24 md:py-32 animate-pulse'>
      <div className='h-4 w-24 bg-surface-raised rounded mb-8' />
      <div className='h-8 w-3/4 bg-surface-raised rounded mb-4' />
      <div className='h-4 w-1/2 bg-surface-raised rounded mb-10' />
      <div className='space-y-3'>
        <div className='h-4 bg-surface-raised rounded' />
        <div className='h-4 bg-surface-raised rounded' />
        <div className='h-4 w-5/6 bg-surface-raised rounded' />
      </div>
    </div>
  )
}

function ReactionSkeleton() {
  return (
    <div className='flex gap-2'>
      {[...Array(5)].map((_, i) => (
        <div key={i} className='h-8 w-14 rounded-full bg-surface-raised animate-pulse' />
      ))}
    </div>
  )
}

function CommentSkeleton() {
  return (
    <div className='mt-16 space-y-4'>
      <div className='h-16 rounded-lg bg-surface-raised animate-pulse' />
      <div className='h-16 rounded-lg bg-surface-raised animate-pulse' />
      <div className='h-16 rounded-lg bg-surface-raised animate-pulse' />
    </div>
  )
}

export const Route = createFileRoute('/blog/$slug')({
  loader: async ({ params, context }) => {
    const { slug } = params

    // Blocking: validates post exists and provides frontmatter for head() / JSON-LD.
    const post = await context.queryClient.ensureQueryData(
      orpc.blog.getPost.queryOptions({ input: { slug } }),
    )

    if (!post) throw notFound()

    // Non-blocking: all resolve via Suspense boundaries in the component tree.
    // getBlogPostPage also calls client.blog.getPost internally — hits mtime cache.
    context.queryClient.prefetchQuery(postPageQueryOptions(slug))
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
  pendingComponent: () => <PostSkeleton />,
  notFoundComponent: () => <ErrorComponent error={new Error('Post not found')} />,
  errorComponent: ({ error, reset }) => (
    <ErrorFallback message={error.message} onRetry={reset} />
  ),
  component: BlogPostPage,
})

function BlogPostPage() {
  const { slug } = Route.useParams()

  return (
    <Suspense fallback={<PostSkeleton />}>
      <BlogPostComposite slug={slug} />
    </Suspense>
  )
}

function BlogPostComposite({ slug }: { slug: string }) {
  const { data } = useSuspenseQuery(postPageQueryOptions(slug))

  return (
    <CompositeComponent
      src={data.src}
      renderPostMeta={({ slug, date, title }) => (
        <PostMetaAndViews slug={slug} date={date} title={title} />
      )}
      renderReactions={({ slug }) => (
        <Suspense fallback={<ReactionSkeleton />}>
          <ReactionBar targetId={slug} targetType='post' />
        </Suspense>
      )}
      renderComments={({ postSlug }) => (
        <Suspense fallback={<CommentSkeleton />}>
          <CommentThread postSlug={postSlug} />
        </Suspense>
      )}
    />
  )
}
