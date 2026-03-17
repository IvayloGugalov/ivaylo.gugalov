import { ORPCError } from '@orpc/server'
import { APIError } from 'better-auth'

import { auth } from '@/lib/auth'
import { protectedProcedure, publicProcedure } from '@/orpc/procedures'

import {
  ListSessionsOutputSchema,
  RevokeSessionInputSchema,
} from '../schemas/auth.schema'

const me = publicProcedure.handler(async ({ context }) => {
  const headers = (context as { headers?: Headers }).headers
  if (!headers) return { user: null }
  const session = await auth.api.getSession({ headers })
  return { user: session?.user ?? null }
})

const listSessions = protectedProcedure
  .output(ListSessionsOutputSchema)
  .handler(async ({ context }) => {
    const { headers } = context as typeof context & { headers: Headers }
    const sessions = await auth.api.listSessions({ headers })

    return {
      sessions: sessions.map((session) => ({
        id: session.id,
        token: session.token,
        ipAddress: (session.ipAddress ?? '') || null,
        userAgent: (session.userAgent ?? '') || null,
        isCurrentSession: session.id === context.session?.session.id,
        createdAt: session.createdAt,
        expiresAt: session.expiresAt,
      })),
    }
  })

const revokeSession = protectedProcedure
  .input(RevokeSessionInputSchema)
  .handler(async ({ input, context }) => {
    const { headers } = context as typeof context & { headers: Headers }
    try {
      await auth.api.revokeSession({
        headers,
        body: { token: input.token },
      })
      return {}
    } catch (error) {
      if (error instanceof APIError) {
        if (error.status === 'UNAUTHORIZED') throw new ORPCError('UNAUTHORIZED')
        if (error.status === 'BAD_REQUEST') throw new ORPCError('BAD_REQUEST')
      }
      throw new ORPCError('INTERNAL_SERVER_ERROR')
    }
  })

export const authRouter = {
  me,
  session: {
    list: listSessions,
    revoke: revokeSession,
  },
}
