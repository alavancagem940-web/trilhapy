import { describe, expect, it } from 'vitest'
import { LEVELS } from './lessons'
import { toFlirtySpeech, withBreathPauses } from './speech-persona'

describe('persona falada', () => {
  it('mantém o conteúdo educativo e envolve com fala flertante', () => {
    const prompt = 'O que é uma variável em Python?'
    const spoken = toFlirtySpeech(prompt, 'prompt')
    expect(spoken).toContain(prompt)
    expect(spoken.startsWith('Sss... chega mais perto.')).toBe(true)
    expect(spoken).toMatch(/ouvido|quente|baixinho/)
    expect(spoken).not.toBe(prompt)
  })

  it('tem aberturas diferentes para teoria, alternativa e feedback', () => {
    const theory = toFlirtySpeech('Variável guarda um valor.', 'theory')
    const choice = toFlirtySpeech('Leva o guarda-chuva', 'choice')
    const ok = toFlirtySpeech('A condição é verdadeira.', 'feedback-correct')
    const miss = toFlirtySpeech('A condição da regra é verdadeira.', 'feedback-wrong')
    expect(theory).toContain('Variável guarda um valor.')
    expect(theory).toMatch(/Relaxa o corpo/)
    expect(choice).toMatch(/você tocou em/)
    expect(ok).toMatch(/acertou/)
    expect(miss).toMatch(/Ainda não/)
    expect(miss.toLowerCase()).not.toMatch(/burro|idiota|fracasso/)
  })

  it('é idempotente se o texto já estiver na persona', () => {
    const once = toFlirtySpeech('print mostra na tela', 'prompt')
    expect(toFlirtySpeech(once, 'prompt')).toBe(once)
  })

  it('coloca pausa onde havia quebra de linha', () => {
    expect(withBreathPauses('a\nb')).toBe('a... b')
  })

  it('não altera o texto visível do currículo', () => {
    const first = LEVELS[0]?.units[0]
    expect(first?.theory.concept.startsWith('Sss...')).toBe(false)
    expect(first?.theory.concept.toLowerCase()).not.toMatch(/tesão|no seu ouvido/)
    expect(first?.exercises[0]?.prompt.startsWith('Sss...')).toBe(false)
  })
})
