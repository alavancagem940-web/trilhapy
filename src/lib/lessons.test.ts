import { describe, expect, it } from 'vitest'
import {
  LEVELS,
  THEORY_CARD_TITLE,
  challengePassThreshold,
  checkAnswer,
  findExercise,
  iterUnits,
  spokenTheory,
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

  it('aceita valor, linha completa, espaços extras e maiúsculas no preenchimento', () => {
    const exercise = [...iterUnits()]
      .flatMap(([, unit]) => unit.exercises)
      .find((item) => item.id === 'n1_q3')
    expect(exercise).toBeTruthy()
    if (!exercise) return
    expect(checkAnswer(exercise, 'nome = "Ana"').correct).toBe(true)
    expect(checkAnswer(exercise, "nome='Ana'").correct).toBe(true)
    expect(checkAnswer(exercise, '"Ana"').correct).toBe(true)
    expect(checkAnswer(exercise, 'Ana').correct).toBe(true)
    expect(checkAnswer(exercise, 'nome = Ana').correct).toBe(true)
    expect(checkAnswer(exercise, '  NOME  =  "ANA"  ').correct).toBe(true)
    expect(checkAnswer(exercise, 'Lia').correct).toBe(false)
    const right = checkAnswer(exercise, 'nome = "Ana"')
    expect(right.correct).toBe(true)
    expect(right.message).toBe(exercise.explainCorrect)
    expect(right.message.toLowerCase()).not.toMatch(/ainda não|incorreto|use aspas/)
    const wrong = checkAnswer(exercise, 'Lia')
    expect(wrong.message).toMatch(/Você digitou: Lia/)
    expect(wrong.message).toMatch(/Formas que passam/)
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

  it('coloca Explicação Teórica Prática em todo módulo, com conceito, sintaxe e Python real', () => {
    expect(THEORY_CARD_TITLE).toBe('Explicação Teórica Prática')
    let units = 0
    for (const [, unit] of iterUnits()) {
      units += 1
      expect(unit.theory.concept.length).toBeGreaterThan(40)
      expect(unit.theory.syntax.length).toBeGreaterThan(40)
      expect(unit.theory.syntaxCode).toMatch(/[=:]/)
      expect(unit.theory.examples.length).toBeGreaterThanOrEqual(1)
      for (const example of unit.theory.examples) {
        expect(example.code).toMatch(/print|def |if |for |while |class |return|Path|self\./)
        expect(example.code.toLowerCase()).not.toMatch(/placeholder|lorem|todo/)
        expect(example.code).not.toContain('...')
      }
    }
    expect(units).toBeGreaterThanOrEqual(15)
  })

  it('explica o motivo no acerto e no erro, sem texto genérico', () => {
    for (const [, unit] of iterUnits()) {
      for (const exercise of unit.exercises) {
        const right =
          exercise.type === 'multiple_choice'
            ? exercise.answer
            : exercise.type === 'fill_blank'
              ? exercise.accepted[0]
              : exercise.lines
        const correct = checkAnswer(exercise, right)
        expect(correct.correct, exercise.id).toBe(true)
        expect(correct.message).toBe(exercise.explainCorrect)
        expect(correct.message.length).toBeGreaterThan(40)
        expect(correct.message.toLowerCase()).not.toMatch(/^(certo|ok|isso)!?$/)

        const wrongValue =
          exercise.type === 'multiple_choice'
            ? (exercise.choices.find((choice) => choice !== exercise.answer) ?? '___nope___')
            : exercise.type === 'fill_blank'
              ? 'resposta-propositadamente-errada-xxx'
              : [...exercise.lines].reverse()
        const wrong = checkAnswer(exercise, wrongValue)
        expect(wrong.correct, exercise.id).toBe(false)
        expect(wrong.message).toContain(exercise.explainWrong)
        expect(exercise.explainWrong.length).toBeGreaterThan(40)
        expect(exercise.explainWrong.toLowerCase()).not.toMatch(/^(errado|incorreto|ainda não)!?\.?$/)
      }
    }
  })

  it('no preenchimento, o erro ensina o motivo e ainda mostra o que foi digitado', () => {
    const exercise = findExercise('n1_q3')
    expect(exercise).toBeTruthy()
    if (!exercise) return
    const wrong = checkAnswer(exercise, 'Lia')
    expect(wrong.correct).toBe(false)
    expect(wrong.message).toContain(exercise.explainWrong)
    expect(wrong.message).toMatch(/Você digitou: Lia/)
    expect(wrong.message).toMatch(/Formas que passam/)
    const right = checkAnswer(exercise, 'nome = "Ana"')
    expect(right.message).toBe(exercise.explainCorrect)
    expect(right.message.toLowerCase()).not.toMatch(/ainda não|você digitou/)
  })

  it('a voz da teoria lê o card visível, não o resumo theory.speak', () => {
    const unit = LEVELS[0]?.units[0]
    expect(unit?.id).toBe('n1_logica')
    if (!unit) return
    const spoken = spokenTheory(unit)
    expect(unit.theory.concept).toContain(
      'Programar começa com lógica: uma lista de passos claros. O Python não adivinha o que você quis dizer.',
    )
    expect(spoken.startsWith(THEORY_CARD_TITLE)).toBe(true)
    expect(spoken).toContain('O computador só faz o que está escrito, na ordem dos passos.')
    expect(spoken).toContain('1. Conceito.')
    expect(spoken).toContain(unit.theory.concept)
    expect(spoken).toContain('2. Sintaxe.')
    expect(spoken).toContain(unit.theory.syntax)
    expect(spoken).toContain('3. Exemplos.')
    expect(spoken).toContain('Uma regra do dia a dia virando código')
    expect(spoken).toContain('esta_chovendo = True')
    expect(spoken).toContain('Saída.')
    expect(spoken).toContain('leve o guarda-chuva')
    expect(spoken).toContain('A ordem das linhas muda o resultado')
    expect(spoken).toContain('primeiro o pão')
    expect(spoken).toContain('depois o recheio')
    expect(spoken).not.toBe(unit.theory.speak)
    expect(spoken.indexOf('1. Conceito.')).toBeLessThan(spoken.indexOf('2. Sintaxe.'))
    expect(spoken.indexOf('2. Sintaxe.')).toBeLessThan(spoken.indexOf('3. Exemplos.'))
  })
})
