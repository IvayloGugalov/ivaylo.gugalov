import { useAuthStore } from '#/store/auth'
import { orpcQuery } from '#/lib/orpc-client'
import { useMutation } from '@tanstack/react-query'

const EMOJI_OPTIONS = ['👍', '❤️', '🔥', '🤔', '👀']

interface ReactionBarProps {
  targetId: string
  targetType: 'post' | 'comment'
}

export function ReactionBar({ targetId, targetType }: ReactionBarProps) {
  const user = useAuthStore((s) => s.user)

  const addReaction = useMutation(orpcQuery.comments.addReaction.mutationOptions())

  return (
    <div className="flex gap-2 flex-wrap">
      {EMOJI_OPTIONS.map((emoji) => (
        <button
          key={emoji}
          type="button"
          disabled={!user || addReaction.isPending}
          title={user ? `React with ${emoji}` : 'Sign in to react'}
          onClick={() => addReaction.mutate({ targetId, targetType, emoji })}
          className="px-2.5 py-1 rounded-full text-sm border border-[var(--line)] hover:border-[var(--lagoon)] hover:bg-[var(--surface)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {emoji}
        </button>
      ))}
    </div>
  )
}
