import { useQuery } from '@tanstack/react-query'

import { orpc } from '../client'

export function useGithubStats() {
  return useQuery(orpc.github.stats.queryOptions({ refetchOnWindowFocus: false }))
}
