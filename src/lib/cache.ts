import type { z } from 'zod'
import { eq } from 'drizzle-orm'
import type { GithubStatsOutputSchema } from '@/orpc/schemas/github.schema'
import { db } from '@/db/client'
import { githubCache } from '@/db/schemas'

type GithubStats = z.infer<typeof GithubStatsOutputSchema>

const TTL_MS = 60 * 60 * 1000 // 1 hour

function createNamespace<T>(namespace: string) {
  return {
    get: async (key: string): Promise<T | null> => {
      const [entry] = await db
        .select()
        .from(githubCache)
        .where(eq(githubCache.key, `${namespace}:${key}`))

      if (!entry) return null
      if (new Date() > entry.expiresAt) {
        await db.delete(githubCache).where(eq(githubCache.key, `${namespace}:${key}`))
        return null
      }

      return entry.value as T
    },
    set: async (key: string, value: T, ttlMs = TTL_MS): Promise<void> => {
      const expiresAt = new Date(Date.now() + ttlMs)
      await db
        .insert(githubCache)
        .values({ key: `${namespace}:${key}`, value, expiresAt })
        .onConflictDoUpdate({
          target: githubCache.key,
          set: { value, expiresAt },
        })
    },
  }
}

export const cache = {
  github: createNamespace<GithubStats>('github'),
}
