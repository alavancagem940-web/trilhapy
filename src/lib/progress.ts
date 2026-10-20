import { LEVELS, getLevel, type Level, type Unit } from './lessons'

export const XP_PER_CORRECT = 10
export const STORAGE_KEY = 'trilhapy-progress-v1'

export type StorageLike = {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem?(key: string): void
}

export type ProgressSnapshot = {
  xp: number
  completedUnits: string[]
  passedChallenges: string[]
}

export class ProgressError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ProgressError'
  }
}

const emptySnapshot = (): ProgressSnapshot => ({
  xp: 0,
  completedUnits: [],
  passedChallenges: [],
})

function memoryStorage(): StorageLike {
  const data = new Map<string, string>()
  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => {
      data.set(key, value)
    },
    removeItem: (key) => {
      data.delete(key)
    },
  }
}

export function defaultStorage(): StorageLike {
  try {
    if (typeof localStorage === 'undefined') return memoryStorage()
    const probe = '__trilhapy_probe__'
    localStorage.setItem(probe, '1')
    localStorage.removeItem(probe)
    return localStorage
  } catch {
    return memoryStorage()
  }
}

export class ProgressStore {
  xp = 0
  completedUnits: string[] = []
  passedChallenges: string[] = []
  private storage: StorageLike
  private key: string

  constructor(storage: StorageLike = defaultStorage(), key = STORAGE_KEY) {
    this.storage = storage
    this.key = key
  }

  load(): void {
    const raw = this.storage.getItem(this.key)
    if (!raw) {
      this.save()
      return
    }
    try {
      const data = JSON.parse(raw) as Record<string, unknown>
      this.xp = Number(data.xp ?? 0) || 0
      this.completedUnits = Array.isArray(data.completedUnits)
        ? data.completedUnits.map(String)
        : Array.isArray(data.completed_units)
          ? data.completed_units.map(String)
          : []
      this.passedChallenges = Array.isArray(data.passedChallenges)
        ? data.passedChallenges.map(String)
        : Array.isArray(data.passed_challenges)
          ? data.passed_challenges.map(String)
          : []
    } catch (error) {
      throw new ProgressError(
        `Não foi possível ler o progresso salvo: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  }

  save(): void {
    const payload: ProgressSnapshot = {
      xp: this.xp,
      completedUnits: [...this.completedUnits],
      passedChallenges: [...this.passedChallenges],
    }
    try {
      this.storage.setItem(this.key, JSON.stringify(payload))
    } catch (error) {
      throw new ProgressError(
        `Não foi possível salvar o progresso neste navegador: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  }

  reset(): void {
    const empty = emptySnapshot()
    this.xp = empty.xp
    this.completedUnits = []
    this.passedChallenges = []
    this.save()
  }

  snapshot(): ProgressSnapshot {
    return {
      xp: this.xp,
      completedUnits: [...this.completedUnits],
      passedChallenges: [...this.passedChallenges],
    }
  }

  addXp(amount: number): void {
    this.xp += Math.max(0, amount)
    this.save()
  }

  markUnitComplete(unitId: string, bonusXp: number): void {
    const firstTime = !this.completedUnits.includes(unitId)
    if (firstTime) this.completedUnits.push(unitId)
    this.addXp(firstTime ? bonusXp : 0)
  }

  markChallengePassed(levelId: string, unitId: string, bonusXp: number): void {
    if (!this.completedUnits.includes(unitId)) this.completedUnits.push(unitId)
    const firstTime = !this.passedChallenges.includes(levelId)
    if (firstTime) this.passedChallenges.push(levelId)
    this.addXp(firstTime ? bonusXp : 0)
  }

  isLevelUnlocked(levelId: string): boolean {
    const ids = LEVELS.map((level) => level.id)
    const index = ids.indexOf(levelId)
    if (index < 0) return false
    if (index === 0) return true
    const previous = ids[index - 1]
    return previous !== undefined && this.passedChallenges.includes(previous)
  }

  isUnitUnlocked(levelId: string, unitId: string): boolean {
    if (!this.isLevelUnlocked(levelId)) return false
    const level = getLevel(levelId)
    if (!level) return false
    const previousIds: string[] = []
    for (const unit of level.units) {
      if (unit.id === unitId) {
        return previousIds.every((id) => this.completedUnits.includes(id))
      }
      previousIds.push(unit.id)
    }
    return false
  }

  isUnitComplete(unitId: string): boolean {
    return this.completedUnits.includes(unitId)
  }

  isEmpty(): boolean {
    return this.xp === 0 && this.completedUnits.length === 0
  }

  currentUnit(): { level: Level; unit: Unit } | null {
    for (const level of LEVELS) {
      for (const unit of level.units) {
        if (this.isUnitUnlocked(level.id, unit.id) && !this.completedUnits.includes(unit.id)) {
          return { level, unit }
        }
      }
    }
    return null
  }
}

export function createMemoryStorage(initial?: Record<string, string>): StorageLike {
  const data = new Map<string, string>(Object.entries(initial ?? {}))
  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => {
      data.set(key, value)
    },
    removeItem: (key) => {
      data.delete(key)
    },
  }
}
