import { os } from '@orpc/server'
import { auth, type Session, type User } from './auth'

// Base procedure — all procedures start here
export const baseProcedure = os

// Public procedure — no auth required
export const publicProcedure = baseProcedure

// Protected procedure — throws UNAUTHORIZED if no valid session
export const requireAuth = baseProcedure.use(
  async ({ context, next }) => {
    const headers = (context as { headers?: Headers }).headers
    if (!headers) throw new Error('UNAUTHORIZED')

    const session = await auth.api.getSession({ headers })
    if (!session?.user) throw new Error('UNAUTHORIZED')

    return next({
      context: {
        ...(context as object),
        session: session as Session,
        user: session.user as User,
      },
    })
  }
)
