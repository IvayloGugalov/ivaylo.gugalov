import { createRouter } from '@tanstack/react-router'
import { setupRouterSsrQueryIntegration } from '@tanstack/react-router-ssr-query'
import { routeTree } from './routeTree.gen'
import { getContext, Provider } from './tanstack-query/root-provider'
import { NotFound } from './components/NotFound'

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
