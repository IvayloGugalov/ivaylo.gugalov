import {
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from 'drizzle-orm/pg-core'
import { users } from '#/server/db/schema'

export const comments = pgTable('comments', {
  id: uuid('id').primaryKey().defaultRandom(),
  postSlug: text('post_slug').notNull(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  parentId: uuid('parent_id'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const reactions = pgTable(
  'reactions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    targetId: text('target_id').notNull(),
    targetType: text('target_type', { enum: ['post', 'comment'] }).notNull(),
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    emoji: text('emoji').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (t) => [unique().on(t.targetId, t.targetType, t.userId, t.emoji)],
)
