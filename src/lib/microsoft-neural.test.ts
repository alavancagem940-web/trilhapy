import { describe, expect, it } from 'vitest'
import { LEVELS } from './lessons'
import {
  DEFAULT_VOICE_ID,
  DEFAULT_VOICE_WHY,
  NEURAL_VOICES,
  SSML_PITCH,
  SSML_RATE,
  TTS_PITCH,
  TTS_RATE,
  buildSsml,
  collectSpokenLines,
  isMpegBuffer,
  isNeuralVoiceId,
  ttsAssetHash,
  ttsCacheFingerprint,
  voiceById,
} from './microsoft-neural'

describe('voz neural Microsoft', () => {
  it('escolhe Francisca como padrão adulta/grave/clara pt-BR, sem clonar dubladora', () => {
    expect(DEFAULT_VOICE_ID).toBe('pt-BR-FranciscaNeural')
    expect(NEURAL_VOICES.map((voice) => voice.label)).toEqual([
      'Francisca',
      'Giovanna',
      'Yara',
      'Thalia',
      'Manuela',
    ])
    expect(NEURAL_VOICES[0]?.id).toBe('pt-BR-FranciscaNeural')
    expect(DEFAULT_VOICE_WHY.toLowerCase()).toMatch(/francisca/)
    expect(DEFAULT_VOICE_WHY.toLowerCase()).not.toMatch(/fish audio|luísa viotti neural/)
    expect(DEFAULT_VOICE_WHY.toLowerCase()).not.toMatch(/clonar a voz/)
    expect(voiceById('pt-BR-ThalitaNeural').label).toBe('Thalia')
    expect(isNeuralVoiceId('pt-BR-GiovannaNeural')).toBe(true)
    expect(isNeuralVoiceId('pt-BR-ThaliaNeural')).toBe(false)
  })

  it('mantém fala lenta e um pouco grave no SSML da Microsoft', () => {
    expect(TTS_RATE).toBe(0.8)
    expect(TTS_PITCH).toBe(0.82)
    expect(SSML_RATE).toBe('-20%')
    expect(SSML_PITCH).toBe('-8Hz')
    const ssml = buildSsml('Olá <mundo> & cia', 'pt-BR-FranciscaNeural')
    expect(ssml).toContain('name="pt-BR-FranciscaNeural"')
    expect(ssml).toContain('rate="-20%"')
    expect(ssml).toContain('pitch="-8Hz"')
    expect(ssml).toContain('Olá &lt;mundo&gt; &amp; cia')
  })

  it('coleta falas da persona sem reescrever o currículo na tela', () => {
    const lines = collectSpokenLines()
    expect(lines.length).toBeGreaterThan(40)
    expect(lines.some((line) => line.kind === 'theory')).toBe(true)
    expect(lines.some((line) => line.kind === 'prompt')).toBe(true)
    const first = LEVELS[0]?.units[0]
    expect(first?.theory.concept.startsWith('Sss...')).toBe(false)
    expect(lines.some((line) => line.spoken.includes(first?.theory.speak ?? '---'))).toBe(true)
  })

  it('gera hash estável para o MPEG empacotado', async () => {
    const a = await ttsAssetHash('pt-BR-FranciscaNeural', 'oi')
    const b = await ttsAssetHash('pt-BR-FranciscaNeural', 'oi')
    const c = await ttsAssetHash('pt-BR-GiovannaNeural', 'oi')
    expect(a).toBe(b)
    expect(a).not.toBe(c)
    expect(a).toMatch(/^[a-f0-9]{64}$/)
    expect(ttsCacheFingerprint('pt-BR-FranciscaNeural', 'oi')).toContain(SSML_PITCH)
  })

  it('reconhece cabeçalho MPEG', () => {
    expect(isMpegBuffer(new Uint8Array([0xff, 0xf3, 0x48, 0xc4]))).toBe(true)
    expect(isMpegBuffer(new Uint8Array([0x49, 0x44, 0x33, 0x04]))).toBe(true)
    expect(isMpegBuffer(new Uint8Array([0x00, 0x01]))).toBe(false)
  })
})
