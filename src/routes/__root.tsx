import { useEffect } from 'react'
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
  useLocation,
} from '@tanstack/react-router'
import { ThemeProvider } from '@/store/theme'
import type { QueryClient } from '@tanstack/react-query'
import TanStackQueryDevtools from '@/tanstack-query/devtools'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { createServerFn } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'
import { Toaster } from 'sonner'

import { Providers } from '@/components/providers'
import Footer from '../components/Footer'
import Header from '../components/Header'
import { SignInDialog } from '@/components/sign-in-dialog'
import { auth } from '@/lib/auth'
import { useAuthStore } from '@/store/auth'
import type { User } from '@/lib/auth'
import appCss from '../styles.css?url'
import geistSans400Url from '@fontsource/geist-sans/files/geist-sans-latin-400-normal.woff2?url'
import { getLocale } from '../paraglide/runtime'
import { SITE_URL } from '@/constants/site'

const getSession = createServerFn({ method: 'GET' }).handler(async () => {
  const headers = getRequestHeaders()
  return auth.api.getSession({ headers })
})

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Portfolio' },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      {
        rel: 'preload',
        as: 'font',
        type: 'font/woff2',
        href: geistSans400Url,
        crossOrigin: 'anonymous',
      },
    ],
  }),
  loader: async () => {
    try {
      const session = await getSession()
      return { user: (session?.user ?? null) as User | null }
    } catch {
      return { user: null }
    }
  },
  shellComponent: RootDocument,
  component: RootComponent,
})

function HreflangLinks() {
  const location = useLocation()
  // location.pathname is already the canonical path (input rewrite strips locale prefix)
  const canonicalPath = location.pathname
  const enHref = `${SITE_URL}${canonicalPath}`
  const bgHref = `${SITE_URL}/bg${canonicalPath === '/' ? '' : canonicalPath}`
  const canonicalHref = getLocale() === 'bg' ? bgHref : enHref

  return (
    <>
      <link rel='alternate' hrefLang='en' href={enHref} />
      <link rel='alternate' hrefLang='bg' href={bgHref} />
      <link rel='alternate' hrefLang='x-default' href={enHref} />
      <link rel='canonical' href={canonicalHref} />
    </>
  )
}

function RootComponent() {
  const { user } = Route.useLoaderData()
  const setUser = useAuthStore((s) => s.setUser)

  useEffect(() => {
    setUser(user as User | null)
  }, [user, setUser])

  return (
    <>
      <HreflangLinks />
      <Header />
      <Outlet />
      <Footer />
      <SignInDialog />
      <Toaster richColors position='bottom-right' />
      <TanStackDevtools
        config={{ position: 'bottom-right' }}
        plugins={[
          {
            name: 'Tanstack Router',
            render: <TanStackRouterDevtoolsPanel />,
          },
          TanStackQueryDevtools,
        ]}
      />
    </>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning lang={getLocale()}>
      <head>
        <HeadContent />
      </head>
      <body
        suppressHydrationWarning
        className='font-sans antialiased wrap-anywhere selection:bg-accent-muted selection:text-accent-primary'
      >
        <a
          href='#main-content'
          className='sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-9999 focus:px-4 focus:py-2 focus:rounded-md focus:bg-accent-primary focus:text-background focus:font-semibold focus:text-sm'
        >
          Skip to content
        </a>
        <ThemeProvider>
          <Providers>{children}</Providers>
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  )
}
