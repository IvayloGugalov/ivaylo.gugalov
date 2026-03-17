# Portfolio Site — oRPC + TanStack Query Agent Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement all oRPC routers, the MDX pipeline, the GitHub API client, the oRPC fetch handler, and the typed TanStack Query client used by the UI layer.

**Architecture:** Each feature router lives under `src/server/*/router.ts` and composes into a root router. The root router is mounted at `/api/rpc/$` as a TanStack Start API route. The client (`src/lib/orpc-client.ts`) wraps the root router type to give the styling-agent fully typed hooks.

**Package manager: bun** — use `bun run <script>`. Bun reads `.env.local` automatically.

**Tech Stack:** @orpc/server, @orpc/client, @orpc/react-query, @tanstack/react-query, @mdx-js/mdx, remark-gfm, @shikijs/rehype, gray-matter, zod

**Prerequisite:** DB agent complete + Auth agent complete (middleware and schemas exist).

**Ownership note:** This agent does NOT modify `src/routes/__root.tsx` — that file is owned by the styling-agent. This agent only modifies `src/router.tsx` to add `queryClient` to the router context.

---

## Chunk 1: Blog Router + MDX Pipeline

### Task 1: MDX pipeline

**Files:**
- Create: `src/server/blog/mdx.ts`

- [ ] **Step 1: Write MDX compiler**

Create `src/server/blog/mdx.ts`:

```ts
import { compile } from '@mdx-js/mdx'
import rehypeShiki from '@shikijs/rehype'
import matter from 'gray-matter'
import remarkGfm from 'remark-gfm'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

export interface PostFrontmatter {
  title: string
  date: string
  tags: string[]
  category: string
  description: string
}

const POSTS_DIR = join(process.cwd(), 'content', 'posts')

// Per-slug cache: slug → { code, mtime, frontmatter }
const cache = new Map<string, { code: string; mtime: number; frontmatter: PostFrontmatter }>()

export async function compileMdx(slug: string): Promise<{ code: string; frontmatter: PostFrontmatter }> {
  const filePath = join(POSTS_DIR, `${slug}.mdx`)
  const mtime = statSync(filePath).mtimeMs
  const cached = cache.get(slug)

  if (cached && cached.mtime === mtime) {
    return { code: cached.code, frontmatter: cached.frontmatter }
  }

  const raw = readFileSync(filePath, 'utf-8')
  const { data, content } = matter(raw)
  const frontmatter = data as PostFrontmatter

  // outputFormat: 'function-body' produces a JS function body string
  // that can be executed client-side via @mdx-js/mdx run()
  const compiled = await compile(content, {
    outputFormat: 'function-body',
    remarkPlugins: [remarkGfm],
    rehypePlugins: [
      [rehypeShiki, { theme: 'github-dark-dimmed' }],
    ],
  })

  const code = String(compiled)
  cache.set(slug, { code, mtime, frontmatter })
  return { code, frontmatter }
}

export function listPosts(): Array<PostFrontmatter & { slug: string }> {
  const files = readdirSync(POSTS_DIR).filter((f) => f.endsWith('.mdx'))

  return files.map((file) => {
    const slug = file.replace('.mdx', '')
    const raw = readFileSync(join(POSTS_DIR, file), 'utf-8')
    const { data } = matter(raw)
    return { ...(data as PostFrontmatter), slug }
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}
```

- [ ] **Step 2: Write unit tests for MDX pipeline**

Create `src/server/blog/mdx.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { listPosts, compileMdx } from './mdx'

describe('listPosts', () => {
  it('returns an array', () => {
    const posts = listPosts()
    expect(Array.isArray(posts)).toBe(true)
  })

  it('each post has required frontmatter fields', () => {
    const posts = listPosts()
    for (const post of posts) {
      expect(post).toHaveProperty('title')
      expect(post).toHaveProperty('date')
      expect(post).toHaveProperty('slug')
      expect(post).toHaveProperty('tags')
      expect(post).toHaveProperty('category')
      expect(post).toHaveProperty('description')
    }
  })

  it('posts are sorted newest first', () => {
    const posts = listPosts()
    for (let i = 1; i < posts.length; i++) {
      expect(new Date(posts[i - 1]!.date).getTime()).toBeGreaterThanOrEqual(
        new Date(posts[i]!.date).getTime()
      )
    }
  })
})

describe('compileMdx', () => {
  it('compiles hello-world.mdx and returns code + frontmatter', async () => {
    const { code, frontmatter } = await compileMdx('hello-world')
    expect(typeof code).toBe('string')
    expect(code.length).toBeGreaterThan(0)
    expect(frontmatter.title).toBe('Hello World')
  })

  it('returns function-body format (starts with "use strict" or var declaration)', async () => {
    const { code } = await compileMdx('hello-world')
    // function-body output begins with use strict or an assignment — not an import statement
    expect(code).not.toMatch(/^import /)
  })

  it('uses cache on second call (same mtime)', async () => {
    const first = await compileMdx('hello-world')
    const second = await compileMdx('hello-world')
    expect(first.code).toBe(second.code)
  })
})
```

