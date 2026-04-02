import { useEffect, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Github, Loader2 } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { GoogleIcon } from '@/components/ui/google-icon'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useSignInDialog } from '@/hooks/use-sign-in-dialog'
import useLocalStorage, { type AuthProvider } from '@/hooks/use-local-storage'
import { useSocialSignIn } from '@/hooks/use-social-sign-in'

export function SignInDialog() {
  const { open, setOpen, closeDialog: closeSignInDialog } = useSignInDialog()
  const { signIn, pendingProvider, isPending } = useSocialSignIn()
  const [lastUsedProvider, setLastUsedProvider] = useState<AuthProvider | undefined>(
    undefined,
  )
  const authProviderStorage = useLocalStorage('lastUsedAuthProvider')

  useEffect(() => {
    setLastUsedProvider(authProviderStorage.value)
  }, [authProviderStorage.value])

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
            onClick={() => signIn('github')}
            disabled={isPending}
            className='relative border-accent bg-background text-foreground hover:bg-primary/60'
          >
            {pendingProvider === 'github' ? (
              <Loader2 className='size-4 animate-spin' />
            ) : (
              <Github className='size-4' />
            )}
            Continue with GitHub
            {lastUsedProvider === 'github' && <LastUsed />}
          </Button>

          <Button
            onClick={() => signIn('google')}
            disabled={isPending}
            className='relative border-accent bg-background text-foreground hover:text-primary-foreground hover:bg-primary/60'
          >
            {pendingProvider === 'google' ? (
              <Loader2 className='size-4 animate-spin' />
            ) : (
              <GoogleIcon className='size-4' />
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
    <Badge variant='outline' className='absolute -top-2 -right-2 p-2 bg-background'>
      Last used
    </Badge>
  )
}
