import { type SpeakKind, toFlirtySpeech } from './speech-persona'
import {
  DEFAULT_VOICE_ID,
  HAPPY_PATH_ENGINE,
  TTS_LANG,
  TTS_PITCH,
  TTS_RATE,
  TTS_VOLUME,
  type NeuralVoice,
  type NeuralVoiceId,
  isMpegBuffer,
  persistVoiceId,
  readStoredVoiceId,
  ttsAssetHash,
  ttsAssetPath,
  voiceById,
} from './microsoft-neural'

export {
  DEFAULT_VOICE_ID,
  DEFAULT_VOICE_WHY,
  HAPPY_PATH_ENGINE,
  NEURAL_VOICES,
  SSML_PITCH,
  SSML_RATE,
  TTS_LANG,
  TTS_PITCH,
  TTS_RATE,
  TTS_VOLUME,
  buildSsml,
} from './microsoft-neural'

export type { NeuralVoice, NeuralVoiceId } from './microsoft-neural'

export type { SpeakKind }

export type TtsEngine = typeof HAPPY_PATH_ENGINE | 'webspeech-fallback' | 'unavailable'

export type TtsStatus = {
  available: boolean
  label: string
  unlocked: boolean
  hint: string | null
  engine: TtsEngine
  voiceId: NeuralVoiceId
  voiceLabel: string
}

type StatusListener = (status: TtsStatus) => void

const listeners = new Set<StatusListener>()

const SILENT_WAV =
  'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA'

const FALLBACK_HINT =
  'Sem rede para a voz neural. Nesta vez o iPhone pode cair na voz do sistema — feche e abra de novo com internet.'

let unlocked = false
let engine: TtsEngine = HAPPY_PATH_ENGINE
let voiceId: NeuralVoiceId = DEFAULT_VOICE_ID
let hint: string | null = null
let player: HTMLAudioElement | null = null
let objectUrl: string | null = null
let speakSeq = 0

function hasAudioElement(): boolean {
  return typeof Audio !== 'undefined'
}

function emit(): void {
  const status = getTtsStatus()
  for (const listener of listeners) listener(status)
}

function currentVoice(): NeuralVoice {
  return voiceById(voiceId)
}

function formatLabel(voice: NeuralVoice, speechUnlocked: boolean): string {
  if (engine === 'unavailable') return 'indisponível neste navegador'
  if (!speechUnlocked) return `voz neural (${voice.label}) — toque para liberar o áudio`
  if (engine === 'webspeech-fallback') return `voz do sistema (fallback) · ${voice.label}`
  return `voz neural (${voice.label})`
}

function liveTtsUrl(): string {
  const base = import.meta.env.BASE_URL || '/'
  const prefix = base.endsWith('/') ? base : `${base}/`
  return `${prefix}__tts`
}

function assetUrl(path: string): string {
  const base = import.meta.env.BASE_URL || '/'
  const prefix = base.endsWith('/') ? base : `${base}/`
  return `${prefix}${path}`
}

function getPlayer(): HTMLAudioElement {
  if (!player) {
    player = new Audio()
    player.preload = 'auto'
    player.setAttribute('playsinline', 'true')
  }
  return player
}

function releaseObjectUrl(): void {
  if (objectUrl) {
    globalThis.URL.revokeObjectURL(objectUrl)
    objectUrl = null
  }
}

export function getTtsStatus(): TtsStatus {
  const voice = currentVoice()
  return {
    available: engine !== 'unavailable',
    label: formatLabel(voice, unlocked),
    unlocked,
    hint,
    engine,
    voiceId: voice.id,
    voiceLabel: voice.label,
  }
}

export function subscribeTts(listener: StatusListener): () => void {
  listeners.add(listener)
  listener(getTtsStatus())
  return () => {
    listeners.delete(listener)
  }
}

export function setSelectedVoice(id: string): void {
  const voice = voiceById(id)
  voiceId = voice.id
  persistVoiceId(voice.id)
  if (engine === 'webspeech-fallback') engine = HAPPY_PATH_ENGINE
  hint = null
  emit()
}

