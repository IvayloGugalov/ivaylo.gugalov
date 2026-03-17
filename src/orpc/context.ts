import { auth } from '@/lib/auth'
import { db } from '@/db/client'

export async function createORPCContext(headers: Headers) {
  const session = await auth.api.getSession({ headers })
  return { session, db, headers }
}

export type Context = Awaited<ReturnType<typeof createORPCContext>>
