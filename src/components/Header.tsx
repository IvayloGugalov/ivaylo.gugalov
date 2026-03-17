import { Link } from '@tanstack/react-router'
import { useAuthStore } from '#/store/auth'
import { ThemeToggle } from './ThemeToggle'
import { Avatar } from './ui/Avatar'

const NAV_LINKS = [
  { to: '/projects', label: 'Projects' },
  { to: '/blog', label: 'Blog' },
  { to: '/uses', label: 'Uses' },
  { to: '/contact', label: 'Contact' },
] as const

export function Header() {
  const { user, isLoading } = useAuthStore()

  return (
    <header className="sticky top-0 z-50 border-b border--(--) bg--(--) backdrop-blur-md">
      <div className="mx-auto max-w-5xl px-4 h-14 flex items-center justify-between gap-6">
        <Link to="/" className="font-[Fraunces] font-bold text-lg text--(--) hover:text--(--) transition-colors">
          Portfolio
        </Link>
        <nav className="hidden sm:flex items-center gap-1">
          {NAV_LINKS.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className="px-3 py-1.5 rounded-lg text-sm text--(--) hover:text--(--) hover:bg--(--) transition-colors"
              activeProps={{ className: 'px-3 py-1.5 rounded-lg text-sm text--(--) bg--(--)' }}
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {!isLoading && (
            user ? (
              <Avatar src={user.image ?? null} alt={user.name ?? 'User'} size={28} />
            ) : (
              <a
                href="/api/auth/signin/github"
                className="px-3 py-1.5 rounded-lg text-sm font-medium bg--(--) text-white hover:bg--(--) transition-colors"
              >
                Sign in
              </a>
            )
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
