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
        variant='ghost'
        onClick={() => onSelect(null)}
        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 cursor-pointer border ${
          activeTag === null
            ? 'bg-accent-muted text-accent-primary border-accent-glow hover:bg-accent-muted hover:text-accent-primary'
            : 'bg-surface text-text-secondary border-border hover:text-text-primary hover:border-accent-glow hover:bg-surface'
        }`}
      >
        {m.blog_filter_all()}
      </Button>
      {tags.map((tag) => (
        <Button
          key={tag}
          type='button'
          variant='ghost'
          onClick={() => onSelect(tag)}
          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 cursor-pointer border ${
            activeTag === tag
              ? 'bg-accent-muted text-accent-primary border-accent-glow hover:bg-accent-muted hover:text-accent-primary'
              : 'bg-surface text-text-secondary border-border hover:text-text-primary hover:border-accent-glow hover:bg-surface'
          }`}
        >
          {tag}
        </Button>
      ))}
    </div>
  )
}
