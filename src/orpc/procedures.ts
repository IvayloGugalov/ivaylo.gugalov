import { ORPCError, os } from '@orpc/server'
import z from 'zod'
import type { Context } from './context'

import { apiRatelimit } from '@/lib/rate-limiter'

export class TraceableError extends Error {
  public context: Record<string, unknown>

  constructor(message: string, context: Record<string, unknown> = {}) {
    super(message)
    this.name = 'TraceableError'
    this.context = context
  }
}

function getIp(headers: Headers | undefined): string {
  return (
    headers?.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    headers?.get('x-real-ip') ??
    'unknown'
  )
}

export const base = os.$context<Context>()

const rateLimitMiddleware = base.middleware(async ({ path, context, next }) => {
  const headers = (context as { headers?: Headers }).headers
  const ip = getIp(headers)
  const identifier = `${path.join(':')}:${ip}`
  const { allowed } = apiRatelimit.check(identifier)

  if (!allowed) throw new ORPCError('TOO_MANY_REQUESTS')

  return next({ context })
})

const authMiddleware = base.middleware(async ({ context, next }) => {
  if (!context.session?.user) throw new ORPCError('UNAUTHORIZED')

  return next({ context })
})

const errorMiddleware = base.middleware(async ({ path, next }) => {
  try {
    return await next()
  } catch (error) {
    console.error(error)

    let metadata: Record<string, unknown> = { path: path.join(':') }

    if (error instanceof TraceableError) {
      metadata = { ...metadata, ...error.context }
    } else if (error instanceof z.ZodError) {
      metadata.validationIssues = z.flattenError(error)
    }

    throw error
  }
})

export const publicProcedure = base.use(rateLimitMiddleware).use(errorMiddleware)
export const protectedProcedure = publicProcedure.use(authMiddleware)
export const adminProcedure = protectedProcedure.use(async ({ context, next }) => {
  if (context.session?.user.role !== 'admin') {
    throw new ORPCError('FORBIDDEN')
  }

  return next({ context })
})
