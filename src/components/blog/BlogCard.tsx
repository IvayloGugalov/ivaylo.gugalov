import { Link } from '@tanstack/react-router'
import { Badge } from '#/components/ui/Badge'
import type { PostFrontmatter } from '#/server/blog/mdx'

interface BlogCardProps {
  post: PostFrontmatter & { slug: string }
}

export function BlogCard({ post }: BlogCardProps) {
  return (
    <Link
      to="/blog/$slug"
      params={{ slug: post.slug }}
      className="group block rounded-xl border border-(--line) bg--(--) p-6 hover:bg--(--) hover:border--(--) transition-all"
    >
      <div className="flex items-center gap-2 mb-3">
        <Badge variant="outline">{post.category}</Badge>
        <span className="text-xs text--(--)">
          {new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
      </div>
      <h2 className="font-[Fraunces] text-xl font-bold text--(--) group-hover:text--(--) transition-colors mb-2">
        {post.title}
      </h2>
      <p className="text-sm text--(--) line-clamp-3">{post.description}</p>
      {post.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-4">
          {post.tags.map((tag) => (
            <Badge key={tag}>{tag}</Badge>
          ))}
        </div>
      )}
    </Link>
  )
}
