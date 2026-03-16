import {
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from 'drizzle-orm/pg-core'

// Forward-reference to Better Auth users table (generated in Task 4)
// FK constraint is expressed via .references() pointing to the table name string
export const comments = pgTable('comments', {
  id: uuid('id').primaryKey().defaultRandom(),
  postSlug: text('post_slug').notNull(),
  // FK to users.id — Better Auth owns the users table
  userId: text('user_id').notNull(),
  content: text('content').notNull(),
  // Self-referencing FK: null = top-level, non-null = reply (max 1 level enforced in router)
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
    // FK to users.id — Better Auth owns the users table
    userId: text('user_id').notNull(),
    emoji: text('emoji').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (t) => [unique().on(t.targetId, t.targetType, t.userId, t.emoji)],
)
