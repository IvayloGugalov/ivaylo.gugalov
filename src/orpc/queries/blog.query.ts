import { useSuspenseQuery } from '@tanstack/react-query'
import { orpc } from '../client'

export function useListPosts() {
  return useSuspenseQuery(orpc.blog.getPosts.queryOptions())
}
