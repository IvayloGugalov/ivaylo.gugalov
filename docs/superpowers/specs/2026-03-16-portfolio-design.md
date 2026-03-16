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
│   ├── __root.tsx          # Root layout — injects theme script, loads auth session
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
│   │   ├── schema.ts        # Re-exports all feature schemas + Better Auth generated schema
│   │   └── migrate.ts       # Migration runner
│   ├── auth/
│   │   ├── auth.ts          # Better Auth config
│   │   ├── middleware.ts    # requireAuth oRPC procedure wrapper
│   │   └── router.ts        # oRPC: me, logout (login/callback handled by Better Auth at /api/auth/*)
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
│   ├── whitelist.ts         # Whitelisted repo names array (e.g. ['my-repo', 'other-repo'])
│   └── orpc-client.ts       # oRPC client + TanStack Query integration
│
content/                     # Project root — NOT inside src/
└── posts/                   # .mdx blog files with frontmatter
    └── example-post.mdx     # frontmatter: title, date, tags, category, description
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

## Environment Variables

```
# Database
DATABASE_URL=                  # Neon PostgreSQL connection string

# Auth — Better Auth
BETTER_AUTH_SECRET=            # Random 32-char secret for session signing
GITHUB_CLIENT_ID=              # GitHub OAuth App client ID
GITHUB_CLIENT_SECRET=          # GitHub OAuth App client secret

# GitHub API (optional — unauthenticated limit: 60 req/hr)
GITHUB_TOKEN=                  # Personal access token for /projects page (raises limit to 5000/hr)
```

`GITHUB_TOKEN` is optional. If absent, the GitHub API client falls back to unauthenticated requests (60 req/hr — sufficient for a low-traffic portfolio). The token is **never exposed to the client**.

---

## Database Schema

Better Auth auto-generates `users`, `sessions`, `accounts` tables via `@better-auth/cli generate`. Custom tables:

```
posts_meta   → slug (PK, text), views (integer, default 0)

comments     → id (uuid PK), post_slug (text, FK→posts_meta.slug), user_id (text, FK→users.id),
               content (text), parent_id (uuid, nullable, FK→comments.id — max 1 level enforced in router),
               created_at (timestamp), updated_at (timestamp)
               → deletion: hard DELETE. Deleted comment content replaced with "[deleted]" sentinel
                 at query time (router sets content to "[deleted]", user_id to null for display)

reactions    → id (uuid PK), target_id (text), target_type (text: 'post'|'comment'),
               user_id (text, FK→users.id), emoji (text), created_at (timestamp)
             → unique constraint: (target_id, target_type, user_id, emoji)
```

**Comment deletion strategy:** Hard DELETE in DB. The `getComments` query returns a sentinel `{ id, deleted: true, content: "[deleted]" }` shape for comments that had replies (preserving thread structure) — handled in the router via a LEFT JOIN check, not a `deleted` DB column.

---

## Auth

- **Better Auth** with `drizzleAdapter` (pg, usePlural: true)
- GitHub OAuth social provider (`GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`)
- Better Auth mounts its own handlers at `/api/auth/*` (login redirect, OAuth callback, session, logout)
- Session stored server-side (Better Auth managed), session ID in HTTP-only cookie
- TanStack Start server functions use `auth.api.getSession({ headers })` to validate
- `requireAuth` middleware: oRPC procedure wrapper that throws `UNAUTHORIZED` if no valid session
- Zustand `auth` store holds `user | null` on the client, hydrated from the `__root.tsx` loader

---

## oRPC API

Base path: `/api/rpc`

| Router | Procedure | Auth | Description |
|---|---|---|---|
| auth | `me` | public | Returns current user or null |
| auth | `logout` | protected | Invalidates session via Better Auth |
| blog | `getPosts` | public | Returns frontmatter list from `content/posts/` |
| blog | `getPostMeta` | public | Returns views count for a slug |
| blog | `incrementViews` | public | Upserts posts_meta views++ (no rate limiting — accepted tradeoff for a personal portfolio; bots skew the counter but pose no security risk) |
| comments | `getComments` | public | Returns comments tree for a slug (max 1 level deep) |
| comments | `createComment` | protected | Creates comment; rejects if parent_id refers to a reply (enforces 1-level limit) |
| comments | `deleteComment` | protected | Hard DELETE — own comments only (verified by matching user_id) |
| comments | `addReaction` | protected | Upserts reaction (unique per user+target+emoji) |
| comments | `deleteReaction` | protected | Removes own reaction only |

