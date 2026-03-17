import { z } from 'zod'

export const SessionSchema = z.object({
  id: z.string(),
  token: z.string(),
  ipAddress: z.string().nullable(),
  userAgent: z.string().nullable(),
  isCurrentSession: z.boolean(),
  createdAt: z.coerce.date(),
  expiresAt: z.coerce.date(),
})

export const ListSessionsOutputSchema = z.object({
  sessions: z.array(SessionSchema),
})

export const RevokeSessionInputSchema = z.object({
  token: z.string(),
})
