import { integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'

export const postsMeta = pgTable('posts_meta', {
  slug: text('slug').primaryKey(),
  views: integer('views').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const insertPostsMetaSchema = createInsertSchema(postsMeta)
export const selectPostsMetaSchema = createSelectSchema(postsMeta)
