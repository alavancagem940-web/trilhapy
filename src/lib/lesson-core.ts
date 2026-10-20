export const THEORY_CARD_TITLE = 'Explicação Teórica Prática'

export type ExerciseType = 'multiple_choice' | 'fill_blank' | 'order_code'
export type UnitKind = 'lesson' | 'challenge'
export type NormalizeMode = 'text' | 'code'

export type TheoryExample = {
  caption: string
  code: string
  output?: string
}

export type Theory = {
  concept: string
  syntax: string
  syntaxCode: string
  examples: TheoryExample[]
  speak: string
}

export type Exercise = {
  id: string
  type: ExerciseType
  prompt: string
  explainCorrect: string
  explainWrong: string
  speak?: string
  choices: string[]
  answer: string | string[]
  accepted: string[]
  lines: string[]
  normalize: NormalizeMode
}

export type Unit = {
  id: string
  title: string
  subtitle: string
  kind: UnitKind
  xpReward: number
  theory: Theory
  exercises: Exercise[]
}

export type Level = {
  id: string
  order: number
  band: string
  title: string
  description: string
  units: Unit[]
}

export type CheckResult = {
  correct: boolean
  message: string
}

export function spokenPrompt(exercise: Exercise): string {
  return exercise.speak ?? exercise.prompt
}

/** Reads code as it appears on the card, noting indented lines. */
export function spokenVisibleCode(code: string): string {
  return code
    .split('\n')
    .map((line) => {
      if (!line.trim()) return ''
      if (/^ +/.test(line)) return `recuado, ${line.trim()}`
      return line.trim()
    })
    .filter(Boolean)
    .join('. ')
}

/**
 * Spoken copy of the on-screen Explicação Teórica Prática, in card order.
 * Does not use `theory.speak` (that field is a short leftover summary).
 */
export function spokenTheory(unit: Unit): string {
  const theory = unit.theory
  const parts: string[] = [THEORY_CARD_TITLE]
  if (unit.subtitle.trim()) parts.push(unit.subtitle)
  parts.push('1. Conceito.', theory.concept)
  parts.push('2. Sintaxe.', theory.syntax)
  if (theory.syntaxCode.trim()) parts.push(spokenVisibleCode(theory.syntaxCode))
  parts.push('3. Exemplos.')
  for (const example of theory.examples) {
    if (example.caption.trim()) parts.push(example.caption)
    if (example.code.trim()) parts.push(spokenVisibleCode(example.code))
    if (example.output?.trim()) {
      parts.push('Saída.', spokenVisibleCode(example.output))
    }
  }
  return parts.join(' ')
}

export function theory(spec: Theory): Theory {
  return spec
}

export function mc(
  id: string,
  prompt: string,
  choices: readonly string[],
  answer: string,
  explainCorrect: string,
  explainWrong: string,
  speak?: string,
): Exercise {
  if (!choices.includes(answer)) {
    throw new Error(`Resposta '${answer}' não está nas alternativas de ${id}`)
  }
  return {
    id,
    type: 'multiple_choice',
    prompt,
    choices: [...choices],
    answer,
    accepted: [],
    lines: [],
    explainCorrect,
    explainWrong,
    speak,
    normalize: 'text',
  }
}

export function fill(
  id: string,
  prompt: string,
  accepted: readonly string[],
  explainCorrect: string,
  explainWrong: string,
  speak?: string,
  normalize: NormalizeMode = 'code',
): Exercise {
  return {
    id,
    type: 'fill_blank',
    prompt,
    choices: [],
    answer: accepted[0] ?? '',
    accepted: [...accepted],
    lines: [],
    explainCorrect,
    explainWrong,
    speak,
    normalize,
  }
}

export function order(
  id: string,
  prompt: string,
  lines: readonly string[],
  explainCorrect: string,
  explainWrong: string,
  speak?: string,
): Exercise {
  return {
    id,
    type: 'order_code',
    prompt,
    choices: [],
    answer: [...lines],
    accepted: [],
    lines: [...lines],
    explainCorrect,
    explainWrong,
    speak,
    normalize: 'code',
  }
}

function tidyInput(value: string): string {
  return value
    .replace(/[\u200b\u200c\u200d\ufeff]/g, '')
    .replace(/\u00a0|\u202f|\u2007/g, ' ')
    .replace(/\uff1d/g, '=')
    .replace(/\u201c|\u201d|\u2018|\u2019/g, "'")
    .trim()
}

function normText(value: string): string {
  return tidyInput(value).toLowerCase().replace(/\s+/g, ' ')
}

function normCode(value: string): string {
  const text = tidyInput(value)
    .toLowerCase()
    .replace(/[.;]+$/g, '')
    .replaceAll('"', "'")
    .replaceAll('“', "'")
    .replaceAll('”', "'")
    .replaceAll('‘', "'")
    .replaceAll('’', "'")
    .replaceAll('«', "'")
    .replaceAll('»', "'")
  return text.replace(/\s+/g, '')
}

