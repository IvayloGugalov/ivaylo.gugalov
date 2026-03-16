# Portfolio Site — Implementation Design

**Date:** 2026-03-16
**Status:** Approved

---

## Overview

A personal portfolio site built with TanStack Start (React 19, SSR), Tailwind CSS v4, oRPC, Drizzle ORM + Neon (PostgreSQL), Better Auth (GitHub OAuth), and MDX for blog content. Deployed to a Node.js host (Railway / Fly.io).

---

## Pages & Routes

| Route | Description |
|---|---|
| `/` | Hero + brief intro |
| `/about` | Background, experience, bio |
| `/projects` | Whitelisted GitHub repos (fetched via GitHub API) |
| `/blog` | Post list with tag/category filtering |
| `/blog/$slug` | Individual MDX post + comments + reactions |
| `/uses` | Tools, hardware, editor setup |
| `/contact` | Links only (GitHub, LinkedIn, email) |

---

## Folder Structure

```
src/
├── routes/
│   ├── __root.tsx
│   ├── index.tsx
│   ├── about.tsx
│   ├── projects.tsx
│   ├── uses.tsx
│   ├── contact.tsx
│   └── blog/
│       ├── index.tsx
│       └── $slug.tsx
│
├── server/
│   ├── db/
│   │   ├── client.ts        # Neon + Drizzle client
│   │   ├── schema.ts        # Re-exports all feature schemas
│   │   └── migrate.ts       # Migration runner
│   ├── auth/
│   │   ├── auth.ts          # Better Auth config
│   │   ├── middleware.ts    # requireAuth oRPC procedure wrapper
│   │   └── router.ts        # oRPC: me, logout (login/callback handled by Better Auth)
│   ├── blog/
│   │   ├── schema.ts        # posts_meta table (slug, views)
│   │   ├── router.ts        # oRPC: getPosts, getPostMeta, incrementViews
│   │   └── mdx.ts           # MDX pipeline: gray-matter → remark → rehype → shiki
│   ├── comments/
│   │   ├── schema.ts        # comments, reactions tables
│   │   └── router.ts        # oRPC: getComments, createComment, deleteComment, addReaction, deleteReaction
│   └── router.ts            # Root oRPC router (composes auth + blog + comments)
│
├── components/
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── ThemeToggle.tsx
│   ├── blog/
│   │   ├── BlogCard.tsx
│   │   ├── TagFilter.tsx
│   │   ├── CommentThread.tsx
│   │   └── ReactionBar.tsx
│   ├── projects/
│   │   ├── RepoCard.tsx
│   │   └── LanguageDot.tsx
│   └── ui/                  # Shared primitives (Button, Avatar, etc.)
│
├── store/
│   ├── theme.ts             # Zustand: system pref default + toggle, persisted to localStorage
│   └── auth.ts              # Zustand: user | null (hydrated from Better Auth session)
│
├── lib/
│   ├── github.ts            # GitHub REST API client for /projects
│   ├── whitelist.ts         # Whitelisted repo names array
│   └── orpc-client.ts       # oRPC client + TanStack Query integration
│
└── content/
    └── posts/               # .mdx blog files with frontmatter
```

---

## Tech Stack

| Concern | Tool |
|---|---|
| Framework | TanStack Start |
| Data fetching / caching | TanStack Query |
| Global state (theme, auth) | Zustand |
| Styling | Tailwind CSS v4 |
| Icons | Lucide |
| API layer | oRPC (type-safe, OpenAPI-compliant) |
| Schema validation | Zod |
| Database | Neon (PostgreSQL) |
| ORM | Drizzle ORM |
| Auth | Better Auth (GitHub OAuth) |
| MDX parsing | gray-matter + remark + rehype + rehype-shiki |
| Syntax highlighting | Shiki (via rehype-shiki) |
| Deployment | Node.js (Railway / Fly.io) — `@tanstack/start-server-node` |

---

## Database Schema

Better Auth auto-generates `users`, `sessions`, `accounts` tables via `@better-auth/cli generate`. Custom tables:

```
posts_meta   → slug (PK), views (integer, default 0)
comments     → id, post_slug, user_id (FK→users.id), content, parent_id (nullable, self-ref, max 1 level), created_at, updated_at
reactions    → id, target_id, target_type ('post'|'comment'), user_id (FK→users.id), emoji, created_at
             → unique(target_id, target_type, user_id, emoji)
```

---

## Auth

- **Better Auth** with `drizzleAdapter` (pg, usePlural: true)
- GitHub OAuth social provider
- Session stored server-side (Better Auth managed), session ID in HTTP-only cookie
- TanStack Start server functions use `auth.api.getSession({ headers })` to validate
- `requireAuth` middleware: oRPC procedure wrapper that throws `UNAUTHORIZED` if no valid session
- Zustand `auth` store holds `user | null` on the client, hydrated from a prefetched `/api/auth/session` call in `__root.tsx` loader

---

## oRPC API

Base path: `/api/rpc`

| Router | Procedure | Auth | Description |
|---|---|---|---|
| auth | `me` | public | Returns current user or null |
| auth | `logout` | protected | Invalidates session |
| blog | `getPosts` | public | Returns frontmatter list from /content/posts |
| blog | `getPostMeta` | public | Returns views count for a slug |
| blog | `incrementViews` | public | Upserts posts_meta views++ |
| comments | `getComments` | public | Returns comments tree for a slug |
| comments | `createComment` | protected | Creates comment (max 1 level nesting) |
| comments | `deleteComment` | protected | Deletes own comment only |
| comments | `addReaction` | protected | Upserts reaction (emoji per user per target) |
| comments | `deleteReaction` | protected | Removes own reaction |

---

## Data Flow

**Blog post page (`/blog/$slug`):**
1. TanStack Start loader runs server-side: fetches MDX file, parses frontmatter, compiles MDX, fetches `getComments` + `getPostMeta`
2. Dehydrated query state passed to client via `HydrationBoundary`
3. Client renders compiled MDX, comments tree, reaction bar
4. `incrementViews` fires as a fire-and-forget mutation on mount
5. Optimistic updates: reactions toggle immediately in cache, roll back on error

**Projects page (`/projects`):**
1. TanStack Start loader calls GitHub REST API with whitelisted repo names
2. Cached via TanStack Query (stale-while-revalidate, 5 min)
3. Displays: name, description, stars, forks, primary language + color dot

---

## Theme

- Tailwind CSS v4 `dark` class strategy
- Zustand `theme` store: initializes from `window.matchMedia('prefers-color-scheme: dark')`
- Persisted to `localStorage` (user override)
- Toggle button in `Header`

---

## MDX Pipeline

```
.mdx file → gray-matter (frontmatter strip) → remark (GFM) → rehype (HTML AST)
         → rehype-shiki (syntax highlighting, server-side) → compiled HTML string
```

- Compiled per-slug on first request, cached in a `Map<slug, { html, mtime }>`
- Cache invalidated when file mtime changes (dev hot reload)

---

## Parallel Agent Split

| Agent | Owns |
|---|---|
| **db-agent** | `src/server/db/`, `src/server/*/schema.ts`, Drizzle config, migration runner |
| **query-orpc-agent** | `src/server/*/router.ts`, `src/lib/orpc-client.ts`, TanStack Query hooks |
| **auth-agent** | `src/server/auth/auth.ts`, `src/server/auth/middleware.ts`, Better Auth setup, `src/store/auth.ts` |
| **styling-agent** | `src/components/`, `src/routes/` (UI layer), `src/store/theme.ts`, Tailwind config |
