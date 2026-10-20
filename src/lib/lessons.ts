import { LEVELS } from './curriculum'
import {
  assertExplanation,
  assertTheoryComplete,
  type Exercise,
  type Level,
  type Unit,
} from './lesson-core'

export { LEVELS }
export {
  THEORY_CARD_TITLE,
  challengePassThreshold,
  checkAnswer,
  spokenPrompt,
  spokenTheory,
  spokenVisibleCode,
  type CheckResult,
  type Exercise,
  type ExerciseType,
  type Level,
  type NormalizeMode,
  type Theory,
  type TheoryExample,
  type Unit,
  type UnitKind,
} from './lesson-core'

export function getLevel(levelId: string): Level | undefined {
  return LEVELS.find((level) => level.id === levelId)
}

export function unitById(unitId: string): Unit | undefined {
  for (const [, unit] of iterUnits()) {
    if (unit.id === unitId) return unit
  }
  return undefined
}

export function levelForUnit(unitId: string): Level | undefined {
  for (const [level, unit] of iterUnits()) {
    if (unit.id === unitId) return level
  }
  return undefined
}

export function* iterUnits(): Generator<[Level, Unit]> {
  for (const level of LEVELS) {
    for (const unit of level.units) {
      yield [level, unit]
    }
  }
}

export function validateCurriculum(): void {
  if (LEVELS.length === 0) throw new Error('Currículo vazio.')
  const seenUnits = new Set<string>()
  const seenExercises = new Set<string>()
  for (const level of LEVELS) {
    if (level.units.length === 0) throw new Error(`Nível ${level.id} sem unidades.`)
    if (level.units[level.units.length - 1]?.kind !== 'challenge') {
      throw new Error(`Nível ${level.id} precisa terminar com um desafio.`)
    }
    if (!level.units.some((unit) => unit.kind === 'lesson')) {
      throw new Error(`Nível ${level.id} precisa de pelo menos uma lição.`)
    }
    for (const unit of level.units) {
      if (seenUnits.has(unit.id)) throw new Error(`Unidade duplicada: ${unit.id}`)
      seenUnits.add(unit.id)
      if (unit.exercises.length < 3) {
        throw new Error(`Unidade ${unit.id} precisa de pelo menos 3 exercícios.`)
      }
      assertTheoryComplete(unit.id, unit.theory)
      for (const exercise of unit.exercises) {
        if (seenExercises.has(exercise.id)) throw new Error(`Exercício duplicado: ${exercise.id}`)
        seenExercises.add(exercise.id)
        assertExplanation(exercise)
        if (exercise.type === 'multiple_choice' && !exercise.choices.includes(String(exercise.answer))) {
          throw new Error(`Alternativa inválida em ${exercise.id}`)
        }
        if (exercise.type === 'fill_blank' && exercise.accepted.length === 0) {
          throw new Error(`Sem respostas aceitas em ${exercise.id}`)
        }
        if (exercise.type === 'order_code' && exercise.lines.length < 2) {
          throw new Error(`Ordem incompleta em ${exercise.id}`)
        }
      }
    }
  }
}

export function findExercise(exerciseId: string): Exercise | undefined {
  for (const [, unit] of iterUnits()) {
    const found = unit.exercises.find((item) => item.id === exerciseId)
    if (found) return found
  }
  return undefined
}
