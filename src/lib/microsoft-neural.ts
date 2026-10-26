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
/** English tokens and sample lines. Not part of the Portuguese voice picker. */
export const NATIVE_VOICE_ID = 'en-US-JennyNeural' as const
export type ClipVoiceId = NeuralVoiceId | typeof NATIVE_VOICE_ID
export const NATIVE_LANG = 'en-US'
export const NATIVE_SSML_RATE = '-10%'
export const NATIVE_SSML_PITCH = '-5Hz'

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

export function buildSsml(text: string, voice: ClipVoiceId = DEFAULT_VOICE_ID): string {
  const native = voice === NATIVE_VOICE_ID
  const lang = native ? NATIVE_LANG : TTS_LANG
  const rate = native ? NATIVE_SSML_RATE : SSML_RATE
  const pitch = native ? NATIVE_SSML_PITCH : SSML_PITCH
  const body = escapeSsmlText(text.trim())
  return (
    `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${lang}">` +
    `<voice name="${voice}">` +
    `<prosody rate="${rate}" pitch="${pitch}">${body}</prosody>` +
    `</voice></speak>`
  )
}

export function ttsCacheFingerprint(voice: ClipVoiceId, spoken: string): string {
  if (voice === NATIVE_VOICE_ID) {
    return `v2|${voice}|${NATIVE_SSML_RATE}|${NATIVE_SSML_PITCH}|${spoken}`
  }
  return `v2|${voice}|${SSML_RATE}|${SSML_PITCH}|${spoken}`
}

/** Sync SHA-256 so iPhone can set `Audio.src` inside the tap, without awaiting SubtleCrypto. */
export function sha256HexSync(value: string): string {
  const bytes = new TextEncoder().encode(value)
  const hash = sha256(bytes)
  return [...hash].map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

export async function sha256Hex(value: string): Promise<string> {
  if (globalThis.crypto?.subtle) {
    const bytes = new TextEncoder().encode(value)
    const digest = await crypto.subtle.digest('SHA-256', bytes)
    return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('')
  }
  return sha256HexSync(value)
}

export function ttsAssetHash(voice: ClipVoiceId, spoken: string): string {
  return sha256HexSync(ttsCacheFingerprint(voice, spoken))
}

function sha256(bytes: Uint8Array): Uint8Array {
  const K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5, 0xd807aa98,
    0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786,
    0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da, 0x983e5152, 0xa831c66d, 0xb00327c8,
    0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
    0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819,
    0xd6990624, 0xf40e3585, 0x106aa070, 0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a,
    0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7,
    0xc67178f2,
  ]
  const bitLen = bytes.length * 8
  const withPad = new Uint8Array(((bytes.length + 9 + 63) & ~63) >>> 0)
  withPad.set(bytes)
  withPad[bytes.length] = 0x80
  const view = new DataView(withPad.buffer)
  view.setUint32(withPad.length - 4, bitLen >>> 0)

  let h0 = 0x6a09e667
  let h1 = 0xbb67ae85
  let h2 = 0x3c6ef372
  let h3 = 0xa54ff53a
  let h4 = 0x510e527f
  let h5 = 0x9b05688c
  let h6 = 0x1f83d9ab
  let h7 = 0x5be0cd19
  const w = new Uint32Array(64)
  const rr = (x: number, n: number) => (x >>> n) | (x << (32 - n))

  for (let offset = 0; offset < withPad.length; offset += 64) {
    for (let i = 0; i < 16; i += 1) w[i] = view.getUint32(offset + i * 4)
    for (let i = 16; i < 64; i += 1) {
      const s0 = rr(w[i - 15]!, 7) ^ rr(w[i - 15]!, 18) ^ (w[i - 15]! >>> 3)
      const s1 = rr(w[i - 2]!, 17) ^ rr(w[i - 2]!, 19) ^ (w[i - 2]! >>> 10)
      w[i] = (w[i - 16]! + s0 + w[i - 7]! + s1) >>> 0
    }
    let a = h0
    let b = h1
    let c = h2
    let d = h3
    let e = h4
    let f = h5
    let g = h6
    let h = h7
    for (let i = 0; i < 64; i += 1) {
      const S1 = rr(e, 6) ^ rr(e, 11) ^ rr(e, 25)
      const ch = (e & f) ^ (~e & g)
      const temp1 = (h + S1 + ch + K[i]! + w[i]!) >>> 0
      const S0 = rr(a, 2) ^ rr(a, 13) ^ rr(a, 22)
      const maj = (a & b) ^ (a & c) ^ (b & c)
      const temp2 = (S0 + maj) >>> 0
      h = g
      g = f
      f = e
      e = (d + temp1) >>> 0
      d = c
      c = b
      b = a
      a = (temp1 + temp2) >>> 0
    }
    h0 = (h0 + a) >>> 0
    h1 = (h1 + b) >>> 0
    h2 = (h2 + c) >>> 0
    h3 = (h3 + d) >>> 0
    h4 = (h4 + e) >>> 0
    h5 = (h5 + f) >>> 0
    h6 = (h6 + g) >>> 0
    h7 = (h7 + h) >>> 0
  }

  const out = new Uint8Array(32)
  const outView = new DataView(out.buffer)
  outView.setUint32(0, h0)
  outView.setUint32(4, h1)
  outView.setUint32(8, h2)
  outView.setUint32(12, h3)
  outView.setUint32(16, h4)
  outView.setUint32(20, h5)
  outView.setUint32(24, h6)
  outView.setUint32(28, h7)
  return out
}

export function ttsAssetPath(voice: ClipVoiceId, hash: string): string {
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