---

## Data Flow

**Blog post page (`/blog/$slug`):**
1. TanStack Start loader runs server-side: reads MDX file from `content/posts/$slug.mdx`, parses frontmatter, compiles MDX, prefetches `getComments` + `getPostMeta`
2. Dehydrated query state passed to client via `HydrationBoundary`
3. Client renders compiled MDX HTML, comments tree, reaction bar
4. `incrementViews` fires as a fire-and-forget mutation on mount
5. Optimistic updates: reactions toggle immediately in cache, roll back on error

**Projects page (`/projects`):**
1. TanStack Start loader reads `src/lib/whitelist.ts` for repo names
2. Fetches GitHub REST API (`/repos/{owner}/{repo}`) for each whitelisted repo using `GITHUB_TOKEN` if set
3. Cached via TanStack Query (stale-while-revalidate, 5 min TTL)
4. Displays: name, description, stars, forks, primary language + color dot
5. **Owner:** `query-orpc-agent` owns the loader + GitHub client; `styling-agent` owns the `RepoCard`/`LanguageDot` components

---

## Theme

- Tailwind CSS v4 `dark` class strategy (class on `<html>`)
- **SSR flash prevention:** `__root.tsx` injects an inline blocking `<script>` in `<head>` that reads `localStorage` and sets `document.documentElement.classList` before React hydrates — eliminates flash of wrong theme
- Zustand `theme` store initializes from `localStorage` value if present, else from `window.matchMedia('prefers-color-scheme: dark')`
- Persisted to `localStorage` on every toggle
- Toggle button in `Header`

---

## MDX Pipeline

```
content/posts/$slug.mdx
  → gray-matter  (strip frontmatter, return { data, content })
  → remark       (parse MD to mdast, apply remark-gfm)
  → rehype       (convert mdast to hast)
  → rehype-shiki (syntax highlight code blocks, server-side)
  → rehype-stringify → HTML string
```

- Compiled per-slug on first request, cached in a module-level `Map<slug, { html, mtime }>`
- Cache invalidated when file `mtime` changes (supports dev hot reload)
- Frontmatter shape: `{ title: string, date: string (ISO), tags: string[], category: string, description: string }`

---

## Parallel Agent Split

| Agent | Owns | Must not touch |
|---|---|---|
| **db-agent** | `src/server/db/`, `src/server/*/schema.ts`, `drizzle.config.ts`, migration runner, Better Auth schema generation | Routes, components |
| **query-orpc-agent** | `src/server/*/router.ts`, `src/lib/orpc-client.ts`, `src/lib/github.ts`, `src/lib/whitelist.ts`, TanStack Query hooks, `content/` directory setup, blog MDX loader logic | DB schema internals, auth logic |
| **auth-agent** | `src/server/auth/auth.ts`, `src/server/auth/middleware.ts`, Better Auth setup + env config, `src/store/auth.ts`, auth route handlers in `src/routes/` | DB schema (reads only), oRPC routers (reads middleware only) |
| **styling-agent** | `src/components/`, `src/routes/` (UI layer only), `src/store/theme.ts`, Tailwind config, `public/` assets, theme flash-prevention script in `__root.tsx` | Server code, DB, oRPC routers |

**Interface contracts (agents depend on these being stable):**
- `db-agent` exports typed Drizzle table refs — other agents import from `src/server/db/schema.ts`
- `auth-agent` exports `requireAuth` from `src/server/auth/middleware.ts` — `query-orpc-agent` imports this for protected procedures
- `query-orpc-agent` exports the root oRPC router type — `styling-agent` uses `orpc-client.ts` for typed hooks
