import { describe, expect, it } from 'vitest'
import { postsMeta } from './schema'
import { getTableColumns } from 'drizzle-orm'

describe('postsMeta schema', () => {
  it('has slug and views columns', () => {
    const cols = getTableColumns(postsMeta)
    expect(cols.slug).toBeDefined()
    expect(cols.views).toBeDefined()
  })

  it('slug is the primary key', () => {
    expect(postsMeta.slug.primary).toBe(true)
  })

  it('views has a default value', () => {
    expect(postsMeta.views.hasDefault).toBe(true)
  })
})
