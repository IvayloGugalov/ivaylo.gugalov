import { os } from '@orpc/server'
import { auth } from './auth'
import { publicProcedure, requireAuth } from './middleware'

export const authRouter = os.router({
  // Returns current session user or null — public
  me: publicProcedure.handler(async ({ context }) => {
    const headers = (context as { headers?: Headers }).headers
    if (!headers) return { user: null }
    const session = await auth.api.getSession({ headers })
    return { user: session?.user ?? null }
  }),

  // Invalidates current session — protected
  // Better Auth's server-side sign-out: use signOut via the API handler
  logout: requireAuth.handler(async ({ context }) => {
    const headers = (context as { headers: Headers }).headers
    // Revoke the current session server-side
    await auth.api.revokeSession({ headers })
    return { success: true }
  }),
})
