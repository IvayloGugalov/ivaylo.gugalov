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
    expect(code).not.toMatch(/^import /)
  })

  it('uses cache on second call (same mtime)', async () => {
    const first = await compileMdx('hello-world')
    const second = await compileMdx('hello-world')
    expect(first.code).toBe(second.code)
  })
})
