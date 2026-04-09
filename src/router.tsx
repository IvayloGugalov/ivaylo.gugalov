import { createRouter } from '@tanstack/react-router'
import { setupRouterSsrQueryIntegration } from '@tanstack/react-router-ssr-query'
import { routeTree } from './routeTree.gen'
import { getContext, Provider } from './tanstack-query/root-provider'
import { NotFound } from './components/NotFound'
import { localizeUrl, deLocalizeUrl } from './paraglide/runtime'
// paraglideMiddleware is applied in src/server.ts (the custom server entry)

export function getRouter() {
  const context = getContext()

  const routerWithContext = createRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 0, // disable Router's preload cache, let Query manage freshness
    context,
    Wrap: ({ children }) => <Provider {...context}>{children}</Provider>,
    defaultNotFoundComponent: NotFound,
    rewrite: {
      // Strip locale prefix from incoming URLs so the router sees canonical paths
      // e.g. /bg/about → /about
      input: ({ url }) => deLocalizeUrl(url),
      // Add locale prefix to outgoing URLs, but never for admin or api routes
      output: ({ url }) => {
        if (
          url.pathname.startsWith('/admin') ||
          url.pathname.startsWith('/api')
        ) {
          return url
        }
        return localizeUrl(url)
      },
    },
  })

  setupRouterSsrQueryIntegration({
    router: routerWithContext,
    queryClient: context.queryClient,
  })

  return routerWithContext
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
