import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

export const env = createEnv({
  clientPrefix: 'VITE_PUBLIC_',
  server: {
    DATABASE_URL: z.url(),
    BETTER_AUTH_SECRET: z.string().min(32),
    BETTER_AUTH_URL: z.url().default('http://localhost:3000'),
    GITHUB_CLIENT_ID: z.string().min(1),
    GITHUB_CLIENT_SECRET: z.string().min(1),
    GITHUB_TOKEN: z.string().optional(),
  },
  client: {
    VITE_PUBLIC_POSTHOG_KEY: z.string().min(1),
    VITE_PUBLIC_POSTHOG_HOST: z.url(),
  },
  runtimeEnv: {
    ...process.env,
    VITE_PUBLIC_POSTHOG_KEY: import.meta.env.VITE_PUBLIC_POSTHOG_KEY,
    VITE_PUBLIC_POSTHOG_HOST: import.meta.env.VITE_PUBLIC_POSTHOG_HOST,
  },
})
