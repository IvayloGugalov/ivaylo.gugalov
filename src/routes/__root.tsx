import { useEffect } from 'react'
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
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
    links: [{ rel: 'stylesheet', href: appCss }],
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

function RootComponent() {
  const { user } = Route.useLoaderData()
  const setUser = useAuthStore((s) => s.setUser)

  useEffect(() => {
    setUser(user as User | null)
  }, [user, setUser])

  return (
    <>
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
    <html lang='en' suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className='font-sans antialiased wrap-anywhere selection:bg-[rgba(79,184,178,0.24)]'>
        <ThemeProvider>
          <Providers>{children}</Providers>
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  )
}
