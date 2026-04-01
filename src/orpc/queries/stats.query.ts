import { useSuspenseQuery } from '@tanstack/react-query'

import { orpc } from '../client'

export function useGithubStats() {
  return useSuspenseQuery(orpc.github.stats.queryOptions({ refetchOnWindowFocus: false }))
}

export function useGithubRepos() {
  return useSuspenseQuery(orpc.github.repos.queryOptions({ refetchOnWindowFocus: false }))
}
