import { LEVELS, spokenPrompt, spokenTheory } from './lessons'
import { type SpeakKind, toSpokenText } from './speech-persona'

/** Web Speech fallback: natural didactic narration. */
export const TTS_RATE = 1
export const TTS_PITCH = 1
export const TTS_VOLUME = 1
export const TTS_LANG = 'pt-BR'

/** Microsoft SSML at the neural default — natural classroom narration. */
export const SSML_RATE = '+0%'
export const SSML_PITCH = '+0Hz'

export const VOICE_STORAGE_KEY = 'trilhapy.neuralVoice'
export const HAPPY_PATH_ENGINE = 'microsoft-neural-audio' as const

export type NeuralVoiceId =
  | 'pt-BR-FranciscaNeural'
  | 'pt-BR-GiovannaNeural'
  | 'pt-BR-YaraNeural'
  | 'pt-BR-ThalitaNeural'
  | 'pt-BR-ManuelaNeural'

export type NeuralVoice = {
  id: NeuralVoiceId
  /** Name shown in the picker — requested Portuguese given names, not a clone. */
  label: string
  blurb: string
}

/**
 * Default: Francisca. Adult, clear, Brazilian Portuguese, not childish.
 * Microsoft neural catalog voice — not a clone of any dubber and not a model
 * named after one. Giovanna/Yara/Manuela synthesize on Bing; Thalia is
 * Microsoft's ThalitaNeural (pt-BR-ThaliaNeural returns no audio).
 */
export const DEFAULT_VOICE_ID: NeuralVoiceId = 'pt-BR-FranciscaNeural'

export const DEFAULT_VOICE_WHY =
  'Francisca é a neural feminina pt-BR adulta, clara e estável da Microsoft — ' +
  'não infantil, com narração didática no ritmo natural. ' +
  'Não é clone da Luísa Viotti. Giovanna, Yara e Manuela entram na lista para troca; ' +
  'Thalia usa ThalitaNeural (o id ThaliaNeural não sintetiza).'

export const NEURAL_VOICES: readonly NeuralVoice[] = [
  {
    id: 'pt-BR-FranciscaNeural',
    label: 'Francisca',
    blurb: 'Padrão. Adulta, clara, pt-BR, narração didática.',
  },
  {
    id: 'pt-BR-GiovannaNeural',
    label: 'Giovanna',
    blurb: 'Neural feminina pt-BR, timbre um pouco mais cheio.',
  },
  {
    id: 'pt-BR-YaraNeural',
    label: 'Yara',
    blurb: 'Neural feminina pt-BR, leitura mais alongada.',
  },
  {
    id: 'pt-BR-ThalitaNeural',
    label: 'Thalia',
    blurb: 'ThalitaNeural da Microsoft (o nome Thalia da lista).',
  },
  {
    id: 'pt-BR-ManuelaNeural',
    label: 'Manuela',
    blurb: 'Neural feminina pt-BR, outra opção da lista.',
  },
]

export function isNeuralVoiceId(value: string): value is NeuralVoiceId {
  return NEURAL_VOICES.some((voice) => voice.id === value)
}

export function voiceById(id: string | null | undefined): NeuralVoice {
  if (id && isNeuralVoiceId(id)) {
    const found = NEURAL_VOICES.find((voice) => voice.id === id)
    if (found) return found
  }
  return NEURAL_VOICES[0]!
}

export function readStoredVoiceId(): NeuralVoiceId {
  if (typeof window === 'undefined') return DEFAULT_VOICE_ID
  try {
    return voiceById(window.localStorage.getItem(VOICE_STORAGE_KEY)).id
  } catch {
    return DEFAULT_VOICE_ID
  }
}

export function persistVoiceId(id: NeuralVoiceId): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(VOICE_STORAGE_KEY, id)
  } catch {
    // Private mode can block storage; in-memory selection still works.
  }
}

export function escapeSsmlText(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

export function buildSsml(text: string, voice: NeuralVoiceId = DEFAULT_VOICE_ID): string {
  const body = escapeSsmlText(text.trim())
  return (
    `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${TTS_LANG}">` +
    `<voice name="${voice}">` +
    `<prosody rate="${SSML_RATE}" pitch="${SSML_PITCH}">${body}</prosody>` +
    `</voice></speak>`
  )
}

export function ttsCacheFingerprint(voice: NeuralVoiceId, spoken: string): string {
  return `v2|${voice}|${SSML_RATE}|${SSML_PITCH}|${spoken}`
}

export async function sha256Hex(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

export async function ttsAssetHash(voice: NeuralVoiceId, spoken: string): Promise<string> {
  return sha256Hex(ttsCacheFingerprint(voice, spoken))
}

export function ttsAssetPath(voice: NeuralVoiceId, hash: string): string {
  return `tts/${voice}/${hash}.mp3`
}

export function isMpegBuffer(data: ArrayBuffer | Uint8Array): boolean {
  const bytes = data instanceof Uint8Array ? data : new Uint8Array(data)
  if (bytes.length < 3) return false
  if (bytes[0] === 0xff && (bytes[1]! & 0xe0) === 0xe0) return true
  return bytes[0] === 0x49 && bytes[1] === 0x44 && bytes[2] === 0x33
}

export type SpokenLine = {
  kind: SpeakKind
  source: string
  spoken: string
}

export function collectSpokenLines(): SpokenLine[] {
  const seen = new Set<string>()
  const lines: SpokenLine[] = []

  const add = (source: string, kind: SpeakKind) => {
    const spoken = toSpokenText(source)
    if (!spoken || seen.has(spoken)) return
    seen.add(spoken)
    lines.push({ kind, source, spoken })
  }

  for (const level of LEVELS) {
    for (const unit of level.units) {
      add(spokenTheory(unit), 'theory')
      for (const exercise of unit.exercises) {
        add(spokenPrompt(exercise), 'prompt')
        for (const choice of exercise.choices) add(choice, 'choice')
        for (const line of exercise.lines) add(line, 'choice')
        add(exercise.explainCorrect, 'feedback-correct')
        add(exercise.explainWrong, 'feedback-wrong')
      }
    }
  }
  return lines
}
