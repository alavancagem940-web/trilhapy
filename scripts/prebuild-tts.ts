import { mkdir, stat, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { synthesizeBingSsmlCached } from './bing-tts'
import {
  NEURAL_VOICES,
  buildSsml,
  collectSpokenLines,
  ttsAssetHash,
  ttsAssetPath,
  type NeuralVoiceId,
} from '../src/lib/microsoft-neural'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const publicDir = join(root, 'public')

const CONCURRENCY = 4

async function mapPool<T>(items: T[], limit: number, worker: (item: T, index: number) => Promise<void>): Promise<void> {
  let next = 0
  async function run(): Promise<void> {
    while (next < items.length) {
      const index = next
      next += 1
      await worker(items[index]!, index)
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => run()))
}

async function main(): Promise<void> {
  const lines = collectSpokenLines()
  const jobs: { voice: NeuralVoiceId; spoken: string }[] = []
  for (const voice of NEURAL_VOICES) {
    for (const line of lines) {
      jobs.push({ voice: voice.id, spoken: line.spoken })
    }
  }
  console.log(`prebuild-tts: ${lines.length} falas × ${NEURAL_VOICES.length} vozes = ${jobs.length} MPEG`)

  let done = 0
  await mapPool(jobs, CONCURRENCY, async (job) => {
    const hash = await ttsAssetHash(job.voice, job.spoken)
    const rel = ttsAssetPath(job.voice, hash)
    const dest = join(publicDir, rel)
    try {
      const existing = await stat(dest)
      if (existing.size > 500) {
        done += 1
        if (done % 25 === 0 || done === jobs.length) {
          console.log(`prebuild-tts: ${done}/${jobs.length} (cache)`)
        }
        return
      }
    } catch {
      // generate
    }
    const ssml = buildSsml(job.spoken, job.voice)
    let mpeg: Uint8Array | null = null
    let lastError: unknown
    for (let attempt = 0; attempt < 4; attempt += 1) {
      try {
        mpeg = await synthesizeBingSsmlCached(ssml)
        break
      } catch (error) {
        lastError = error
        await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)))
      }
    }
    if (!mpeg) throw lastError instanceof Error ? lastError : new Error('tts failed')
    await mkdir(dirname(dest), { recursive: true })
    await writeFile(dest, mpeg)
    done += 1
    if (done % 25 === 0 || done === jobs.length) {
      console.log(`prebuild-tts: ${done}/${jobs.length}`)
    }
  })
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
