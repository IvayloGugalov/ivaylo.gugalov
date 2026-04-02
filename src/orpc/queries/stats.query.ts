import { useSuspenseQuery } from '@tanstack/react-query'

import { orpc } from '../client'

export function useGithubStats() {
  return useSuspenseQuery(
    orpc.github.stats.queryOptions({ staleTime: 60 * 60_000, refetchOnWindowFocus: false }),
  )
}

export function useGithubRepos() {
  return useSuspenseQuery(
    orpc.github.repos.queryOptions({ staleTime: 60 * 60_000, refetchOnWindowFocus: false }),
  )
}
