import { describe, expect, it } from 'vitest'
import {
  LEVELS,
  challengePassThreshold,
  checkAnswer,
  iterUnits,
  validateCurriculum,
} from './lessons'

describe('currículo', () => {
  it('valida a trilha completa', () => {
    validateCurriculum()
    expect(LEVELS.map((level) => level.band)).toEqual([
      'Básico',
      'Elementar',
      'Intermediário',
      'Intermediário+',
      'Avançado',
    ])
    expect(LEVELS).toHaveLength(5)
  })

  it('cobre os tópicos do recorte', () => {
    const texts = LEVELS.map((level) => level.description.toLowerCase()).join(' ')
    expect(texts).toMatch(/variáve/)
    expect(LEVELS[0]?.description.toLowerCase()).toContain('print')
    expect(LEVELS[1]?.description.toLowerCase()).toContain('if/else')
    expect(LEVELS[2]?.description.toLowerCase()).toContain('listas')
    expect(LEVELS[3]?.description.toLowerCase()).toMatch(/funç/)
    expect(LEVELS[4]?.description.toLowerCase()).toContain('objetos')
    expect(LEVELS[4]?.description.toLowerCase()).toMatch(/automa/)
  })

  it('termina cada nível com um desafio', () => {
    for (const level of LEVELS) {
      expect(level.units.at(-1)?.kind).toBe('challenge')
      expect(level.units.some((unit) => unit.kind === 'lesson')).toBe(true)
    }
  })

  it('aceita as respostas canônicas', () => {
    for (const [, unit] of iterUnits()) {
      for (const exercise of unit.exercises) {
        const submission =
          exercise.type === 'multiple_choice'
            ? exercise.answer
            : exercise.type === 'fill_blank'
              ? exercise.accepted[0]
              : exercise.lines
        const result = checkAnswer(exercise, submission)
        expect(result.correct, exercise.id).toBe(true)
      }
    }
  })

  it('aceita a linha inteira em preenchimentos do tipo nome = ?', () => {
    const exercise = [...iterUnits()]
      .flatMap(([, unit]) => unit.exercises)
      .find((item) => item.id === 'n1_q3')
    expect(exercise).toBeTruthy()
    if (!exercise) return
    expect(checkAnswer(exercise, 'nome = "Ana"').correct).toBe(true)
    expect(checkAnswer(exercise, "nome='Ana'").correct).toBe(true)
    expect(checkAnswer(exercise, '"Ana"').correct).toBe(true)
    expect(checkAnswer(exercise, 'nome = Ana').correct).toBe(false)
  })

  it('rejeita respostas erradas', () => {
    const exercise = LEVELS[0]?.units[0]?.exercises[0]
    expect(exercise).toBeTruthy()
    if (!exercise) return
    expect(checkAnswer(exercise, 'Fica em casa de qualquer jeito').correct).toBe(false)
    const fill = [...iterUnits()].flatMap(([, unit]) => unit.exercises).find((item) => item.type === 'fill_blank')
    const order = [...iterUnits()].flatMap(([, unit]) => unit.exercises).find((item) => item.type === 'order_code')
    expect(fill).toBeTruthy()
    expect(order).toBeTruthy()
    if (fill) expect(checkAnswer(fill, 'totally-wrong-answer-xxx').correct).toBe(false)
    if (order) expect(checkAnswer(order, [...order.lines].reverse()).correct).toBe(false)
  })

  it('exige cerca de 75% no desafio', () => {
    expect(challengePassThreshold(4)).toBe(3)
    expect(challengePassThreshold(3)).toBe(3)
  })
})
