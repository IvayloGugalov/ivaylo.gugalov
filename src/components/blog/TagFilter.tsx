interface TagFilterProps {
  tags: string[]
  activeTag: string | null
  onSelect: (tag: string | null) => void
}

export function TagFilter({ tags, activeTag, onSelect }: TagFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onSelect(null)}
        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
          activeTag === null
            ? 'bg--(--) text-white'
            : 'bg--(--) border border--(--) text--(--) hover:text--(--)'
        }`}
      >
        All
      </button>
      {tags.map((tag) => (
        <button
          key={tag}
          onClick={() => onSelect(tag)}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            activeTag === tag
              ? 'bg--(--) text-white'
              : 'bg--(--) border border--(--) text--(--) hover:text--(--)'
          }`}
        >
          {tag}
        </button>
      ))}
    </div>
  )
}
