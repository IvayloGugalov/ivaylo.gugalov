interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'outline'
}

export function Badge({ children, variant = 'default' }: BadgeProps) {
  const base = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium'
  const variants = {
    default: 'bg--(--) border border--(--) text--(--)',
    outline: 'border border--(--) text--(--)',
  }
  return <span className={`${base} ${variants[variant]}`}>{children}</span>
}
