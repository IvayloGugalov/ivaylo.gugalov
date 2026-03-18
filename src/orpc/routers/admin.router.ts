import { z } from 'zod'
import { desc, eq, sql } from 'drizzle-orm'
import { db } from '@/db/client'
import { comments, postsMeta, reactions, users } from '@/db/schemas'
import { adminProcedure, base } from '@/orpc/procedures'
import { PostRowSchema, PostsInputSchema, StatsOutputSchema, TrendPointSchema, TrendsInputSchema } from '../schemas/admin.schema'

export const adminRouter = base.router({
  stats: adminProcedure.output(StatsOutputSchema).handler(async () => {
    const [usersResult, commentsResult, reactionsResult, postsResult] = await Promise.all([
      db.select({ count: sql<number>`cast(count(*) as int)` }).from(users),
      db.select({ count: sql<number>`cast(count(*) as int)` }).from(comments),
      db.select({ count: sql<number>`cast(count(*) as int)` }).from(reactions),
      db.select({ count: sql<number>`cast(count(*) as int)` }).from(postsMeta),
    ])

    return {
      totalUsers: usersResult[0].count,
      totalComments: commentsResult[0].count,
      totalReactions: reactionsResult[0].count,
      totalPosts: postsResult[0].count,
    }
  }),

  trends: adminProcedure.input(TrendsInputSchema).output(z.array(TrendPointSchema)).handler(async ({ input }) => {
    const rows = await db.execute(sql`
      WITH boundaries AS (
        SELECT
          (NOW() AT TIME ZONE ${input.timezone})::date - (${input.days} - 1) AS start_day,
          (NOW() AT TIME ZONE ${input.timezone})::date                        AS end_day
      ),
      date_series AS (
        SELECT generate_series(
          (SELECT start_day FROM boundaries),
          (SELECT end_day   FROM boundaries),
          INTERVAL '1 day'
        )::date AS day
      ),
      comment_counts AS (
        SELECT
          (${comments.createdAt} AT TIME ZONE ${input.timezone})::date AS day,
          COUNT(*)::int AS count
        FROM ${comments}
        WHERE ${comments.createdAt} >= (SELECT start_day FROM boundaries)::timestamp AT TIME ZONE ${input.timezone}
          AND ${comments.createdAt} <  ((SELECT end_day FROM boundaries)::timestamp AT TIME ZONE ${input.timezone} + INTERVAL '1 day')
        GROUP BY 1
      ),
      reaction_counts AS (
        SELECT
          (${reactions.createdAt} AT TIME ZONE ${input.timezone})::date AS day,
          COUNT(*)::int AS count
        FROM ${reactions}
        WHERE ${reactions.createdAt} >= (SELECT start_day FROM boundaries)::timestamp AT TIME ZONE ${input.timezone}
          AND ${reactions.createdAt} <  ((SELECT end_day FROM boundaries)::timestamp AT TIME ZONE ${input.timezone} + INTERVAL '1 day')
        GROUP BY 1
      )
      SELECT
        ds.day::text          AS date,
        COALESCE(cc.count, 0) AS comments,
        COALESCE(rc.count, 0) AS reactions
      FROM date_series ds
      LEFT JOIN comment_counts cc ON cc.day = ds.day
      LEFT JOIN reaction_counts rc ON rc.day = ds.day
      ORDER BY ds.day ASC
    `)

    return rows.map((row) => ({
      date: row.date as string,
      comments: row.comments as number,
      reactions: row.reactions as number,
    }))
  }),

  posts: adminProcedure.input(PostsInputSchema).output(z.array(PostRowSchema)).handler(async ({ input }) => {
    const rows = await db
      .select({
        slug: postsMeta.slug,
        title: postsMeta.title,
        views: postsMeta.views,
        commentCount: sql<number>`cast(count(${comments.id}) as int)`,
        createdAt: postsMeta.createdAt,
      })
      .from(postsMeta)
      .leftJoin(comments, eq(comments.postSlug, postsMeta.slug))
      .groupBy(postsMeta.slug, postsMeta.title, postsMeta.views, postsMeta.createdAt)
      .orderBy(desc(postsMeta.views))
      .limit(input.limit)
      .offset(input.offset)

    return rows.map((row) => ({
      ...row,
      createdAt: row.createdAt.toISOString(),
    }))
  }),
})
