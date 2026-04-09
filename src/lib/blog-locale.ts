// Blog locale fallback strategy
// Posts are file-based MDX (not DB-driven). The blog router uses `listPosts()`
// from `@/lib/mdx` which reads MDX files from the filesystem.
//
// Current state: posts have no locale field — all content is in English.
//
// Recommended i18n approach for MDX-based blog:
//   1. Name files with locale suffix:  my-post.en.mdx / my-post.bg.mdx
//   2. Update `listPosts()` in src/lib/mdx.ts to accept a `locale` param,
//      filter by suffix, and fall back to BLOG_LOCALE_FALLBACK when no
//      translation exists for the requested locale.
//   3. Pass the active locale from the Paraglide runtime into the blog router
//      input (extend GetPostsInputSchema / GetPostInputSchema with an optional
//      `locale` field).
//
// DB note: `posts_meta` (slug PK, title, views, createdAt, updatedAt) only
// stores view-counts / metadata. No locale column is needed there because the
// source of truth for post content is the MDX files, not the DB.

export const BLOG_LOCALE_FALLBACK = 'en' as const
export type BlogLocale = 'en' | 'bg'
export const SUPPORTED_BLOG_LOCALES: BlogLocale[] = ['en', 'bg']
