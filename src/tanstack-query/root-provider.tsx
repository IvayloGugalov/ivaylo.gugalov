import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { makeQueryClient } from './query-client'

export function getContext() {
  const queryClient = makeQueryClient()
  return {
    queryClient,
  }
}

export function Provider({
  children,
  queryClient,
}: {
  children: React.ReactNode
  queryClient: QueryClient
}) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
