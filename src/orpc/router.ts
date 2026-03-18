import { authRouter } from '@/orpc/routers/auth.router'
import { blogRouter } from './routers/blog.router'
import { commentsRouter } from './routers/comments.router'
import { githubRouter } from '@/orpc/routers/github.router'
import { adminRouter } from './routers/admin.router'
import { base } from './procedures'

export const appRouter = base.router({
  auth: authRouter,
  blog: blogRouter,
  comments: commentsRouter,
  github: githubRouter,
  admin: adminRouter,
})

export type AppRouter = typeof appRouter
