import { useMutation, useSuspenseQuery } from '@tanstack/react-query'
import { orpc } from '@/orpc/client'

export function useGetPost(slug: string) {
  return useSuspenseQuery(
    orpc.blog.getPost.queryOptions({ input: { slug }, staleTime: 60 * 60_000 }),
  )
}

export function useGetPostMeta(slug: string) {
  return useSuspenseQuery(
    orpc.blog.getPostMeta.queryOptions({ input: { slug }, staleTime: 60 * 60_000 }),
  )
}

export function useIncrementViews() {
  return useMutation(orpc.blog.incrementViews.mutationOptions())
}
