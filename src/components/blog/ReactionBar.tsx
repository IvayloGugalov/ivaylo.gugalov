import { useAuthStore } from '@/store/auth'
import {
  useGetReactions,
  useAddReaction,
  useDeleteReaction,
} from '@/hooks/queries/comment.query'
import { useSignInDialog } from '@/hooks/use-sign-in-dialog'
import { Button } from '@/components/ui/button'

const EMOJI_OPTIONS = ['👍', '❤️', '🔥', '🤔', '👀']

interface ReactionBarProps {
  targetId: string
  targetType: 'post' | 'comment'
}

export function ReactionBar({ targetId, targetType }: ReactionBarProps) {
  const user = useAuthStore((s) => s.user)
  const { openDialog } = useSignInDialog()
  const { data: reactions = [] } = useGetReactions(targetId, targetType)
  const addReaction = useAddReaction(targetId, targetType)
  const deleteReaction = useDeleteReaction(targetId, targetType)

  const reactionMap = new Map(reactions.map((r) => [r.emoji, r]))
  const isPending = addReaction.isPending || deleteReaction.isPending

  function handleClick(emoji: string) {
    if (!user) {
      openDialog()
      return
    }
    const existing = reactionMap.get(emoji)
    if (existing?.reactionId) {
      deleteReaction.mutate({ reactionId: existing.reactionId })
    } else {
      addReaction.mutate({ targetId, targetType, emoji })
    }
  }

  return (
    <div className='flex gap-2 flex-wrap'>
      {EMOJI_OPTIONS.map((emoji) => {
        const reaction = reactionMap.get(emoji)
        const count = reaction?.count ?? 0
        const active = !!reaction?.reactionId

        return (
          <Button
            key={emoji}
            type='button'
            disabled={isPending}
            title={user ? `React with ${emoji}` : 'Sign in to react'}
            onClick={() => handleClick(emoji)}
            className={[
              'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm border transition-colors',
              'disabled:opacity-40 disabled:cursor-not-allowed',
              active
                ? 'border-accent-glow bg-accent-primary/10 text-accent-primary'
                : 'border-border hover:border-accent-glow hover:bg-surface',
            ].join(' ')}
          >
            <span>{emoji}</span>
            {count > 0 && (
              <span className='text-xs font-medium tabular-nums'>{count}</span>
            )}
          </Button>
        )
      })}
    </div>
  )
}
