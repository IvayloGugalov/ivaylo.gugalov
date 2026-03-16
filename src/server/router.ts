import { os } from '@orpc/server'
import { authRouter } from './auth/router'
import { blogRouter } from './blog/router'
import { commentsRouter } from './comments/router'

export const appRouter = os.router({
  auth: authRouter,
  blog: blogRouter,
  comments: commentsRouter,
})

export type AppRouter = typeof appRouter
