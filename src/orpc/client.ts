import { createORPCClient } from '@orpc/client'
import { RPCLink } from '@orpc/client/fetch'
import type { InferRouterInputs, InferRouterOutputs, RouterClient } from '@orpc/server'
import { createRouterClient } from '@orpc/server'
import { createTanstackQueryUtils } from '@orpc/tanstack-query'
import { createIsomorphicFn } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'
import { appRouter } from '#/server/router'
import type { AppRouter } from '#/server/router'

const getORPCClient = createIsomorphicFn()
  .server(() =>
    createRouterClient(appRouter, {
      context: () => ({
        headers: getRequestHeaders(),
      }),
    }),
  )
  .client((): RouterClient<AppRouter> => {
    const link = new RPCLink({
      url: `${window.location.origin}/api/rpc`,
    })
    return createORPCClient(link)
  })

export const client: RouterClient<AppRouter> = getORPCClient()

export const orpc = createTanstackQueryUtils(client)

export type Inputs = InferRouterInputs<AppRouter>
export type Outputs = InferRouterOutputs<AppRouter>