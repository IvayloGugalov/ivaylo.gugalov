import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import type { CommentWithUser } from '@/db/schemas'
import * as m from '../../paraglide/messages'

interface CommentItemProps {
  comment: CommentWithUser
  currentUserId?: string
  onReply?: () => void
  onDelete: () => void
}

export default function CommentItem({
  comment,
  currentUserId,
  onReply,
  onDelete,
}: CommentItemProps) {
  const isOwn = currentUserId && comment.userId === currentUserId

  return (
    <div className='flex gap-3 items-start'>
      <Avatar src={comment.user.image} alt={comment.userId ?? 'User'} size={32} />
      <div className='flex-1'>
        <div className='flex items-center gap-2 mb-1'>
          <span className='text-sm font-medium text-text-primary'>{comment.user.name}</span>
          <span className='text-xs text-text-muted'>
            {new Date(comment.createdAt).toLocaleString()}
          </span>
        </div>
        <p className='text-sm text-text-secondary'>{comment.content}</p>
        <div className='flex gap-3 mt-2'>
          {currentUserId && onReply && (
            <Button
              type='button'
              onClick={onReply}
              className='text-xs text-text-muted hover:text-accent-primary transition-colors'
            >
              {m.blog_comment_reply()}
            </Button>
          )}
          {isOwn && (
            <Button
              type='button'
              onClick={onDelete}
              className='text-xs text-text-muted hover:text-destructive transition-colors'
            >
              {m.blog_comment_delete()}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
