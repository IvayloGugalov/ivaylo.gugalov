import { createORPCClient } from '@orpc/client'
import { RPCLink } from '@orpc/client/fetch'
import { createORPCReactQueryUtils } from '@orpc/react-query'
import { QueryClient } from '@tanstack/react-query'
import type { AppRouter } from '#/server/router'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
})

const link = new RPCLink({ url: '/api/rpc' })
export const orpc = createORPCClient<AppRouter>(link)

export const orpcQuery = createORPCReactQueryUtils(orpc)
