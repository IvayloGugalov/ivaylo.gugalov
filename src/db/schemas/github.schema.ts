import { jsonb, pgTable, text, timestamp } from 'drizzle-orm/pg-core'

export const githubCache = pgTable('github_cache', {
  key: text('key').primaryKey(),
  value: jsonb('value').notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
})
