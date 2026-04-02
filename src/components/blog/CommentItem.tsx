import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import type { CommentWithUser } from '@/db/schemas'

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
          <span className='text-sm font-medium text--(--)'>{comment.user.name}</span>
          <span className='text-xs text--(--)'>
            {new Date(comment.createdAt).toLocaleString()}
          </span>
        </div>
        <p className='text-sm text--(--)'>{comment.content}</p>
        <div className='flex gap-3 mt-2'>
          {currentUserId && onReply && (
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
              className='text-xs text--(--) hover:text-destructive transition-colors'
            >
              Delete
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