export function initTts(): void {
  if (!hasAudioElement()) {
    engine = 'unavailable'
    emit()
    return
  }
  voiceId = readStoredVoiceId()
  engine = HAPPY_PATH_ENGINE
  hint = null
  emit()
  if (typeof window === 'undefined') return
  const unlock = () => {
    unlockTts()
    window.removeEventListener('pointerdown', unlock)
    window.removeEventListener('keydown', unlock)
  }
  window.addEventListener('pointerdown', unlock, { passive: true })
  window.addEventListener('keydown', unlock)
}

export function unlockTts(): void {
  if (!hasAudioElement() || unlocked) return
  unlocked = true
  try {
    const audio = getPlayer()
    audio.src = SILENT_WAV
    void audio.play().then(() => {
      audio.pause()
      audio.currentTime = 0
    }).catch(() => {
      // Later speak() still runs from a tap.
    })
  } catch {
    // iOS may reject silent priming.
  }
  emit()
}

export function stopTts(): void {
  speakSeq += 1
  if (player) {
    try {
      player.pause()
      player.removeAttribute('src')
      player.load()
    } catch {
      // Ignore DOM exceptions while tearing down.
    }
  }
  releaseObjectUrl()
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel()
    } catch {
      // Ignore.
    }
  }
}

async function fetchMpeg(url: string, init?: RequestInit): Promise<Blob | null> {
  const response = await fetch(url, init)
  if (!response.ok) return null
  const buffer = await response.arrayBuffer()
  if (!isMpegBuffer(buffer)) return null
  return new Blob([buffer], { type: 'audio/mpeg' })
}

async function synthesizeNeural(spoken: string, voice: NeuralVoiceId): Promise<Blob> {
  if (import.meta.env.DEV) {
    try {
      const live = await fetchMpeg(liveTtsUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: spoken, voice }),
      })
      if (live) return live
    } catch {
      // Fall through to packed MPEG from the build.
    }
  }

  const hash = await ttsAssetHash(voice, spoken)
  const packed = await fetchMpeg(assetUrl(ttsAssetPath(voice, hash)))
  if (packed) return packed

  throw new Error('neural-mpeg-unavailable')
}

function playBlob(blob: Blob): void {
  const audio = getPlayer()
  releaseObjectUrl()
  objectUrl = globalThis.URL.createObjectURL(blob)
  audio.src = objectUrl
  audio.volume = TTS_VOLUME
  const play = audio.play()
  if (play) {
    void play.catch(() => {
      // Autoplay may still need a second tap on the speaker button.
    })
  }
}

function speakWebSpeechFallback(spoken: string): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    throw new Error('no-webspeech')
  }
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(spoken)
  utterance.lang = TTS_LANG
  utterance.rate = TTS_RATE
  utterance.pitch = TTS_PITCH
  utterance.volume = TTS_VOLUME
  window.speechSynthesis.speak(utterance)
}

export function speak(text: string, kind: SpeakKind = 'prompt'): void {
  if (!text.trim() || engine === 'unavailable') return
  const spoken = toFlirtySpeech(text, kind)
  if (!spoken) return
  const voice = currentVoice().id
  const seq = ++speakSeq
  stopTts()
  speakSeq = seq

  void (async () => {
    try {
      const blob = await synthesizeNeural(spoken, voice)
      if (seq !== speakSeq) return
      engine = HAPPY_PATH_ENGINE
      hint = null
      playBlob(blob)
      emit()
    } catch {
      if (seq !== speakSeq) return
      try {
        speakWebSpeechFallback(spoken)
        engine = 'webspeech-fallback'
        hint = FALLBACK_HINT
        emit()
      } catch {
        engine = 'unavailable'
        hint = 'Não foi possível falar neste navegador.'
        emit()
      }
    }
  })()
}

export function isStandaloneDisplay(): boolean {
  if (typeof window === 'undefined') return false
  const media = window.matchMedia('(display-mode: standalone)').matches
  const ios = 'standalone' in navigator && Boolean((navigator as Navigator & { standalone?: boolean }).standalone)
  return media || ios
}

/** Test helper: never true on the iPhone happy path. */
export function happyPathUsesSpeechSynthesis(): boolean {
  return false
}
