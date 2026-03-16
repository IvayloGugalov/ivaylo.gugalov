---

### 🗂️ Pages & Routing (TanStack Start)

| Route | Description |
|---|---|
| `/` | Hero + brief intro |
| `/about` | Background, experience, bio |
| `/projects` | Whitelisted GitHub repos |
| `/blog` | Post list with tag/category filtering |
| `/blog/$slug` | Individual post + comments + reactions |
| `/uses` | Tools, hardware, editor setup |
| `/contact` | Links only (GitHub, LinkedIn, email) |

---

### 🛠️ Full Tech Stack

| Concern | Tool |
|---|---|
| Framework | TanStack Start |
| Data fetching / caching | TanStack Query |
| Client-side collections | TanStack DB |
| Global state (theme, auth) | Zustand |
| Styling | Tailwind CSS v4 |
| Icons | Lucide |
| API layer | oRPC (OpenAPI-compliant, E2E type-safe) |
| Schema validation | Zod |
| Database | Neon (PostgreSQL) |
| ORM | Drizzle ORM (pairs naturally with Neon + Zod) |
| Auth | GitHub OAuth via **Arctic** + session cookies |
| MD parsing | `gray-matter` + `remark` + `rehype` |
| Syntax highlighting | **Shiki** |
| SEO | TanStack Start head API + sitemap route |

---

### 🗃️ Database Schema (Drizzle + Neon)

```
users          → id, github_id, username, avatar_url, created_at
posts_meta     → slug, views (optional view counter)
comments       → id, post_slug, user_id, content, parent_id (nullable = sub-comment), created_at, updated_at
reactions      → id, target_id, target_type (post | comment), user_id, emoji, created_at
```

---

### 📝 Blog System

- MD files live in `/content/posts/` with **frontmatter** (`title`, `date`, `tags`, `category`, `description`)
- Parsed server-side via TanStack Start loaders
- Shiki handles syntax highlighting at render time
- Tags & categories drive filtering on `/blog`

---

### 💬 Comments Architecture

- **oRPC** exposes type-safe endpoints: `createComment`, `getComments`, `deleteComment`, `addReaction`
- **TanStack Query** fetches & caches comments per post
- **TanStack DB** manages optimistic updates for reactions/comments locally
- Sub-comments via `parent_id` — max 1 level of nesting (keeps UX clean)
- Reactions stored per `target_type` so both posts and comments can have them

---

### 🔐 Auth Flow

- GitHub OAuth via **Arctic** — visitor clicks "Sign in with GitHub"
- Session stored in a cookie (server-side session table or JWT)
- Zustand holds the client-side auth state (user object or `null`)
- Only authenticated users can comment/react; reading is public

---

### 🐙 Projects Section

- A `whitelist.ts` config file holds repo names
- TanStack Query fetches GitHub API at runtime (with caching)
- Displays: name, description, stars, forks, primary language (Lucide + language color dots)

---

### 🌗 Theme

- Tailwind CSS dark mode (`class` strategy)
- Zustand store persisted to `localStorage`
- Toggle button in navbar

---

### 📌 Suggested Folder Structure

```
src/
├── routes/                  # TanStack Start file-based routes
│   ├── index.tsx
│   ├── about.tsx
│   ├── projects.tsx
│   ├── blog/
│   │   ├── index.tsx
│   │   └── $slug.tsx
│   ├── uses.tsx
│   └── contact.tsx
├── server/
│   ├── db/                  # Drizzle schema + client
│   ├── routers/             # oRPC routers (comments, reactions, auth)
│   └── auth/                # Arctic GitHub OAuth handlers
├── components/              # Shared UI components
├── content/
│   └── posts/               # Your .md blog files
├── lib/
│   ├── github.ts            # GitHub API client
│   ├── mdx.ts               # MD parsing utilities
│   └── whitelist.ts         # Whitelisted GitHub repos
└── store/                   # Zustand stores
```

---