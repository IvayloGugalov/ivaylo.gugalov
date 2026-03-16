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
            ? 'bg-[var(--lagoon)] text-white'
            : 'bg-[var(--chip-bg)] border border-[var(--chip-line)] text-[var(--sea-ink-soft)] hover:text-[var(--sea-ink)]'
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
              ? 'bg-[var(--lagoon)] text-white'
              : 'bg-[var(--chip-bg)] border border-[var(--chip-line)] text-[var(--sea-ink-soft)] hover:text-[var(--sea-ink)]'
          }`}
        >
          {tag}
        </button>
      ))}
    </div>
  )
}
