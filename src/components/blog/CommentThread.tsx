import { useState, useEffect } from 'react'

import { useAuthStore } from '@/store/auth'
import {
  useListComments,
  useCreateComment,
  useDeleteComment,
} from '@/hooks/queries/comment.query'
import { useSignInDialog } from '@/hooks/use-sign-in-dialog'
import { Button } from '@/components/ui/button'
import CommentItem from './CommentItem'

interface CommentThreadProps {
  postSlug: string
}

export function CommentThread({ postSlug }: CommentThreadProps) {
  const user = useAuthStore((s) => s.user)
  const { openDialog } = useSignInDialog()
  const storageKey = `pending-comment-${postSlug}`
  const [content, setContent] = useState('')
  const [replyTo, setReplyTo] = useState<string | null>(null)

  useEffect(() => {
    const stored = sessionStorage.getItem(storageKey)
    if (stored) setContent(stored)
  }, [storageKey])

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useListComments(
    (pageParam) => ({
      postSlug,
      cursor: pageParam,
    }),
  )

  const comments = data?.pages.flatMap((p) => p.items) ?? []
  const createComment = useCreateComment(postSlug, () => {
    setContent('')
    sessionStorage.removeItem(storageKey)
    setReplyTo(null)
  })
  const deleteComment = useDeleteComment(postSlug)

  return (
    <section className='mt-16'>
      <h2 className='font-[Fraunces] text-2xl font-bold text--(--) mb-6'>
        Comments ({comments.length})
      </h2>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (!content.trim()) return
          if (!user) {
            openDialog()
            return
          }
          createComment.mutate({
            postSlug,
            content: content.trim(),
            parentId: replyTo ?? undefined,
          })
        }}
        className='mb-8 space-y-3'
      >
        <textarea
          value={content}
          onChange={(e) => {
            setContent(e.target.value)
            if (e.target.value) {
              sessionStorage.setItem(storageKey, e.target.value)
            } else {
              sessionStorage.removeItem(storageKey)
            }
          }}
          placeholder={replyTo ? 'Write a reply...' : 'Write a comment...'}
          rows={3}
          className='w-full rounded-lg border border--(--) bg-accent p-3 text-sm text--(--) placeholder:text--(--) focus:outline-none focus:border--(--) resize-none'
        />
        <div className='flex gap-2'>
          <Button type='submit' disabled={createComment.isPending || !content.trim()}>
            {createComment.isPending ? 'Posting...' : replyTo ? 'Reply' : 'Comment'}
          </Button>
          {replyTo && (
            <Button variant='ghost' type='button' onClick={() => setReplyTo(null)}>
              Cancel
            </Button>
          )}
        </div>
      </form>

      <div className='space-y-6'>
        {comments.map((comment) => (
          <div key={comment.id} className='space-y-4'>
            <CommentItem
              comment={comment}
              currentUserId={user?.id}
              onReply={() => setReplyTo(comment.id)}
              onDelete={() => deleteComment.mutate({ commentId: comment.id })}
            />
            {comment.replies?.map((reply) => (
              <div key={reply.id} className='ml-10'>
                <CommentItem
                  comment={reply}
                  currentUserId={user?.id}
                  onDelete={() => deleteComment.mutate({ commentId: reply.id })}
                />
              </div>
            ))}
          </div>
        ))}
      </div>

      {hasNextPage && (
        <Button
          type='button'
          variant='ghost'
          className='mt-4'
          disabled={isFetchingNextPage}
          onClick={() => void fetchNextPage()}
        >
          {isFetchingNextPage ? 'Loading...' : 'Load more comments'}
        </Button>
      )}
    </section>
  )
}
