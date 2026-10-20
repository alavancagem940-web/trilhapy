import { describe, expect, it } from 'vitest'
import { LEVELS } from './lessons'
import { STORAGE_KEY, ProgressStore, createMemoryStorage } from './progress'

describe('progresso', () => {
  it('libera só a primeira lição no começo', () => {
    const store = new ProgressStore(createMemoryStorage())
    store.load()
    const first = LEVELS[0]
    expect(first).toBeTruthy()
    if (!first) return
    expect(store.isLevelUnlocked(first.id)).toBe(true)
    expect(store.isUnitUnlocked(first.id, first.units[0]!.id)).toBe(true)
    expect(store.isUnitUnlocked(first.id, first.units[1]!.id)).toBe(false)
    expect(store.isLevelUnlocked(LEVELS[1]!.id)).toBe(false)
  })

  it('só abre o próximo nível depois do desafio', () => {
    const store = new ProgressStore(createMemoryStorage())
    store.load()
    const n1 = LEVELS[0]!
    for (const unit of n1.units) {
      if (unit.kind !== 'challenge') store.markUnitComplete(unit.id, 20)
    }
    expect(store.isUnitUnlocked(n1.id, n1.units.at(-1)!.id)).toBe(true)
    expect(store.isLevelUnlocked(LEVELS[1]!.id)).toBe(false)
    store.markChallengePassed(n1.id, n1.units.at(-1)!.id, 40)
    expect(store.isLevelUnlocked(LEVELS[1]!.id)).toBe(true)
    expect(store.isUnitUnlocked(LEVELS[1]!.id, LEVELS[1]!.units[0]!.id)).toBe(true)
  })

  it('persiste XP sem corações', () => {
    const storage = createMemoryStorage()
    const store = new ProgressStore(storage)
    store.load()
    store.addXp(10)
    expect(store.xp).toBe(10)
    expect('hearts' in store).toBe(false)
    const payload = JSON.parse(storage.getItem(STORAGE_KEY) ?? '{}') as Record<string, unknown>
    expect(payload.xp).toBe(10)
    expect(payload).not.toHaveProperty('hearts')
    expect(payload).not.toHaveProperty('hearts_updated_at')
  })

  it('ignora chaves antigas de vidas', () => {
    const storage = createMemoryStorage({
      [STORAGE_KEY]: JSON.stringify({
        xp: 30,
        hearts: 1,
        hearts_updated_at: 1,
        completed_units: ['n1_logica_variaveis'],
        passed_challenges: [],
      }),
    })
    const store = new ProgressStore(storage)
    store.load()
    expect(store.xp).toBe(30)
    expect(store.completedUnits).toEqual(['n1_logica_variaveis'])
    store.save()
    const payload = JSON.parse(storage.getItem(STORAGE_KEY) ?? '{}') as Record<string, unknown>
    expect(payload).not.toHaveProperty('hearts')
    expect(payload).not.toHaveProperty('hearts_updated_at')
  })

  it('não soma bônus de lição duas vezes', () => {
    const store = new ProgressStore(createMemoryStorage())
    store.load()
    store.markUnitComplete('n1_logica_variaveis', 20)
    store.markUnitComplete('n1_logica_variaveis', 20)
    expect(store.xp).toBe(20)
  })
})
