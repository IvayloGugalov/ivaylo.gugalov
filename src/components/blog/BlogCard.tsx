import { ArrowRight } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import type { PostFrontmatter } from '@/lib/mdx'

interface BlogCardProps {
  post: PostFrontmatter & { slug: string }
}

export function BlogCard({ post }: BlogCardProps) {
  return (
    <Link
      to='/blog/$slug'
      params={{ slug: post.slug }}
      className='group flex items-start justify-between py-5 border-b border-border hover:bg-surface transition-colors duration-200 no-underline pl-4 hover:border-l-2 hover:border-l-accent-primary cursor-pointer'
    >
      <div className='flex-1 min-w-0 pr-4'>
        <h2 className='text-lg font-medium text-text-primary group-hover:text-accent-primary transition-colors duration-200 mb-1'>
          {post.title}
        </h2>
        <p className='text-sm text-text-secondary line-clamp-2 mb-3'>
          {post.description}
        </p>
        {post.tags.length > 0 && (
          <div className='flex flex-wrap gap-1.5'>
            {post.tags.map((tag) => (
              <span
                key={tag}
                className='bg-accent-muted text-accent-primary text-xs px-2 py-0.5 rounded-full'
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className='flex flex-col items-end gap-2 flex-shrink-0'>
        <span className='text-sm text-text-muted tabular-nums'>
          {new Date(post.date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </span>
        <ArrowRight
          size={16}
          className='text-text-muted group-hover:text-accent-primary group-hover:translate-x-1 transition-all duration-200'
        />
      </div>
    </Link>
  )
}
