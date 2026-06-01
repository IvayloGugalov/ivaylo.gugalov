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

// TanStack Start RSC stubs (from createCompositeComponent / renderServerComponent)
// carry their payload on this Symbol-keyed property. JSON serialization drops
// symbols, so running RSC data through oRPC's serializer would strip the stream
// and make <CompositeComponent> throw "missing RSC stream on src" after hydration.
// Such data must pass through untouched so Start's router-level $RSC serialization
// adapter can stream it across the SSR→client boundary instead.
const RSC_STREAM = Symbol.for('tanstack.rsc.stream')

const hasRscStream = (value: unknown): boolean =>
  value != null &&
  (typeof value === 'object' || typeof value === 'function') &&
  RSC_STREAM in (value as object) &&
  (value as Record<symbol, unknown>)[RSC_STREAM] !== undefined

const containsRsc = (data: unknown): boolean => {
  if (hasRscStream(data)) return true
  if (data != null && typeof data === 'object') {
    return Object.values(data as Record<string, unknown>).some(hasRscStream)
  }
  return false
}

export const makeQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        gcTime: 60 * 60_000, // match longest per-query staleTime (1h for blog posts)
        networkMode: 'offlineFirst',
      },
      dehydrate: {
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) || query.state.status === 'pending',
        serializeData: (data) => {
          // RSC stubs must reach the router's $RSC adapter alive — never JSON them.
          if (containsRsc(data)) return data
          const [json, meta] = serializer.serialize(data)
          return { json, meta }
        },
      },
      hydrate: {
        deserializeData: (data) => {
          // RSC data is passed through above (no { json, meta } envelope) and is
          // already reconstructed into a live stub by the router's $RSC adapter.
          if (data == null || typeof data !== 'object' || !('json' in data && 'meta' in data)) {
            return data
          }
          return serializer.deserialize(data.json, data.meta)
        },
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
        if (import.meta.env.DEV) {
          console.log('[QueryCache] fetched:', JSON.stringify(query.queryKey))
        }
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
