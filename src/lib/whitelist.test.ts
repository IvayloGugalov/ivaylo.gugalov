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
