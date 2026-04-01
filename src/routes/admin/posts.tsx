import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useAdminPosts } from '@/orpc/queries/admin.query'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { orpc } from '@/orpc/client'

const PAGE_SIZE = 20

export const Route = createFileRoute('/admin/posts')({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(
      orpc.admin.posts.queryOptions({ input: { limit: PAGE_SIZE, offset: 0 } }),
    ),
  pendingComponent: AdminPostsSkeleton,
  component: AdminPosts,
})

function AdminPostsSkeleton() {
  return (
    <div className='space-y-4'>
      <div className='h-8 w-16 animate-pulse rounded-md bg-muted' />
      <div className='space-y-2'>
        {Array.from({ length: 5 }).map((_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton rows, never reordered
          <div key={i} className='h-10 animate-pulse rounded bg-muted' />
        ))}
      </div>
    </div>
  )
}

function AdminPosts() {
  const [offset, setOffset] = useState(0)
  const { data: posts } = useAdminPosts({ limit: PAGE_SIZE, offset })

  const hasPrev = offset > 0
  const hasNext = posts.length === PAGE_SIZE

  return (
    <div className='space-y-4'>
      <h1 className='text-2xl font-bold'>Posts</h1>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead className='text-right'>Views</TableHead>
            <TableHead className='text-right'>Comments</TableHead>
            <TableHead>Created</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {posts.map((post) => (
            <TableRow key={post.slug}>
              <TableCell className='font-medium'>{post.title || '—'}</TableCell>
              <TableCell className='text-muted-foreground font-mono text-xs'>
                {post.slug}
              </TableCell>
              <TableCell className='text-right'>{post.views.toLocaleString()}</TableCell>
              <TableCell className='text-right'>{post.commentCount}</TableCell>
              <TableCell className='text-muted-foreground'>
                {new Date(post.createdAt).toLocaleDateString()}
              </TableCell>
            </TableRow>
          ))}
          {posts.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className='text-center text-muted-foreground'>
                No posts found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Pagination */}
      <div className='flex items-center justify-end gap-2'>
        <Button
          variant='outline'
          size='sm'
          disabled={!hasPrev}
          onClick={() => setOffset((o) => Math.max(0, o - PAGE_SIZE))}
        >
          Previous
        </Button>
        {posts.length > 0 ? (
          <span className='text-sm text-muted-foreground'>
            {offset + 1}–{offset + posts.length}
          </span>
        ) : (
          <span className='text-sm text-muted-foreground'>No results</span>
        )}
        <Button
          variant='outline'
          size='sm'
          disabled={!hasNext}
          onClick={() => setOffset((o) => o + PAGE_SIZE)}
        >
          Next
        </Button>
      </div>
    </div>
  )
}
