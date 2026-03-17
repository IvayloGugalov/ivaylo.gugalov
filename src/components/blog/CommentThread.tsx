import { useState } from 'react'
import { useAuthStore } from '@/store/auth'
import { authClient } from '@/lib/auth-client'
import {
  useGetComments,
  useCreateComment,
  useDeleteComment,
} from '@/hooks/queries/comments'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'

interface CommentThreadProps {
  postSlug: string
}

export function CommentThread({ postSlug }: CommentThreadProps) {
  const user = useAuthStore((s) => s.user)
  const [content, setContent] = useState('')
  const [replyTo, setReplyTo] = useState<string | null>(null)

  const { data: comments = [] } = useGetComments(postSlug)
  const createComment = useCreateComment(postSlug, () => {
    setContent('')
    setReplyTo(null)
  })
  const deleteComment = useDeleteComment(postSlug)

  return (
    <section className='mt-16'>
      <h2 className='font-[Fraunces] text-2xl font-bold text--(--) mb-6'>
        Comments ({comments.length})
      </h2>

      {user ? (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (!content.trim()) return
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
            onChange={(e) => setContent(e.target.value)}
            placeholder={replyTo ? 'Write a reply...' : 'Write a comment...'}
            rows={3}
            className='w-full rounded-lg border border--(--) bg--(--) p-3 text-sm text--(--) placeholder:text--(--) focus:outline-none focus:border--(--) resize-none'
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
      ) : (
        <button
          type='button'
          onClick={() =>
            authClient.signIn.social({
              provider: 'github',
              callbackURL: window.location.pathname,
            })
          }
          className='inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-lg bg--(--) text-white text-sm font-medium hover:bg--(--) transition-colors'
        >
          Sign in with GitHub to comment
        </button>
      )}

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
    </section>
  )
}

interface CommentItemProps {
  comment: {
    id: string
    userId: string | null
    content: string
    createdAt: Date
    replies?: unknown[]
  }
  currentUserId?: string
  onReply?: () => void
  onDelete: () => void
}

function CommentItem({ comment, currentUserId, onReply, onDelete }: CommentItemProps) {
  const isOwn = currentUserId && comment.userId === currentUserId

  return (
    <div className='flex gap-3'>
      <Avatar src={null} alt={comment.userId ?? 'User'} size={32} />
      <div className='flex-1'>
        <div className='flex items-center gap-2 mb-1'>
          <span className='text-sm font-medium text--(--)'>
            {comment.userId ?? '[deleted]'}
          </span>
          <span className='text-xs text--(--)'>
            {new Date(comment.createdAt).toLocaleDateString()}
          </span>
        </div>
        <p className='text-sm text--(--)'>{comment.content}</p>
        <div className='flex gap-3 mt-2'>
          {onReply && (
            <button
              type='button'
              onClick={onReply}
              className='text-xs text--(--) hover:text--(--) transition-colors'
            >
              Reply
            </button>
          )}
          {isOwn && (
            <button
              type='button'
              onClick={onDelete}
              className='text-xs text--(--) hover:text-red-500 transition-colors'
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
