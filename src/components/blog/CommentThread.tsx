import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '#/store/auth'
import { orpcQuery } from '#/lib/orpc-client'
import { Avatar } from '#/components/ui/Avatar'
import { Button } from '#/components/ui/Button'

interface CommentThreadProps {
  postSlug: string
}

export function CommentThread({ postSlug }: CommentThreadProps) {
  const user = useAuthStore((s) => s.user)
  const queryClient = useQueryClient()
  const [content, setContent] = useState('')
  const [replyTo, setReplyTo] = useState<string | null>(null)

  const { data: comments = [] } = useQuery(
    orpcQuery.comments.getComments.queryOptions({ postSlug })
  )

  const createComment = useMutation({
    ...orpcQuery.comments.createComment.mutationOptions(),
    onSuccess: () => {
      setContent('')
      setReplyTo(null)
      void queryClient.invalidateQueries(
        orpcQuery.comments.getComments.queryOptions({ postSlug })
      )
    },
  })

  const deleteComment = useMutation({
    ...orpcQuery.comments.deleteComment.mutationOptions(),
    onSuccess: () => {
      void queryClient.invalidateQueries(
        orpcQuery.comments.getComments.queryOptions({ postSlug })
      )
    },
  })

  return (
    <section className="mt-16">
      <h2 className="font-[Fraunces] text-2xl font-bold text-[var(--sea-ink)] mb-6">
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
          className="mb-8 space-y-3"
        >
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={replyTo ? 'Write a reply...' : 'Write a comment...'}
            rows={3}
            className="w-full rounded-lg border border-[var(--line)] bg-[var(--surface)] p-3 text-sm text-[var(--sea-ink)] placeholder:text-[var(--sea-ink-soft)] focus:outline-none focus:border-[var(--lagoon)] resize-none"
          />
          <div className="flex gap-2">
            <Button type="submit" disabled={createComment.isPending || !content.trim()}>
              {createComment.isPending ? 'Posting...' : replyTo ? 'Reply' : 'Comment'}
            </Button>
            {replyTo && (
              <Button variant="ghost" type="button" onClick={() => setReplyTo(null)}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      ) : (
        <a
          href="/api/auth/signin/github"
          className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-lg bg-[var(--lagoon)] text-white text-sm font-medium hover:bg-[var(--lagoon-deep)] transition-colors"
        >
          Sign in with GitHub to comment
        </a>
      )}

      <div className="space-y-6">
        {comments.map((comment) => (
          <div key={comment.id} className="space-y-4">
            <CommentItem
              comment={comment}
              currentUserId={user?.id}
              onReply={() => setReplyTo(comment.id)}
              onDelete={() => deleteComment.mutate({ commentId: comment.id })}
            />
            {comment.replies?.map((reply: typeof comment) => (
              <div key={reply.id} className="ml-10">
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
  comment: { id: string; userId: string | null; content: string; createdAt: Date; replies?: unknown[] }
  currentUserId?: string
  onReply?: () => void
  onDelete: () => void
}

function CommentItem({ comment, currentUserId, onReply, onDelete }: CommentItemProps) {
  const isOwn = currentUserId && comment.userId === currentUserId

  return (
    <div className="flex gap-3">
      <Avatar src={null} alt={comment.userId ?? 'User'} size={32} />
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-[var(--sea-ink)]">{comment.userId ?? '[deleted]'}</span>
          <span className="text-xs text-[var(--sea-ink-soft)]">
            {new Date(comment.createdAt).toLocaleDateString()}
          </span>
        </div>
        <p className="text-sm text-[var(--sea-ink)]">{comment.content}</p>
        <div className="flex gap-3 mt-2">
          {onReply && (
            <button onClick={onReply} className="text-xs text-[var(--sea-ink-soft)] hover:text-[var(--lagoon)] transition-colors">
              Reply
            </button>
          )}
          {isOwn && (
            <button onClick={onDelete} className="text-xs text-[var(--sea-ink-soft)] hover:text-red-500 transition-colors">
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