/** Also accept `nome = "Ana"` or `Ana` when the blank lists `"Ana"`. */
const ASSIGN_PREFIX = /^[a-z_][\w.]*\s*=\s*/

function unwrapQuotes(value: string): string {
  if (value.length < 2) return value
  const start = value[0]
  const end = value[value.length - 1]
  if ((start === "'" && end === "'") || (start === '"' && end === '"')) {
    return value.slice(1, -1)
  }
  return value
}

function fillVariants(normalized: string): string[] {
  const values = new Set<string>([normalized])
  const withoutAssign = normalized.replace(ASSIGN_PREFIX, '')
  if (withoutAssign !== normalized && withoutAssign.length > 0) {
    values.add(withoutAssign)
  }
  for (const current of [...values]) {
    const unquoted = unwrapQuotes(current)
    if (unquoted !== current && unquoted.length > 0) values.add(unquoted)
  }
  return [...values]
}

function fillMatches(accepted: readonly string[], submission: string, norm: (value: string) => string): boolean {
  const got = fillVariants(norm(submission))
  return accepted.some((item) => {
    const want = fillVariants(norm(item))
    return got.some((value) => want.includes(value))
  })
}

function fillWrongMessage(exercise: Exercise, submission: string): string {
  const reason = exercise.explainWrong.trim()
  const typed = submission.trim()
  const examples = [...new Set(exercise.accepted)].slice(0, 3).join(', ')
  if (!typed) return reason
  return `${reason} Você digitou: ${typed}. Formas que passam: ${examples}.`
}

export function checkAnswer(exercise: Exercise, submission: unknown): CheckResult {
  let ok = false
  if (exercise.type === 'multiple_choice') {
    ok = String(submission) === String(exercise.answer)
  } else if (exercise.type === 'fill_blank') {
    const norm = exercise.normalize === 'code' ? normCode : normText
    ok = fillMatches(exercise.accepted, String(submission), norm)
  } else if (exercise.type === 'order_code') {
    const got = Array.isArray(submission) ? submission.map(String) : []
    const expected = exercise.lines
    ok = got.length === expected.length && got.every((line, i) => line === expected[i])
  }
  const message = ok
    ? exercise.explainCorrect
    : exercise.type === 'fill_blank'
      ? fillWrongMessage(exercise, String(submission))
      : exercise.explainWrong
  return { correct: ok, message }
}

export function challengePassThreshold(total: number): number {
  return Math.max(1, Math.ceil(total * 0.75))
}

const PLACEHOLDER = /lorem ipsum|#\s*todo\b|#\s*placeholder|\.{3}/i
const PYTHONISH = /(=|print|def |if |for |while |class |return|try:|except|in |and |or |not |append|len\(|range\(|int\(|str\(|True|False|Path|self\.)/

export function assertTheoryComplete(unitId: string, spec: Theory): void {
  if (spec.concept.trim().length < 40) {
    throw new Error(`Unidade ${unitId}: conceito teórico curto demais.`)
  }
  if (spec.syntax.trim().length < 40) {
    throw new Error(`Unidade ${unitId}: sintaxe teórica curta demais.`)
  }
  if (!spec.syntaxCode.trim()) {
    throw new Error(`Unidade ${unitId}: falta o bloco de sintaxe.`)
  }
  if (spec.examples.length < 1) {
    throw new Error(`Unidade ${unitId}: precisa de exemplo de código.`)
  }
  if (spec.speak.trim().length < 20) {
    throw new Error(`Unidade ${unitId}: texto falado da teoria curto demais.`)
  }
  for (const example of spec.examples) {
    if (!example.code.trim() || !PYTHONISH.test(example.code)) {
      throw new Error(`Unidade ${unitId}: exemplo precisa ser Python real.`)
    }
    if (PLACEHOLDER.test(example.code)) {
      throw new Error(`Unidade ${unitId}: exemplo com placeholder.`)
    }
  }
}

export function assertExplanation(exercise: Exercise): void {
  if (exercise.explainCorrect.trim().length < 40) {
    throw new Error(`Exercício ${exercise.id}: explainCorrect curto demais.`)
  }
  if (exercise.explainWrong.trim().length < 40) {
    throw new Error(`Exercício ${exercise.id}: explainWrong curto demais.`)
  }
  if (/^(certo|ok|isso|parabéns)!?$/i.test(exercise.explainCorrect.trim())) {
    throw new Error(`Exercício ${exercise.id}: acerto sem explicar o motivo.`)
  }
  if (/^(errado|incorreto|não|ainda não)!?\.?$/i.test(exercise.explainWrong.trim())) {
    throw new Error(`Exercício ${exercise.id}: erro sem explicar o motivo correto.`)
  }
}
