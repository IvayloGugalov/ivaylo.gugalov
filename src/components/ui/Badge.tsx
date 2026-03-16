interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'outline'
}

export function Badge({ children, variant = 'default' }: BadgeProps) {
  const base = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium'
  const variants = {
    default: 'bg-[var(--chip-bg)] border border-[var(--chip-line)] text-[var(--sea-ink)]',
    outline: 'border border-[var(--line)] text-[var(--sea-ink-soft)]',
  }
  return <span className={`${base} ${variants[variant]}`}>{children}</span>
}
