import { integer, pgTable, text } from 'drizzle-orm/pg-core'

export const postsMeta = pgTable('posts_meta', {
  slug: text('slug').primaryKey(),
  views: integer('views').notNull().default(0),
})
