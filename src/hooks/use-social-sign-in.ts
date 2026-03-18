import { useState } from 'react'
import { useLocation } from '@tanstack/react-router'
import { toast } from 'sonner'

import { authClient } from '@/lib/auth-client'
import useLocalStorage, { type AuthProvider } from './use-local-storage'

export function useSocialSignIn() {
  const { pathname } = useLocation()
  const authProviderStorage = useLocalStorage('lastUsedAuthProvider')

  const [pendingProvider, setPendingProvider] = useState<AuthProvider | null>(null)

  async function signIn(provider: AuthProvider) {
    authProviderStorage.set(provider)
    await authClient.signIn.social({
      provider,
      callbackURL: pathname,
      fetchOptions: {
        onRequest: () => setPendingProvider(provider),
        onError: () => {
          setPendingProvider(null)
          toast.error('Failed to sign in. Please try again.')
        },
      },
    })
  }

  return {
    signIn,
    pendingProvider,
    isPending: pendingProvider !== null,
  }
}
