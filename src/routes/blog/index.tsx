import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { orpc } from '@/orpc/client'
import { BlogCard } from '@/components/blog/BlogCard'
import { TagFilter } from '@/components/blog/TagFilter'
import FadeContent from '@/components/ui/reactbits/FadeContent'

export const Route = createFileRoute('/blog/')({
  loader: async ({ context }) => {
    const posts = await context.queryClient.ensureQueryData(
      orpc.blog.getPosts.queryOptions(),
    )
    return { posts }
  },
  head: () => ({ meta: [{ title: 'Blog | Portfolio' }] }),
  component: BlogIndexPage,
})

function BlogIndexPage() {
  const { posts } = Route.useLoaderData()
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
