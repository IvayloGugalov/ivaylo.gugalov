import { queryOptions, useMutation, useSuspenseQuery } from '@tanstack/react-query'
import { orpc } from '@/orpc/client'
import { getBlogPostPage } from '@/server/blog-post-page'

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

export const postPageQueryOptions = (slug: string) =>
  queryOptions({
    queryKey: ['blog-page-rsc', slug],
    // data cast: this version of react-start infers input as undefined without .validator()
    queryFn: () => getBlogPostPage({ data: { slug } } as never),
    // Flight payloads are opaque objects — React Query must not attempt to merge them.
    structuralSharing: false,
    staleTime: 60 * 60_000,
  })
