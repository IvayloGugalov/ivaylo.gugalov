import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { orpcQuery } from '#/lib/orpc-client'
import { BlogCard } from '#/components/blog/BlogCard'
import { TagFilter } from '#/components/blog/TagFilter'

export const Route = createFileRoute('/blog/')({
  loader: async ({ context }) => {
    const posts = await context.queryClient.ensureQueryData(
      orpcQuery.blog.getPosts.queryOptions()
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
    <main className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="font-[Fraunces] text-4xl font-bold text-[var(--sea-ink)] mb-4">Blog</h1>
      <p className="text-[var(--sea-ink-soft)] mb-8">Thoughts on code, design, and building things.</p>
      <TagFilter tags={allTags} activeTag={activeTag} onSelect={setActiveTag} />
      <div className="mt-8 space-y-4">
        {filtered.map((post) => (
          <BlogCard key={post.slug} post={post} />
        ))}
        {filtered.length === 0 && (
          <p className="text-[var(--sea-ink-soft)]">No posts found.</p>
        )}
      </div>
    </main>
  )
}
