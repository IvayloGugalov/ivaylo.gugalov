import { usePostHog } from '@posthog/react'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'

import { authClient } from '@/lib/auth-client'
import { useAuthStore } from '@/store/auth'

type UseSignOutOptions = {
  redirectTo: string
}

export function useSignOut(options: UseSignOutOptions) {
  const navigate = useNavigate()
  const posthog = usePostHog()
  const setUser = useAuthStore((s) => s.setUser)

  const { redirectTo } = options

  return async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          setUser(null)
          posthog?.reset()
          navigate({ to: redirectTo })
          toast.success('Successfully signed out!')
        },
        onError: () => {
          toast.error('Unable to sign out!')
        },
      },
    })
  }
}
