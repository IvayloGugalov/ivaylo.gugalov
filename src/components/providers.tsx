import posthog from 'posthog-js'
import { PostHogProvider } from '@posthog/react'
import { env } from '@/env'

if (typeof window !== 'undefined') {
  posthog.init(env.VITE_PUBLIC_POSTHOG_KEY, {
    api_host: env.VITE_PUBLIC_POSTHOG_HOST,
    defaults: '2026-01-30',
  })
}

export function Providers({ children }: { children: React.ReactNode }) {
  return <PostHogProvider client={posthog}>{children}</PostHogProvider>
}
