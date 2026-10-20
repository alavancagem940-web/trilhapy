import { describe, expect, it } from 'vitest'
import { LEVELS } from './lessons'
import { collectSpokenLines } from './microsoft-neural'
import { toSpokenText } from './speech-persona'

const FLIRTY =
  /chega mais perto|relaxa o corpo|mmm\.{2,}|no seu ouvido|me provoca|sem vergonha|fico colada|sente o calor|gostei de você escolhendo|eu espero, quente|sss\.{2,}|tesão|baixinho/i

describe('texto falado', () => {
  it('fala o texto da lição, sem persona flertante', () => {
    const prompt = 'O que é uma variável em Python?'
    expect(toSpokenText(prompt)).toBe(prompt)
    expect(toSpokenText(`  ${prompt}  `)).toBe(prompt)
    expect(toSpokenText(prompt)).not.toMatch(FLIRTY)
  })

  it('não muda a fala por tipo de trecho', () => {
    const body = 'Variável guarda um valor.'
    expect(toSpokenText(body)).toBe(body)
    expect(collectSpokenLines().every((line) => line.spoken === toSpokenText(line.source))).toBe(true)
  })

  it('é idempotente', () => {
    const once = toSpokenText('print mostra na tela')
    expect(toSpokenText(once)).toBe(once)
  })

  it('junta quebra de linha com espaço, sem pausa de sedução', () => {
    expect(toSpokenText('a\nb')).toBe('a b')
    expect(toSpokenText('a\n\nb')).toBe('a b')
    expect(toSpokenText('a\nb')).not.toContain('...')
  })

  it('não altera o texto visível do currículo', () => {
    const first = LEVELS[0]?.units[0]
    expect(first?.theory.concept.startsWith('Sss...')).toBe(false)
    expect(first?.theory.concept.toLowerCase()).not.toMatch(/tesão|no seu ouvido|chega mais perto/)
    expect(first?.exercises[0]?.prompt.startsWith('Sss...')).toBe(false)
  })

  it('nenhuma fala empacotada leva tesão, flerte ou provocação', () => {
    const lines = collectSpokenLines()
    expect(lines.length).toBeGreaterThan(40)
    for (const line of lines) {
      expect(line.spoken, line.source).not.toMatch(FLIRTY)
      expect(line.spoken).toBe(toSpokenText(line.source))
    }
  })
})
