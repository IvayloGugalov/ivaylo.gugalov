import { useAuthStore } from '@/store/auth'
import {
  useGetReactions,
  useAddReaction,
  useDeleteReaction,
  usePendingReactions,
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
  const pendingReactions = usePendingReactions()

  const reactionMap = new Map(reactions.map((r) => [r.emoji, r]))
  const isPending = addReaction.isPending || deleteReaction.isPending

  // Build optimistic count overlay: +1 per pending addReaction for this target
  const pendingCountMap = new Map<string, number>()
  for (const pending of pendingReactions) {
    if (pending.targetId === targetId && pending.targetType === targetType) {
      pendingCountMap.set(pending.emoji, (pendingCountMap.get(pending.emoji) ?? 0) + 1)
    }
  }

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
        const confirmedCount = reaction?.count ?? 0
        const pendingCount = pendingCountMap.get(emoji) ?? 0
        const displayCount = confirmedCount + pendingCount
        const active = !!reaction?.reactionId
        const hasPending = pendingCount > 0

        return (
          <Button
            key={emoji}
            type='button'
            variant='ghost'
            disabled={isPending}
            title={user ? `React with ${emoji}` : 'Sign in to react'}
            aria-label={`React with ${emoji}${displayCount > 0 ? ` (${displayCount})` : ''}`}
            onClick={() => handleClick(emoji)}
            className={[
              'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm border transition-colors cursor-pointer',
              'disabled:opacity-40 disabled:cursor-not-allowed',
              active
                ? 'border-accent-glow bg-accent-primary/10 text-accent-primary hover:bg-accent-primary/20 hover:text-accent-primary'
                : 'border-border text-text-secondary hover:border-accent-glow hover:bg-surface hover:text-text-primary',
            ].join(' ')}
          >
            <span>{emoji}</span>
            {displayCount > 0 && (
              <span
                className={[
                  'text-xs font-medium tabular-nums transition-opacity',
                  hasPending ? 'opacity-60' : '',
                ].join(' ')}
              >
                {displayCount}
              </span>
            )}
          </Button>
        )
      })}
    </div>
  )
}
