import { createORPCClient } from '@orpc/client'
import { RPCLink } from '@orpc/client/fetch'
import type { InferRouterInputs, InferRouterOutputs, RouterClient } from '@orpc/server'
import { createRouterClient } from '@orpc/server'
import { createTanstackQueryUtils } from '@orpc/tanstack-query'
import { createIsomorphicFn } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'
import { appRouter } from '@/orpc/router'
import type { AppRouter } from '@/orpc/router'
import { createORPCContext } from './context'

const getORPCClient = createIsomorphicFn()
  .server(() =>
    createRouterClient(appRouter, {
      context: () => createORPCContext(getRequestHeaders()),
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

export type GithubStatsGetOutput = Outputs['github']['stats']

export type CommentsListInput = Inputs['comments']['listComments']
