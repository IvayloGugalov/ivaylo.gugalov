import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useAdminPosts } from '@/orpc/queries/admin.query'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/admin/posts')({
  component: AdminPosts,
})

const PAGE_SIZE = 20

function AdminPosts() {
  const [offset, setOffset] = useState(0)
  const { data: posts, isLoading, isError } = useAdminPosts({ limit: PAGE_SIZE, offset })

  const hasPrev = offset > 0
  const hasNext = (posts?.length ?? 0) === PAGE_SIZE

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Posts</h1>

      {isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 animate-pulse rounded bg-muted" />
          ))}
        </div>
      )}

      {isError && (
        <div className="rounded border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
          Failed to load posts. Please try again.
        </div>
      )}

      {!isLoading && !isError && posts && (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead className="text-right">Views</TableHead>
                <TableHead className="text-right">Comments</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.map((post) => (
                <TableRow key={post.slug}>
                  <TableCell className="font-medium">{post.title || '—'}</TableCell>
                  <TableCell className="text-muted-foreground font-mono text-xs">{post.slug}</TableCell>
                  <TableCell className="text-right">{post.views.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{post.commentCount}</TableCell>
                  <TableCell className="text-muted-foreground">{new Date(post.createdAt).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
              {posts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">No posts found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" size="sm" disabled={!hasPrev} onClick={() => setOffset((o) => Math.max(0, o - PAGE_SIZE))}>
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              {offset + 1}–{offset + (posts?.length ?? 0)}
            </span>
            <Button variant="outline" size="sm" disabled={!hasNext} onClick={() => setOffset((o) => o + PAGE_SIZE)}>
              Next
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
