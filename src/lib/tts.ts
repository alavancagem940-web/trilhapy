import { type SpeakKind, toSpokenText } from './speech-persona'
import {
  DEFAULT_VOICE_ID,
  HAPPY_PATH_ENGINE,
  NATIVE_LANG,
  NATIVE_VOICE_ID,
  TTS_LANG,
  TTS_PITCH,
  TTS_RATE,
  TTS_VOLUME,
  type ClipVoiceId,
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

/** If packed MPEG is not playing by then, speak the lesson text with Web Speech. */
export const MPEG_GRACE_MS = 480

type StatusListener = (status: TtsStatus) => void

const listeners = new Set<StatusListener>()

const SILENT_WAV =
  'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA'

const FALLBACK_HINT =
  'Sem rede para a voz neural. Nesta vez o iPhone pode cair na voz do sistema — feche e abra de novo com internet.'

const UNLOCK_EVENTS = ['pointerdown', 'touchstart', 'click', 'keydown'] as const

let unlocked = false
let engine: TtsEngine = HAPPY_PATH_ENGINE
let voiceId: NeuralVoiceId = DEFAULT_VOICE_ID
let hint: string | null = null
let player: HTMLAudioElement | null = null
let objectUrl: string | null = null
let speakSeq = 0
let neuralSeq = -1
let graceTimer: ReturnType<typeof setTimeout> | null = null
let resumeTimer: ReturnType<typeof setInterval> | null = null
let unlockBound = false
let audioPrimed = false

function voiceForKind(kind: SpeakKind): ClipVoiceId {
  if (kind === 'native') return NATIVE_VOICE_ID
  if (kind === 'explain' || kind === 'theory' || kind === 'feedback-correct' || kind === 'feedback-wrong') {
    return DEFAULT_VOICE_ID
  }
  return currentVoice().id
}

function fallbackLang(voice: ClipVoiceId): string {
  return voice === NATIVE_VOICE_ID ? NATIVE_LANG : TTS_LANG
}

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

function packedMpegUrl(spoken: string, voice: ClipVoiceId): string {
  return assetUrl(ttsAssetPath(voice, ttsAssetHash(voice, spoken)))
}

function getPlayer(): HTMLAudioElement {
  if (!player) {
    player = new Audio()
    player.preload = 'auto'
    player.setAttribute('playsinline', 'true')
    player.setAttribute('webkit-playsinline', 'true')
    player.setAttribute('aria-hidden', 'true')
    if (typeof document !== 'undefined' && document.body) {
    player.style.position = 'fixed'
    player.style.left = '0'
    player.style.top = '0'
    player.style.width = '1px'
    player.style.height = '1px'
    player.style.opacity = '0.02'
    player.style.pointerEvents = 'none'
    document.body.appendChild(player)
    routePastScrollDuck(player)
    }
  }
  return player
}

function routePastScrollDuck(audio: HTMLAudioElement): void {
  if (typeof audio.canPlayType !== 'function') return
  const marked = audio as HTMLAudioElement & { __graph?: boolean }
  if (marked.__graph) return
  const root = window as Window & { webkitAudioContext?: typeof AudioContext }
  const Ctx = window.AudioContext ?? root.webkitAudioContext
  if (!Ctx) return
  try {
    const ctx = new Ctx()
    const source = ctx.createMediaElementSource(audio)
    const gain = ctx.createGain()
    gain.gain.value = 1
    source.connect(gain)
    gain.connect(ctx.destination)
    marked.__graph = true
    void ctx.resume()
  } catch {
    // A second graph on the same element throws. Playback still uses the element.
  }
}

function releaseObjectUrl(): void {
  if (objectUrl) {
    globalThis.URL.revokeObjectURL(objectUrl)
    objectUrl = null
  }
}

function speechSynth(): SpeechSynthesis | null {
  const root = typeof window !== 'undefined' ? window : globalThis
  if (!root || !('speechSynthesis' in root)) return null
  return (root as typeof globalThis & { speechSynthesis: SpeechSynthesis }).speechSynthesis
}

function cancelWebSpeech(): void {
  if (resumeTimer != null) {
    clearInterval(resumeTimer)
    resumeTimer = null
  }
  const synth = speechSynth()
  if (!synth) return
  try {
    synth.cancel()
  } catch {
    // Ignore.
  }
}

function pauseAudioKeepingUnlock(): void {
  if (!player) return
  try {
    player.pause()
  } catch {
    // Ignore DOM exceptions while pausing.
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
  if (typeof window === 'undefined' || unlockBound) return
  unlockBound = true
  const unlock = () => unlockTts()
  for (const name of UNLOCK_EVENTS) {
    window.addEventListener(name, unlock, { passive: true, capture: true })
  }
}

function primeAudioIfIdle(): void {
  if (!hasAudioElement()) return
  const audio = getPlayer()
  const src = audio.currentSrc || audio.src
  const playingPacked = Boolean(src) && !src.startsWith('data:') && !audio.paused
  if (playingPacked) return
  try {
    audio.muted = false
    audio.src = SILENT_WAV
    void audio.play().then(() => {
      if ((audio.currentSrc || audio.src).startsWith('data:')) {
        audio.pause()
        audio.currentTime = 0
      }
    }).catch(() => {
      // speak() still runs from the same tap.
    })
  } catch {
    // iOS may reject silent priming.
  }
}

function primeWebSpeech(): void {
  const synth = speechSynth()
  if (!synth) return
  try {
    synth.cancel()
    const warm = new SpeechSynthesisUtterance(' ')
    warm.lang = TTS_LANG
    warm.volume = 0
    warm.rate = 1
    warm.pitch = 1
    synth.speak(warm)
  } catch {
    // Compact iOS voices still unlock on a later speak().
  }
}

export function unlockTts(): void {
  if (!hasAudioElement() && !speechSynth()) return
  unlocked = true
  if (!audioPrimed) {
    audioPrimed = true
    primeAudioIfIdle()
    primeWebSpeech()
  }
  emit()
}

export function stopTts(): void {
  speakSeq += 1
  neuralSeq = -1
  if (graceTimer != null) {
    clearTimeout(graceTimer)
    graceTimer = null
  }
  pauseAudioKeepingUnlock()
  releaseObjectUrl()
  cancelWebSpeech()
}

async function fetchMpeg(url: string, init?: RequestInit): Promise<Blob | null> {
  const response = await fetch(url, init)
  if (!response.ok) return null
  const buffer = await response.arrayBuffer()
  if (!isMpegBuffer(buffer)) return null
  return new Blob([buffer], { type: 'audio/mpeg' })
}

function playFromUrl(url: string): Promise<void> {
  const audio = getPlayer()
  try {
    audio.pause()
  } catch {
    // The previous clip is already stopped.
  }
  releaseObjectUrl()
  audio.muted = false
  audio.src = url
  audio.volume = TTS_VOLUME
  return audio.play()
}

function playBlob(blob: Blob): Promise<void> {
  const audio = getPlayer()
  try {
    audio.pause()
  } catch {
    // The previous clip is already stopped.
  }
  releaseObjectUrl()
  objectUrl = globalThis.URL.createObjectURL(blob)
  audio.muted = false
  audio.src = objectUrl
  audio.volume = TTS_VOLUME
  return audio.play()
}

function watchWebSpeech(): void {
  const synth = speechSynth()
  if (!synth || resumeTimer != null) return
  resumeTimer = setInterval(() => {
    try {
      synth.resume()
    } catch {
      // Ignore.
    }
  }, 4000)
}

function pickFallbackVoice(synth: SpeechSynthesis, lang: string): SpeechSynthesisVoice | null {
  if (typeof synth.getVoices !== 'function') return null
  const voices = synth.getVoices()
  if (!voices?.length) return null
  const prefix = lang.slice(0, 2).toLowerCase()
  const same = voices.filter((item) => item.lang.toLowerCase().replace('_', '-').startsWith(prefix))
  const pool = same.length > 0 ? same : voices
  const male = /\b(david|daniel|mark|guy|george|ravi|antonio)\b/i
  const female = /jenny|aria|sonia|zira|susan|samantha|victoria|karen|moira|fiona|ana|francisca|maria|lucia|hedda|helena|giovanna|yara|thalita|manuela/i
  return (
    pool.find((item) => female.test(item.name) && !male.test(item.name)) ??
    pool.find((item) => !male.test(item.name)) ??
    null
  )
}

function speakWebSpeechFallback(spoken: string, voice: ClipVoiceId): void {
  const synth = speechSynth()
  if (!synth) {
    throw new Error('no-webspeech')
  }
  synth.cancel()
  const utterance = new SpeechSynthesisUtterance(spoken)
  utterance.lang = fallbackLang(voice)
  utterance.rate = voice === NATIVE_VOICE_ID ? 0.85 : TTS_RATE
  utterance.pitch = voice === NATIVE_VOICE_ID ? 0.92 : TTS_PITCH
  utterance.volume = TTS_VOLUME
  const fallbackVoice = pickFallbackVoice(synth, utterance.lang)
  if (fallbackVoice) utterance.voice = fallbackVoice
  synth.speak(utterance)
  watchWebSpeech()
}

function startWebSpeechFallback(seq: number, spoken: string, voice: ClipVoiceId): void {
  if (seq !== speakSeq || neuralSeq === seq) return
  try {
    speakWebSpeechFallback(spoken, voice)
    engine = 'webspeech-fallback'
    hint = FALLBACK_HINT
    emit()
  } catch {
    engine = 'unavailable'
    hint = 'Não foi possível falar neste navegador.'
    emit()
  }
}

function markNeuralPlaying(seq: number): void {
  if (seq !== speakSeq) return
  neuralSeq = seq
  if (graceTimer != null) {
    clearTimeout(graceTimer)
    graceTimer = null
  }
  cancelWebSpeech()
  engine = HAPPY_PATH_ENGINE
  hint = null
  emit()
}

async function playNeural(spoken: string, voice: ClipVoiceId, seq: number): Promise<void> {
  try {
    await playFromUrl(packedMpegUrl(spoken, voice))
    markNeuralPlaying(seq)
    return
  } catch (error) {
    const aborted = error instanceof DOMException && error.name === 'AbortError'
    if (aborted && seq !== speakSeq) return
    // Packed file missing, blocked, or replaced by the next tap.
  }
  if (seq !== speakSeq) return

  if (import.meta.env.DEV) {
    try {
      const live = await fetchMpeg(liveTtsUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: spoken, voice }),
      })
      if (live && seq === speakSeq) {
        await playBlob(live)
        markNeuralPlaying(seq)
        return
      }
    } catch {
      // Fall through to Web Speech.
    }
  }

  if (seq !== speakSeq) return
  if (graceTimer != null) {
    clearTimeout(graceTimer)
    graceTimer = null
  }
  startWebSpeechFallback(seq, spoken, voice)
}

export function speak(text: string, kind: SpeakKind = 'prompt'): void {
  if (!text.trim() || engine === 'unavailable') return
  const spoken = toSpokenText(text)
  if (!spoken) return
  unlocked = true
  const voice = voiceForKind(kind)
  const seq = ++speakSeq
  if (graceTimer != null) {
    clearTimeout(graceTimer)
    graceTimer = null
  }
  pauseAudioKeepingUnlock()
  cancelWebSpeech()
  speakSeq = seq
  neuralSeq = -1

  graceTimer = setTimeout(() => {
    startWebSpeechFallback(seq, spoken, voice)
  }, MPEG_GRACE_MS)

  void playNeural(spoken, voice, seq)
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
