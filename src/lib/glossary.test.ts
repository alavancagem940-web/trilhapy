import { describe, expect, it } from 'vitest'
import { firstUnseenTerm } from './glossary'

describe('glossário', () => {
  it('explica variável na primeira vez', () => {
    const term = firstUnseenTerm('O que é uma variável em Python?', [])
    expect(term?.id).toBe('variavel')
    expect(term?.body.toLowerCase()).toContain('memória')
    expect(firstUnseenTerm('outra variável', ['variavel'])).toBeNull()
  })
})