- [ ] **Step 3: Run tests**

```bash
bun run test src/server/blog/mdx.test.ts
```

Expected: 6 tests pass. (Requires `content/posts/hello-world.mdx` from Phase 0.)

- [ ] **Step 4: Commit**

```bash
git add src/server/blog/mdx.ts src/server/blog/mdx.test.ts
git commit -m "feat(blog): add MDX compile pipeline with Shiki"
```

---

### Task 2: Blog oRPC router

**Files:**
- Create: `src/server/blog/router.ts`

- [ ] **Step 1: Write blog router**

Create `src/server/blog/router.ts`:

```ts
import { os } from '@orpc/server'
import { z } from 'zod'
import { db } from '@/server/db/client'
import { postsMeta } from '@/server/db/schema'
import { publicProcedure } from '@/server/auth/middleware'
import { compileMdx, listPosts } from './mdx'
import { eq, sql } from 'drizzle-orm'

export const blogRouter = os.router({
  // List all posts (frontmatter only, optional tag/category filter)
  getPosts: publicProcedure
    .input(
      z.object({
        tag: z.string().optional(),
        category: z.string().optional(),
      }).optional()
    )
    .handler(async ({ input }) => {
      let posts = listPosts()
      if (input?.tag) posts = posts.filter((p) => p.tags.includes(input.tag!))
      if (input?.category) posts = posts.filter((p) => p.category === input.category)
      return posts
    }),

  // Get compiled MDX function-body + frontmatter for a single post
  getPost: publicProcedure
    .input(z.object({ slug: z.string() }))
    .handler(async ({ input }) => compileMdx(input.slug)),

  // Get view count
  getPostMeta: publicProcedure
    .input(z.object({ slug: z.string() }))
    .handler(async ({ input }) => {
      const [meta] = await db.select().from(postsMeta).where(eq(postsMeta.slug, input.slug))
      return { views: meta?.views ?? 0 }
    }),

  // Increment views (fire-and-forget, public — accepted tradeoff for a personal portfolio)
  incrementViews: publicProcedure
    .input(z.object({ slug: z.string() }))
    .handler(async ({ input }) => {
      await db
        .insert(postsMeta)
        .values({ slug: input.slug, views: 1 })
        .onConflictDoUpdate({
          target: postsMeta.slug,
          set: { views: sql`${postsMeta.views} + 1` },
        })
      return { ok: true }
    }),
})
```

- [ ] **Step 2: Commit**

```bash
git add src/server/blog/router.ts
git commit -m "feat(blog): add blog orpc router"
```

---

### Task 3: Comments + Reactions oRPC router

**Files:**
- Create: `src/server/comments/router.ts`

- [ ] **Step 1: Write comments router**

Create `src/server/comments/router.ts`:

