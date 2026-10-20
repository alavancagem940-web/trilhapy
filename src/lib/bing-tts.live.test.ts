import { describe, expect, it } from 'vitest'
import { synthesizeBingSsmlCached } from '../../scripts/bing-tts'
import { DEFAULT_VOICE_ID, NEURAL_VOICES, buildSsml, isMpegBuffer } from './microsoft-neural'

describe('síntese real Microsoft (Bing neural)', () => {
  it(
    'sintetiza Francisca e devolve MPEG',
    async () => {
      const ssml = buildSsml('Olá Marcelo. Teste da voz neural adulta em português do Brasil.', DEFAULT_VOICE_ID)
      const mpeg = await synthesizeBingSsmlCached(ssml)
      expect(isMpegBuffer(mpeg)).toBe(true)
      expect(mpeg.byteLength).toBeGreaterThan(2000)
    },
    30_000,
  )

  it(
    'sintetiza cada voz da lista do usuário',
    async () => {
      for (const voice of NEURAL_VOICES) {
        const mpeg = await synthesizeBingSsmlCached(buildSsml(`Oi, eu sou a ${voice.label}.`, voice.id))
        expect(isMpegBuffer(mpeg), voice.id).toBe(true)
        expect(mpeg.byteLength, voice.id).toBeGreaterThan(1500)
      }
    },
    60_000,
  )
})
