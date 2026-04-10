import { Button } from '@/components/ui/button'
import * as m from '../../paraglide/messages'

interface TagFilterProps {
  tags: string[]
  activeTag: string | null
  onSelect: (tag: string | null) => void
}

export function TagFilter({ tags, activeTag, onSelect }: TagFilterProps) {
  return (
    <div className='flex flex-wrap gap-2'>
      <Button
        type='button'
        onClick={() => onSelect(null)}
        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 cursor-pointer ${
          activeTag === null
            ? 'bg-accent-muted text-accent-primary border border-accent-glow'
            : 'bg-surface text-text-secondary border border-border hover:text-text-primary'
        }`}
      >
        {m.blog_filter_all()}
      </Button>
      {tags.map((tag) => (
        <Button
          key={tag}
          type='button'
          onClick={() => onSelect(tag)}
          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 cursor-pointer ${
            activeTag === tag
              ? 'bg-accent-muted text-accent-primary border border-accent-glow'
              : 'bg-surface text-text-secondary border border-border hover:text-text-primary'
          }`}
        >
          {tag}
        </Button>
      ))}
    </div>
  )
}
