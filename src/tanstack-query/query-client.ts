import { StandardRPCJsonSerializer } from '@orpc/client/standard'
import {
  defaultShouldDehydrateQuery,
  MutationCache,
  QueryCache,
  QueryClient,
} from '@tanstack/react-query'
import posthog from 'posthog-js'
import { toast } from 'sonner'

const serializer = new StandardRPCJsonSerializer()

export const makeQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
      },
      dehydrate: {
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) || query.state.status === 'pending',
        serializeData: (data) => {
          const [json, meta] = serializer.serialize(data)
          return { json, meta }
        },
      },
      hydrate: {
        deserializeData: (data) => serializer.deserialize(data.json, data.meta),
      },
    },
    queryCache: new QueryCache({
      onError: (error, query) => {
        toast.error(`[QueryCache] error: ${error.message}`)

        posthog?.captureException(error, {
          type: 'query',
          queryKey: query.queryKey,
        })
      },
      onSuccess: (_data, query) => {
        console.log('[QueryCache] fetched:', JSON.stringify(query.queryKey))
      },
    }),
    mutationCache: new MutationCache({
      onError: (error, _variables, _context, mutation) => {
        toast.error(`[MutationCache] error: ${error.message}`)

        posthog?.captureException(error, {
          type: 'mutation',
          mutationKey: mutation.options.mutationKey,
        })
      },
    }),
  })
}