```ts
import { os } from '@orpc/server'
import { z } from 'zod'
import { and, eq } from 'drizzle-orm'
import { db } from '@/server/db/client'
import { comments, reactions } from '@/server/db/schema'
import { publicProcedure, requireAuth } from '@/server/auth/middleware'

export const commentsRouter = os.router({
  getComments: publicProcedure
    .input(z.object({ postSlug: z.string() }))
    .handler(async ({ input }) => {
      const all = await db
        .select()
        .from(comments)
        .where(eq(comments.postSlug, input.postSlug))
        .orderBy(comments.createdAt)

      const topLevel = all.filter((c) => c.parentId === null)
      return topLevel.map((parent) => ({
        ...parent,
        replies: all.filter((c) => c.parentId === parent.id),
      }))
    }),

  createComment: requireAuth
    .input(
      z.object({
        postSlug: z.string(),
        content: z.string().min(1).max(2000),
        parentId: z.string().uuid().optional(),
      })
    )
    .handler(async ({ input, context }) => {
      if (input.parentId) {
        const [parent] = await db.select().from(comments).where(eq(comments.id, input.parentId)).limit(1)
        if (!parent) throw new Error('Parent comment not found')
        if (parent.parentId !== null) throw new Error('Cannot nest more than 1 level deep')
      }

      const [created] = await db
        .insert(comments)
        .values({
          postSlug: input.postSlug,
          userId: context.user.id,
          content: input.content,
          parentId: input.parentId ?? null,
        })
        .returning()

      return created
    }),

  deleteComment: requireAuth
    .input(z.object({ commentId: z.string().uuid() }))
    .handler(async ({ input, context }) => {
      const [deleted] = await db
        .delete(comments)
        .where(and(eq(comments.id, input.commentId), eq(comments.userId, context.user.id)))
        .returning()

      if (!deleted) throw new Error('Comment not found or not yours')
      return { ok: true }
    }),

  addReaction: requireAuth
    .input(
      z.object({
        targetId: z.string(),
        targetType: z.enum(['post', 'comment']),
        emoji: z.string().min(1).max(8),
      })
    )
    .handler(async ({ input, context }) => {
      const [reaction] = await db
        .insert(reactions)
        .values({
          targetId: input.targetId,
          targetType: input.targetType,
          userId: context.user.id,
          emoji: input.emoji,
        })
        .onConflictDoNothing()
        .returning()

      return reaction ?? { already: true }
    }),

  deleteReaction: requireAuth
    .input(z.object({ reactionId: z.string().uuid() }))
    .handler(async ({ input, context }) => {
      const [deleted] = await db
        .delete(reactions)
        .where(and(eq(reactions.id, input.reactionId), eq(reactions.userId, context.user.id)))
        .returning()

      if (!deleted) throw new Error('Reaction not found or not yours')
      return { ok: true }
    }),
})
```

- [ ] **Step 2: Commit**

```bash
git add src/server/comments/router.ts
git commit -m "feat(comments): add comments and reactions orpc router"
```

---

## Chunk 2: Root Router + API Handler + Client

### Task 4: Root oRPC router

**Files:**
- Create: `src/server/router.ts`

- [ ] **Step 1: Compose root router**

Create `src/server/router.ts`:

```ts
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
```

- [ ] **Step 2: Commit**

```bash
git add src/server/router.ts
git commit -m "feat(orpc): compose root router"
```

---

### Task 5: oRPC fetch handler (API route)

**Files:**
- Create: `src/routes/api/rpc/$.ts`

- [ ] **Step 1: Write the oRPC API route**

Create `src/routes/api/rpc/$.ts`:

```ts
import { RPCHandler } from '@orpc/server/fetch'
import { createAPIFileRoute } from '@tanstack/react-start/api'
import { appRouter } from '@/server/router'

const handler = new RPCHandler(appRouter, {
  prefix: '/api/rpc',
})

async function handleRequest(request: Request): Promise<Response> {
  const { matched, response } = await handler.handle(request, {
    context: { headers: request.headers },
    prefix: '/api/rpc',
  })
  if (matched) return response
  return new Response('Not found', { status: 404 })
}

export const APIRoute = createAPIFileRoute('/api/rpc/$')({
  GET: ({ request }) => handleRequest(request),
  POST: ({ request }) => handleRequest(request),
})
```

- [ ] **Step 2: Test the handler manually**

```bash
bun run dev
```

Visit `http://localhost:3000/api/rpc/blog.getPosts` — should return JSON array of posts.

- [ ] **Step 3: Commit**

```bash
git add src/routes/api/rpc/$.ts
git commit -m "feat(orpc): mount orpc handler at /api/rpc"
```

---

### Task 6: oRPC client + TanStack Query integration

**Files:**
- Create: `src/lib/orpc-client.ts`
- Modify: `src/router.tsx` (add queryClient to context only)

**Ownership:** This agent does NOT touch `src/routes/__root.tsx`. The styling-agent adds `QueryClientProvider` there.

- [ ] **Step 1: Write the oRPC client**

Create `src/lib/orpc-client.ts`:

```ts
import { createORPCClient } from '@orpc/client'
import { RPCLink } from '@orpc/client/fetch'
import { createORPCReactQueryUtils } from '@orpc/react-query'
import { QueryClient } from '@tanstack/react-query'
import type { AppRouter } from '@/server/router'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
})

// oRPC client requires a link/transport — RPCLink handles fetch-based transport
const link = new RPCLink({ url: '/api/rpc' })
export const orpc = createORPCClient<AppRouter>(link)

// Typed TanStack Query utils — import `orpcQuery` in all components
export const orpcQuery = createORPCReactQueryUtils(orpc)
```

