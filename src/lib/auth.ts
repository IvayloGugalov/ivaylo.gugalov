import { betterAuth } from 'better-auth'
import { createAuthMiddleware } from 'better-auth/api'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'

import { db } from '@/db/client'
import { env } from '@/env'
import { getPostHogServer } from './posthog'

export const auth = betterAuth({
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, {
    provider: 'pg',
    usePlural: true,
  }),
  socialProviders: {
    github: {
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
    },
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,
    },
  },
  user: {
    additionalFields: {
      role: { type: 'string', required: true, input: false, defaultValue: 'user' },
    },
  },
  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      const { newSession } = ctx.context
      if (ctx.path.startsWith('/callback/') && newSession) {
        const posthog = getPostHogServer()
        posthog.identify({
          distinctId: newSession.user.id,
          properties: {
            email: newSession.user.email,
            name: newSession.user.name,
          },
        })
      }
    }),
  },
})

export type Session = typeof auth.$Infer.Session
export type User = typeof auth.$Infer.Session.user
