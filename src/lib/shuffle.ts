/** Fisher-Yates. A new call is a new attempt, so the correct option moves. */
export function shuffledChoices(choices: readonly string[], random: () => number = Math.random): string[] {
  const pool = [...choices]
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1))
    const current = pool[i]!
    pool[i] = pool[j]!
    pool[j] = current
  }
  if (pool.length > 1 && pool.every((item, index) => item === choices[index])) {
    const first = pool[0]!
    pool[0] = pool[1]!
    pool[1] = first
  }
  return pool
}
