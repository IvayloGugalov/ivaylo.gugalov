import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { SITE_URL, SITE_NAME } from '@/constants/site'
import { buildMeta } from '@/lib/seo'

import { useListPosts } from '@/orpc/queries/blog.query'
import { orpc } from '@/orpc/client'
import { BlogCard } from '@/components/blog/BlogCard'
import { TagFilter } from '@/components/blog/TagFilter'
import FadeContent from '@/components/ui/reactbits/FadeContent'

export const Route = createFileRoute('/blog/')({
  loader: ({ context }) => {
    return context.queryClient.ensureQueryData(orpc.blog.getPosts.queryOptions())
  },
  staleTime: 5 * 60_000,
  headers: () => ({
    'Cache-Control': 'public, max-age=300, stale-while-revalidate=86400',
  }),
  head: () =>
    buildMeta({
      title: `Blog | ${SITE_NAME}`,
      description: 'Thoughts on code, design, and building things on the web.',
      url: `${SITE_URL}/blog`,
    }),
  component: BlogIndexPage,
})

function BlogIndexPage() {
  const { data: posts } = useListPosts()
  const [activeTag, setActiveTag] = useState<string | null>(null)

  const allTags = [...new Set(posts.flatMap((p) => p.tags))].sort()
  const filtered = activeTag ? posts.filter((p) => p.tags.includes(activeTag)) : posts

  return (
    <main className='mx-auto max-w-3xl px-4 py-24 md:py-32'>
      <FadeContent blur duration={600}>
        <p className='text-xs font-semibold tracking-widest text-accent-primary uppercase mb-4'>
          Blog
        </p>
        <h1 className='text-4xl font-bold tracking-tight text-text-primary mb-3'>
          Writing.
        </h1>
        <p className='text-text-secondary mb-8'>
          Thoughts on code, design, and building things.
        </p>
        {allTags.length > 0 && (
          <TagFilter tags={allTags} activeTag={activeTag} onSelect={setActiveTag} />
        )}
      </FadeContent>

      <FadeContent duration={600} delay={100}>
        <div className='mt-8'>
          {filtered.map((post) => (
            <BlogCard key={post.slug} post={post} />
          ))}
          {filtered.length === 0 && (
            <p className='text-text-muted py-8'>No posts found.</p>
          )}
        </div>
      </FadeContent>
    </main>
  )
}
