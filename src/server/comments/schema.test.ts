import { describe, expect, it } from 'vitest'
import { comments, reactions } from './schema'
import { getTableColumns, getTableName } from 'drizzle-orm'

describe('comments schema', () => {
  it('table name is comments', () => {
    expect(getTableName(comments)).toBe('comments')
  })

  it('has all required columns', () => {
    const cols = getTableColumns(comments)
    expect(cols.id).toBeDefined()
    expect(cols.postSlug).toBeDefined()
    expect(cols.userId).toBeDefined()
    expect(cols.content).toBeDefined()
    expect(cols.parentId).toBeDefined()
    expect(cols.createdAt).toBeDefined()
    expect(cols.updatedAt).toBeDefined()
  })

  it('id is primary key', () => {
    expect(comments.id.primary).toBe(true)
  })

  it('parentId is nullable (undefined notNull)', () => {
    // Drizzle nullable columns have notNull === false on the column config
    expect(comments.parentId.notNull).toBeFalsy()
  })
})

describe('reactions schema', () => {
  it('table name is reactions', () => {
    expect(getTableName(reactions)).toBe('reactions')
  })

  it('targetType enum contains post and comment', () => {
    expect(reactions.targetType.enumValues).toContain('post')
    expect(reactions.targetType.enumValues).toContain('comment')
  })
})
