import { Activity } from 'react'
import { Link, useLocation } from '@tanstack/react-router'

import { Avatar } from '@/components/ui/avatar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { useSignInDialog } from '@/hooks/use-sign-in-dialog'
import { useAuthStore } from '@/store/auth'
import { ThemeToggle } from './ThemeToggle'
import { useSignOut } from '@/hooks/use-sign-out'

const NAV_LINKS = [
  { to: '/projects', label: 'Projects' },
  { to: '/blog', label: 'Blog' },
  { to: '/uses', label: 'Uses' },
  { to: '/contact', label: 'Contact' },
] as const

export function Header() {
  const { pathname } = useLocation()
  const { user, isLoading } = useAuthStore()
  const { openDialog } = useSignInDialog()
  const signOut = useSignOut({ redirectTo: '/' })

  const navLinks = [
    ...NAV_LINKS,
    ...(user?.role === 'admin' ? [{ to: '/admin', label: 'Admin' } as const] : []),
  ]

  return (
    <header className='sticky top-0 z-50 border-b border--(--) bg--(--) backdrop-blur-md'>
      <div className='mx-auto max-w-5xl px-4 h-14 flex items-center justify-between gap-6'>
        <Link
          to='/'
          className='font-[Fraunces] font-bold text-lg text--(--) hover:text--(--) transition-colors'
        >
          Portfolio
        </Link>
        <Activity mode={pathname.startsWith('/admin') ? 'hidden' : 'visible'}>
          <nav className='hidden sm:flex items-center gap-1'>
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className='px-3 py-1.5 rounded-lg text-sm text--(--) hover:text--(--) hover:bg--(--) transition-colors'
                activeProps={{
                  className: 'px-3 py-1.5 rounded-lg text-sm text--(--) bg--(--)',
                }}
              >
                {label}
              </Link>
            ))}
          </nav>
        </Activity>
        <div className='flex items-center gap-2'>
          <ThemeToggle />
          {!isLoading &&
            (user ? (
              <Popover>
                <PopoverTrigger asChild>
                  <Button className='bg-transparent hover:bg-transparent hover:cursor-pointer'>
                    <Avatar
                      src={user.image ?? null}
                      alt={user.name ?? 'User'}
                      size={28}
                    />
                  </Button>
                </PopoverTrigger>
                <PopoverContent align='end' className='w-fit p-2'>
                  <Button
                    type='button'
                    variant='outline'
                    onClick={async () => await signOut()}
                  >
                    Sign out
                  </Button>
                </PopoverContent>
              </Popover>
            ) : (
              <Button
                type='button'
                onClick={openDialog}
                className='px-3 py-1.5 rounded-lg text-sm font-medium bg--(--) text-white hover:bg--(--) transition-colors'
              >
                Sign in
              </Button>
            ))}
        </div>
      </div>
    </header>
  )
}

export default Header
