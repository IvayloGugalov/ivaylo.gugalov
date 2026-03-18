import { useEffect, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { LucideGithub, Globe, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useLocation } from '@tanstack/react-router'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useSignInDialog } from '@/hooks/use-sign-in-dialog'
import useLocalStorage, { type AuthProvider } from '@/hooks/useLocalStorage'
import { authClient } from '@/lib/auth-client'

export function SignInDialog() {
  const { pathname } = useLocation()
  const { open, setOpen, closeDialog: closeSignInDialog } = useSignInDialog()
  const [isPending, setIsPending] = useState(false)
  const [lastUsedProvider, setLastUsedProvider] = useState<AuthProvider | undefined>(
    undefined,
  )
  const authProviderStorage = useLocalStorage('lastUsedAuthProvider')

  useEffect(() => {
    setLastUsedProvider(authProviderStorage.value)
  }, [authProviderStorage.value])

  async function handleSignIn(provider: AuthProvider) {
    authProviderStorage.set(provider)
    await authClient.signIn.social({
      provider,
      callbackURL: pathname,
      fetchOptions: {
        onRequest: () => setIsPending(true),
        onSuccess: () => setIsPending(false),
        onError: () => {
          setIsPending(false)
          toast.error('Failed to sign in. Please try again.')
        },
      },
    })
  }

  function closeDialog() {
    if (!isPending) closeSignInDialog()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className='sm:max-w-120'>
        <DialogHeader>
          <DialogTitle className='text-left text-2xl'>Sign in</DialogTitle>
          <DialogDescription className='text-left'>
            Choose a provider to sign in to your account.
          </DialogDescription>
        </DialogHeader>
        <div className='my-6 flex flex-col gap-4'>
          <Button
            className='relative'
            size='lg'
            onClick={() => handleSignIn('github')}
            disabled={isPending}
            data-testid='github-sign-in-button'
          >
            {isPending ? (
              <Loader2 className='size-4 animate-spin' />
            ) : (
              <LucideGithub className='size-4' />
            )}
            Continue with GitHub
            {lastUsedProvider === 'github' && <LastUsed />}
          </Button>
          <Button
            className='relative border-border'
            size='lg'
            variant='ghost'
            onClick={() => handleSignIn('google')}
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className='size-4 animate-spin' />
            ) : (
              <Globe className='size-4' />
            )}
            Continue with Google
            {lastUsedProvider === 'google' && <LastUsed />}
          </Button>
        </div>
        <div className='text-center text-xs text-muted-foreground'>
          By continuing, you agree to our{' '}
          <Link to='/' className='text-foreground underline' onClick={closeDialog}>
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link to='/' className='text-foreground underline' onClick={closeDialog}>
            Privacy Policy
          </Link>
          .
        </div>
      </DialogContent>
    </Dialog>
  )
}

function LastUsed() {
  return (
    <Badge variant='outline' className='absolute -top-2 -right-2 bg-background'>
      Last used
    </Badge>
  )
}
