import { describe, expect, it } from 'vitest'
import {
  TTS_PITCH,
  TTS_RATE,
  TTS_VOLUME,
  formatVoiceLabel,
  isFranciscaOrThalia,
  isNeuralLike,
  pickBestVoice,
  scoreVoice,
  type VoiceLike,
} from './tts'

function voice(partial: Partial<VoiceLike> & Pick<VoiceLike, 'name' | 'lang'>): VoiceLike {
  return {
    localService: true,
    voiceURI: partial.voiceURI ?? partial.name,
    ...partial,
  }
}

describe('constantes de áudio', () => {
  it('usa fala lenta, tom um pouco mais grave e volume cheio', () => {
    expect(TTS_RATE).toBe(0.85)
    expect(TTS_PITCH).toBe(0.9)
    expect(TTS_VOLUME).toBe(1)
  })
})

describe('scoreVoice / pickBestVoice', () => {
  const franciscaNeural = voice({
    name: 'Microsoft Francisca Online (Natural) - Portuguese (Brazil)',
    lang: 'pt-BR',
    voiceURI: 'pt-BR-FranciscaNeural',
    localService: false,
  })
  const thaliaNeural = voice({
    name: 'Microsoft Thalia Online (Natural) - Portuguese (Brazil)',
    lang: 'pt-BR',
    voiceURI: 'Microsoft ThaliaNeural pt-BR',
    localService: false,
  })
  const franciscaPtBr = voice({ name: 'Francisca', lang: 'pt-BR' })
  const lucianaEnhanced = voice({ name: 'Luciana (Enhanced)', lang: 'pt-BR' })
  const lucianaCompact = voice({ name: 'Luciana (Compact)', lang: 'pt-BR' })
  const googlePt = voice({ name: 'Google português do Brasil', lang: 'pt-BR' })
  const joanaPt = voice({ name: 'Joana (Enhanced)', lang: 'pt-PT' })
  const daniel = voice({ name: 'Daniel (Enhanced)', lang: 'pt-BR' })
  const samanthaNeural = voice({ name: 'Samantha (Premium)', lang: 'en-US' })
  const espeak = voice({ name: 'eSpeak compact', lang: 'en-GB' })

  it('reconhece FranciscaNeural / ThaliaNeural pelo nome ou URI', () => {
    expect(isFranciscaOrThalia(franciscaNeural)).toBe(true)
    expect(isFranciscaOrThalia(thaliaNeural)).toBe(true)
    expect(isFranciscaOrThalia(franciscaPtBr)).toBe(true)
    expect(isFranciscaOrThalia(lucianaEnhanced)).toBe(false)
  })

  it('prioriza FranciscaNeural acima de qualquer outra neural pt-BR', () => {
    const picked = pickBestVoice([lucianaEnhanced, googlePt, franciscaNeural, daniel])
    expect(picked?.name).toBe(franciscaNeural.name)
    expect(scoreVoice(franciscaNeural)).toBeGreaterThan(scoreVoice(lucianaEnhanced))
  })

  it('prioriza ThaliaNeural quando Francisca não existe', () => {
    const picked = pickBestVoice([lucianaEnhanced, thaliaNeural, googlePt])
    expect(picked?.name).toBe(thaliaNeural.name)
  })

  it('prioriza Francisca pt-BR mesmo sem o sufixo Neural', () => {
    const picked = pickBestVoice([lucianaEnhanced, franciscaPtBr])
    expect(picked?.name).toBe('Francisca')
  })

  it('cai na melhor neural feminina pt-BR se a Microsoft não existir', () => {
    const picked = pickBestVoice([daniel, lucianaCompact, lucianaEnhanced, samanthaNeural])
    expect(picked?.name).toBe('Luciana (Enhanced)')
    expect(isNeuralLike(picked!)).toBe(true)
  })

  it('não trava e não exige Francisca/Thalia no iPhone', () => {
    const picked = pickBestVoice([lucianaCompact, lucianaEnhanced])
    expect(picked).not.toBeNull()
    expect(isFranciscaOrThalia(picked!)).toBe(false)
  })

  it('evita compact/eloquence/legacy quando há neural', () => {
    const picked = pickBestVoice([lucianaCompact, samanthaNeural])
    expect(picked?.name).toBe('Samantha (Premium)')
    expect(scoreVoice(lucianaEnhanced)).toBeGreaterThan(scoreVoice(lucianaCompact))
  })

  it('prefere neural pt-PT a neural em outro idioma', () => {
    const picked = pickBestVoice([samanthaNeural, joanaPt])
    expect(picked?.name).toBe('Joana (Enhanced)')
  })

  it('usa compacta pt-BR só se não houver neural', () => {
    const picked = pickBestVoice([lucianaCompact, espeak])
    expect(picked?.name).toBe('Luciana (Compact)')
  })

  it('rotula voz neural no texto visível', () => {
    expect(formatVoiceLabel(franciscaNeural, true)).toBe(`voz neural (${franciscaNeural.name})`)
    expect(formatVoiceLabel(lucianaEnhanced, true)).toBe('voz neural (Luciana (Enhanced))')
    expect(formatVoiceLabel(lucianaCompact, true)).toBe('voz compacta (Luciana (Compact))')
  })
})
