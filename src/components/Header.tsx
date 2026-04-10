import { Activity } from 'react'
import { Link, useLocation } from '@tanstack/react-router'
import { Menu } from 'lucide-react'

import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { useSignInDialog } from '@/hooks/use-sign-in-dialog'
import { useAuthStore } from '@/store/auth'
import { useSignOut } from '@/hooks/use-sign-out'
import { ThemeToggle } from './ThemeToggle'
import { LanguageSwitcher } from './LanguageSwitcher'
import { GITHUB_USERNAME } from '@/constants/site'
import * as m from '../paraglide/messages'

export function Header() {
  const { pathname } = useLocation()
  const { user, isLoading } = useAuthStore()
  const { openDialog } = useSignInDialog()
  const signOut = useSignOut({ redirectTo: '/' })

  const navLinks = [
    { to: '/about', label: m.nav_about() },
    { to: '/projects', label: m.nav_projects() },
    { to: '/blog', label: m.nav_blog() },
    { to: '/uses', label: m.nav_uses() },
    { to: '/contact', label: m.nav_contact() },
    ...(user?.role === 'admin' ? [{ to: '/admin', label: m.nav_admin() }] : []),
  ] as const

  return (
    <header className='sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md'>
      <div className='mx-auto max-w-5xl px-4 h-14 flex items-center justify-between gap-6'>
        {/* Wordmark */}
        <Link
          to='/'
          viewTransition
          className='font-semibold tracking-tight text-text-primary text-sm hover:text-accent-primary transition-colors duration-200'
        >
          {GITHUB_USERNAME}
        </Link>

        {/* Desktop nav */}
        <Activity mode={pathname.startsWith('/admin') ? 'hidden' : 'visible'}>
          <nav className='hidden sm:flex items-center gap-1'>
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                viewTransition
                className='relative px-3 py-3 text-sm text-text-secondary hover:text-accent-primary transition-colors duration-200 no-underline'
                activeProps={{
                  className:
                    'relative px-3 py-3 text-sm text-text-primary nav-active no-underline',
                }}
              >
                {label}
              </Link>
            ))}
          </nav>
        </Activity>

        <div className='flex items-center gap-2'>
          <LanguageSwitcher />
          <ThemeToggle />

          {/* Auth */}
          {!isLoading &&
            (user ? (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant='ghost'
                    size='icon'
                    className='rounded-full bg-transparent hover:bg-surface-raised cursor-pointer'
                  >
                    <Avatar
                      src={user.image ?? null}
                      alt={user.name ?? 'User'}
                      size={28}
                    />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  align='end'
                  className='w-fit p-2 bg-surface border-border'
                >
                  <Button
                    type='button'
                    variant='outline'
                    onClick={async () => await signOut()}
                    className='border-border text-text-secondary hover:text-text-primary hover:bg-surface-raised cursor-pointer'
                  >
                    {m.nav_sign_out()}
                  </Button>
                </PopoverContent>
              </Popover>
            ) : (
              <Button
                type='button'
                onClick={openDialog}
                className='px-3 py-1.5 h-auto text-sm font-medium bg-accent-primary text-background hover:bg-foreground hover:text-background transition-colors rounded-md cursor-pointer'
              >
                {m.nav_sign_in()}
              </Button>
            ))}

          {/* Mobile hamburger */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant='ghost'
                size='icon'
                className='sm:hidden size-11 bg-transparent hover:bg-surface-raised text-text-secondary cursor-pointer'
                aria-label='Open menu'
              >
                <Menu size={20} />
              </Button>
            </SheetTrigger>
            <SheetContent
              side='right'
              className='bg-background/95 backdrop-blur-md border-border w-64'
            >
              <nav className='flex flex-col gap-1 mt-8'>
                {navLinks.map(({ to, label }) => (
                  <Link
                    key={to}
                    to={to}
                    viewTransition
                    className='px-4 py-3 text-sm text-text-secondary hover:text-accent-primary hover:bg-surface transition-colors rounded-md no-underline'
                    activeProps={{
                      className:
                        'px-4 py-3 text-sm text-text-primary bg-surface rounded-md no-underline',
                    }}
                  >
                    {label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <style>{`
        .nav-active::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 50%;
          transform: translateX(-50%);
          width: calc(100% - 1.5rem);
          height: 2px;
          background: var(--color-accent-primary);
          border-radius: 1px;
        }
      `}</style>
    </header>
  )
}

export default Header
