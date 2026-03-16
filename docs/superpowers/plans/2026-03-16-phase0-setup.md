# Portfolio Site — Phase 0: Foundation Setup

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Install all missing dependencies, scaffold directory structure, and create config files so the 4 parallel agents can start immediately.

**Architecture:** Single sequential phase — all deps installed, env template created, drizzle config written, content/ directory scaffolded. No implementation logic here, only infrastructure.

**Package manager: bun** — `bun add`, `bun run <script>`. Bun reads `.env.local` automatically so no dotenv wrapper is needed.

**Tech Stack:** bun, Drizzle Kit, Better Auth CLI, Neon, oRPC, TanStack Query, Zustand, Zod, MDX

---

## Chunk 1: Install Dependencies + Scaffold

### Task 1: Install runtime dependencies

**Files:**
- Modify: `package.json` (via bun)

- [ ] **Step 1: Install all missing runtime deps**

```bash
cd C:/Users/Dell/repos/me/portfolio-site
bun add drizzle-orm @neondatabase/serverless better-auth @orpc/server @orpc/client @orpc/react-query @orpc/zod @tanstack/react-query zustand zod gray-matter @mdx-js/mdx @mdx-js/react remark-gfm @shikijs/rehype shiki
```

Expected: packages installed, no peer dependency errors.

- [ ] **Step 2: Install dev dependencies**

```bash
bun add -d drizzle-kit @types/mdx
```

Expected: drizzle-kit added to devDependencies.

- [ ] **Step 3: Verify installs**

```bash
bun pm ls
```

Expected: all installed packages listed.

- [ ] **Step 4: Commit**

```bash
git add package.json bun.lock
git commit -m "chore: install portfolio dependencies"
```

---

### Task 2: Create .env.local template

**Files:**
- Create: `.env.local` (gitignored — bun loads this automatically)
- Create: `.env.example`

- [ ] **Step 1: Create .env.example**

Create `/.env.example`:

```env
# Database — get from neon.tech dashboard
DATABASE_URL=postgres://user:pass@host/dbname?sslmode=require

# Better Auth — generate with: openssl rand -base64 32
BETTER_AUTH_SECRET=your-32-char-secret-here

# Better Auth base URL
BETTER_AUTH_URL=http://localhost:3000

# GitHub OAuth App — create at github.com/settings/developers
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# GitHub API Token (optional — raises rate limit from 60 to 5000 req/hr)
GITHUB_TOKEN=ghp_your_token_here
```

- [ ] **Step 2: Create .env.local from template**

```bash
cp .env.example .env.local
```

Fill in real values in `.env.local` (do NOT commit this file).

- [ ] **Step 3: Verify .gitignore covers .env.local**

Check `.gitignore` contains `.env.local`. If not, add it.

- [ ] **Step 4: Commit**

```bash
git add .env.example .gitignore
git commit -m "chore: add env template"
```

---

### Task 3: Create drizzle.config.ts

**Files:**
- Create: `drizzle.config.ts`

- [ ] **Step 1: Write drizzle config**

Bun loads `.env.local` automatically, so `DATABASE_URL` is available without any wrapper.

Create `/drizzle.config.ts`:

```ts
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './src/server/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
})
```

- [ ] **Step 2: Ensure `drizzle/` is not gitignored**

Migrations in `drizzle/` should be committed. Ensure `drizzle/` is NOT in `.gitignore`.

- [ ] **Step 3: Commit**

```bash
git add drizzle.config.ts
git commit -m "chore: add drizzle config"
```

---

### Task 4: Update package.json scripts

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Update scripts**

Bun reads `.env.local` natively — no dotenv wrapper needed. Migrate script runs directly via `bun`.

Open `package.json` and update the `scripts` section:

```json
{
  "scripts": {
    "dev": "vite dev --port 3000",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "bun src/server/db/migrate.ts",
    "db:studio": "drizzle-kit studio",
    "auth:generate": "bunx @better-auth/cli generate"
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add package.json
git commit -m "chore: update scripts for bun"
```

---

### Task 5: Scaffold directory structure

**Files:**
- Create directories and placeholder files

- [ ] **Step 1: Create all directories**

```bash
cd C:/Users/Dell/repos/me/portfolio-site
mkdir -p src/server/db src/server/auth src/server/blog src/server/comments
mkdir -p src/components/ui src/components/blog src/components/projects
mkdir -p src/store src/lib
mkdir -p src/routes/api/auth src/routes/api/rpc
mkdir -p src/routes/blog
mkdir -p content/posts
mkdir -p drizzle
```

- [ ] **Step 2: Create a sample blog post**

Create `content/posts/hello-world.mdx`:

```mdx
---
title: Hello World
date: 2026-03-16
tags: [meta, first-post]
category: general
description: The first post on this blog.
---

# Hello World

Welcome to my blog! This is a test post.

## Code Example

```ts
const hello = 'world'
console.log(hello)
```
```

- [ ] **Step 3: Commit**

```bash
git add content/ src/server/ src/components/ src/store/ src/lib/ src/routes/api/ drizzle/
git commit -m "chore: scaffold directory structure"
```

---

**Phase 0 complete.** The 4 parallel agents can now start:
- **db-agent** → see `2026-03-16-db.md`
- **auth-agent** → see `2026-03-16-auth.md`
- **query-orpc-agent** → see `2026-03-16-orpc-query.md`
- **styling-agent** → see `2026-03-16-styling.md`
