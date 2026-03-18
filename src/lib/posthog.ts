import { PostHog } from 'posthog-node'

import { env } from '@/env'

let posthogInstance: PostHog | null = null

export function getPostHogServer() {
  if (!env.VITE_PUBLIC_POSTHOG_KEY) {
    throw new Error('POSTHOG_KEY is not set')
  }

  posthogInstance ??= new PostHog(env.VITE_PUBLIC_POSTHOG_KEY, {
    host: env.VITE_PUBLIC_POSTHOG_HOST,
    flushAt: 1,
    flushInterval: 0,
  })

  return posthogInstance
}
