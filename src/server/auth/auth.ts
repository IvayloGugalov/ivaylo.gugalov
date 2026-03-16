import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { db } from '#/server/db/client'

if (!process.env.BETTER_AUTH_SECRET) {
  throw new Error('BETTER_AUTH_SECRET environment variable is not set')
}

export const auth = betterAuth({
  // Better Auth uses BETTER_AUTH_URL env var by convention
  baseURL: process.env.BETTER_AUTH_URL ?? 'http://localhost:3000',
  secret: process.env.BETTER_AUTH_SECRET!,
  database: drizzleAdapter(db, {
    provider: 'pg',
    usePlural: true,
  }),
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutes client-side cache
    },
  },
})

export type Session = typeof auth.$Infer.Session
export type User = typeof auth.$Infer.Session.user
