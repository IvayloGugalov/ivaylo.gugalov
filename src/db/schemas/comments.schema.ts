import {
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
  type AnyPgColumn,
} from 'drizzle-orm/pg-core'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { users } from '@/db/schemas'
import { relations } from 'drizzle-orm'
import z from 'zod'

export const comments = pgTable('comments', {
  id: uuid('id').primaryKey().defaultRandom(),
  postSlug: text('post_slug').notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  parentId: uuid('parent_id').references((): AnyPgColumn => comments.id, {
    onDelete: 'cascade',
  }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const reactions = pgTable(
  'reactions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    targetId: text('target_id').notNull(),
    targetType: text('target_type', { enum: ['post', 'comment'] }).notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    emoji: text('emoji').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (t) => [unique().on(t.targetId, t.targetType, t.userId, t.emoji)],
)

export const commentsRelations = relations(comments, ({ one, many }) => ({
  user: one(users, {
    fields: [comments.userId],
    references: [users.id],
  }),
  parent: one(comments, {
    fields: [comments.parentId],
    references: [comments.id],
    relationName: 'comment_replies',
  }),
  replies: many(comments, {
    relationName: 'comment_replies',
  }),
  reactions: many(reactions),
}))

export const reactionsRelations = relations(reactions, ({ one }) => ({
  user: one(users, {
    fields: [reactions.userId],
    references: [users.id],
  }),
  comment: one(comments, {
    fields: [reactions.targetId],
    references: [comments.id],
  }),
}))

export const insertCommentsSchema = createInsertSchema(comments)
export const selectCommentsSchema = createSelectSchema(comments)

export const insertReactionsSchema = createInsertSchema(reactions)
export const selectReactionsSchema = createSelectSchema(reactions)

export const commentWithUser = selectCommentsSchema.extend({
  liked: z.boolean().nullable().optional(),
  user: createSelectSchema(users).pick({
    id: true,
    name: true,
    image: true,
    role: true,
  }),
})

export type CommentWithUser = z.infer<typeof commentWithUser>
