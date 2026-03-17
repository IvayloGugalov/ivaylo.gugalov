import { useMutation, useSuspenseQuery } from '@tanstack/react-query'
import { orpc } from '#/orpc/client'

export function useGetPost(slug: string) {
  return useSuspenseQuery(orpc.blog.getPost.queryOptions({ input: { slug } }))
}

export function useGetPostMeta(slug: string) {
  return useSuspenseQuery(orpc.blog.getPostMeta.queryOptions({ input: { slug } }))
}

export function useIncrementViews() {
  return useMutation(orpc.blog.incrementViews.mutationOptions())
}