- [ ] **Step 2: Update router.tsx to expose queryClient in context**

Modify `src/router.tsx`:

```ts
import { createRouter as createTanStackRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'
import { queryClient } from './lib/orpc-client'

export function getRouter() {
  const router = createTanStackRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 0,
    context: {
      queryClient,
    },
  })

  return router
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
```

- [ ] **Step 3: Write a smoke test for the client exports**

Create `src/lib/orpc-client.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { queryClient, orpc, orpcQuery } from './orpc-client'

describe('orpc-client', () => {
  it('exports a queryClient', () => {
    expect(queryClient).toBeDefined()
  })

  it('exports orpc client', () => {
    expect(orpc).toBeDefined()
  })

  it('exports orpcQuery utils', () => {
    expect(orpcQuery).toBeDefined()
  })
})
```

- [ ] **Step 4: Run test**

```bash
bun run test src/lib/orpc-client.test.ts
```

Expected: 3 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/lib/orpc-client.ts src/lib/orpc-client.test.ts src/router.tsx
git commit -m "feat(orpc): add typed orpc client and tanstack query integration"
```

---

### Task 7: GitHub API client + whitelist

**Files:**
- Create: `src/lib/github.ts`
- Create: `src/lib/whitelist.ts`

- [ ] **Step 1: Write whitelist**

Create `src/lib/whitelist.ts`:

```ts
// Replace 'your-github-username' with your actual GitHub username
export const GITHUB_USERNAME = 'your-github-username'

// Add the repo names (not full URLs) you want displayed on /projects
export const WHITELISTED_REPOS: string[] = [
  // 'my-cool-project',
  // 'another-repo',
]
```

- [ ] **Step 2: Write GitHub API client**

Create `src/lib/github.ts`:

```ts
import { GITHUB_USERNAME, WHITELISTED_REPOS } from './whitelist'

export interface GitHubRepo {
  name: string
  description: string | null
  stargazers_count: number
  forks_count: number
  language: string | null
  html_url: string
}

export async function fetchWhitelistedRepos(): Promise<GitHubRepo[]> {
  const token = process.env.GITHUB_TOKEN

  const results = await Promise.all(
    WHITELISTED_REPOS.map(async (repo) => {
      const url = `https://api.github.com/repos/${GITHUB_USERNAME}/${repo}`
      const res = await fetch(url, {
        headers: {
          Accept: 'application/vnd.github+json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })

      if (!res.ok) {
        console.warn(`GitHub API: ${res.status} for repo ${repo}`)
        return null
      }

      return res.json() as Promise<GitHubRepo>
    })
  )

  return results.filter((r): r is GitHubRepo => r !== null)
}
```

- [ ] **Step 3: Write a test for the whitelist**

Create `src/lib/whitelist.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { WHITELISTED_REPOS, GITHUB_USERNAME } from './whitelist'

describe('whitelist', () => {
  it('exports WHITELISTED_REPOS as an array', () => {
    expect(Array.isArray(WHITELISTED_REPOS)).toBe(true)
  })

  it('exports GITHUB_USERNAME as a non-empty string', () => {
    expect(typeof GITHUB_USERNAME).toBe('string')
    expect(GITHUB_USERNAME.length).toBeGreaterThan(0)
  })
})
```

- [ ] **Step 4: Run test**

```bash
bun run test src/lib/whitelist.test.ts
```

Expected: 2 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/lib/github.ts src/lib/whitelist.ts src/lib/whitelist.test.ts
git commit -m "feat(projects): add github api client and repo whitelist"
```

---

**oRPC + Query agent complete.** Exports for styling-agent:
- `import { orpcQuery } from '@/lib/orpc-client'` — typed query utils (`.queryOptions()`, `.mutationOptions()`)
- `import { queryClient } from '@/lib/orpc-client'` — for `QueryClientProvider`
- `import { fetchWhitelistedRepos } from '@/lib/github'` — for the projects loader
- `import type { PostFrontmatter } from '@/server/blog/mdx'` — for type-safe blog rendering
- MDX blog posts return `{ code: string, frontmatter }` where `code` is a `function-body` string — use `@mdx-js/mdx`'s `run(code, { ...runtime })` client-side to render it as a React component
