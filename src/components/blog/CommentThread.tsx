import { useState } from 'react'
import { Github, Loader2 } from 'lucide-react'

import { useAuthStore } from '@/store/auth'
import {
  useGetComments,
  useCreateComment,
  useDeleteComment,
} from '@/hooks/queries/comments'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { GoogleIcon } from '@/components/ui/google-icon'
import { useSocialSignIn } from '@/hooks/use-social-sign-in'

interface CommentThreadProps {
  postSlug: string
}

export function CommentThread({ postSlug }: CommentThreadProps) {
  const user = useAuthStore((s) => s.user)
  const { signIn, pendingProvider, isPending } = useSocialSignIn()
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
        <div className='my-6 flex flex-col gap-1 max-w-2xs'>
          <Button
            onClick={() => signIn('github')}
            disabled={isPending}
            className='inline-flex items-center gap-2  px-4 py-2 rounded-lg'
          >
            {pendingProvider === 'github' ? (
              <Loader2 className='size-4 animate-spin' />
            ) : (
              <Github className='size-4' />
            )}
            Continue with GitHub
          </Button>

          <Button
            onClick={() => signIn('google')}
            disabled={isPending}
            className='inline-flex items-center gap-2  px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500'
          >
            {pendingProvider === 'google' ? (
              <Loader2 className='size-4 animate-spin' />
            ) : (
              <GoogleIcon className='size-4' />
            )}
            Continue with Google
          </Button>
        </div>
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
            <Button
              type='button'
              onClick={onReply}
              className='text-xs text--(--) hover:text--(--) transition-colors'
            >
              Reply
            </Button>
          )}
          {isOwn && (
            <Button
              type='button'
              onClick={onDelete}
              className='text-xs text--(--) hover:text-red-500 transition-colors'
            >
              Delete
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
