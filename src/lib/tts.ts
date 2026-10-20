import { type SpeakKind, toFlirtySpeech } from './speech-persona'

/** Web Speech playback — keep these in one place, never scatter literals at call sites. */
export const TTS_RATE = 0.8
export const TTS_PITCH = 0.82
export const TTS_VOLUME = 1
export const TTS_LANG = 'pt-BR'

export type { SpeakKind }

export type VoiceLike = {
  name: string
  lang: string
  voiceURI?: string
  localService?: boolean
  default?: boolean
}

export type TtsStatus = {
  available: boolean
  label: string
  unlocked: boolean
  hint: string | null
}

type StatusListener = (status: TtsStatus) => void

const listeners = new Set<StatusListener>()

let unlocked = false
let available = typeof window !== 'undefined' && 'speechSynthesis' in window
let label = available ? 'preparando voz…' : 'indisponível neste navegador'
let hint: string | null = null

const IOS_COMPACT_HINT =
  'No iPhone a voz fica melhor se você baixar uma voz aprimorada: Ajustes → Acessibilidade → Conteúdo falado → Vozes.'

function emit(): void {
  const status = getTtsStatus()
  for (const listener of listeners) listener(status)
}

function normalizeLang(lang: string): string {
  return lang.replace('_', '-').toLowerCase()
}

function haystack(voice: VoiceLike): string {
  return `${voice.name} ${voice.voiceURI ?? ''}`.toLowerCase()
}

export function isAvoidedVoice(voice: VoiceLike): boolean {
  return /compact|eloquence|legacy/.test(haystack(voice))
}

export function isNeuralLike(voice: VoiceLike): boolean {
  if (isAvoidedVoice(voice)) return false
  const text = haystack(voice)
  if (/neural|enhanced|premium|natural|wavenet|neural2|studio|journey/.test(text)) return true
  return /google/.test(text) && isPortuguese(voice)
}

export function isFranciscaOrThalia(voice: VoiceLike): boolean {
  const text = haystack(voice)
  if (/franciscaneural|thalianeural/.test(text)) return true
  const lang = normalizeLang(voice.lang)
  const ptBr = lang === 'pt-br' || lang.startsWith('pt-br')
  return ptBr && (/\bfrancisca\b/.test(text) || /\bthalia\b/.test(text))
}

function isPortuguese(voice: VoiceLike): boolean {
  return normalizeLang(voice.lang).startsWith('pt')
}

function isBrazilian(voice: VoiceLike): boolean {
  const lang = normalizeLang(voice.lang)
  return lang === 'pt-br' || lang.startsWith('pt-br')
}

function isFeminineName(voice: VoiceLike): boolean {
  const text = haystack(voice)
  if (
    /\b(daniel|antonio|antônio|felipe|ricardo|humberto|hermes|bruno|joao|joão|pedro|carlos|marcos|paulo|rafael)\b/.test(
      text,
    )
  ) {
    return false
  }
  return /\b(francisca|thalia|luciana|maria|fernanda|helena|vitoria|vitória|giovanna|brenda|elisa|joana|ines|inês|catarina|daniela)\b/.test(
    text,
  )
}

/**
 * Higher is better. Preferred Microsoft neural names win even over other neural pt-BR.
 * Compact/eloquence/legacy lose to any neural voice, including other languages.
 * Missing Francisca/Thalia on iPhone is fine — we just pick the next best.
 */
export function scoreVoice(voice: VoiceLike): number {
  const text = haystack(voice)
  const neural = isNeuralLike(voice)
  const avoided = isAvoidedVoice(voice)
  const ptBr = isBrazilian(voice)
  const pt = isPortuguese(voice)
  const local = voice.localService ? 8 : 0
  const feminine = isFeminineName(voice) ? 25 : 0
  const googlePt = /google/.test(text) && pt ? 20 : 0

  if (/franciscaneural/.test(text)) return 10_000 + local
  if (/thalianeural/.test(text)) return 9_900 + local
  if (isFranciscaOrThalia(voice)) return 9_800 + local + (neural ? 40 : 0)

  if (neural && ptBr) return 8_000 + feminine + local + googlePt
  if (neural && pt) return 7_000 + feminine + local + googlePt
  if (neural) return 6_000 + feminine + local

  if (avoided && ptBr) return 400 + feminine + local
  if (avoided && pt) return 300 + feminine + local
  if (avoided) return 50

  if (ptBr) return 2_000 + feminine + local + googlePt
  if (pt) return 1_500 + feminine + local + googlePt
  return 100 + local
}

export function pickBestVoice(voices: readonly VoiceLike[]): VoiceLike | null {
  if (voices.length === 0) return null
  let best: VoiceLike | null = null
  let bestScore = Number.NEGATIVE_INFINITY
  for (const voice of voices) {
    const score = scoreVoice(voice)
    if (score > bestScore) {
      best = voice
      bestScore = score
    }
  }
  return best
}

export function formatVoiceLabel(voice: VoiceLike | null, speechUnlocked: boolean): string {
  if (!voice) {
    return speechUnlocked ? 'voz do sistema (pt-BR)' : 'toque na tela para liberar o áudio no iPhone'
  }
  if (isFranciscaOrThalia(voice) || isNeuralLike(voice)) {
    return `voz neural (${voice.name})`
  }
  if (isAvoidedVoice(voice)) {
    return `voz compacta (${voice.name})`
  }
  return `voz do sistema (${voice.name})`
}

export function compactVoiceHint(voice: VoiceLike | null): string | null {
  if (!voice || !isAvoidedVoice(voice)) return null
  if (typeof navigator === 'undefined') return IOS_COMPACT_HINT
  const ua = navigator.userAgent
  const ios =
    /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  return ios ? IOS_COMPACT_HINT : null
}

function currentVoices(): VoiceLike[] {
  if (!available) return []
  return Array.from(window.speechSynthesis.getVoices())
}

function pickVoice(): VoiceLike | null {
  return pickBestVoice(currentVoices())
}

function applyUtteranceSettings(utterance: SpeechSynthesisUtterance, voice: VoiceLike | null): void {
  utterance.lang = TTS_LANG
  utterance.rate = TTS_RATE
  utterance.pitch = TTS_PITCH
  utterance.volume = TTS_VOLUME
  if (!voice) return
  const match = window.speechSynthesis
    .getVoices()
    .find((item) => item.voiceURI === voice.voiceURI || item.name === voice.name)
  if (match) utterance.voice = match
}

function refreshVoices(): void {
  if (!available) {
    label = 'indisponível neste navegador'
    hint = null
    emit()
    return
  }
  const voice = pickVoice()
  label = formatVoiceLabel(voice, unlocked)
  hint = compactVoiceHint(voice)
  emit()
}

export function getTtsStatus(): TtsStatus {
  return { available, label, unlocked, hint }
}

export function subscribeTts(listener: StatusListener): () => void {
  listeners.add(listener)
  listener(getTtsStatus())
  return () => {
    listeners.delete(listener)
  }
}

export function initTts(): void {
  available = typeof window !== 'undefined' && 'speechSynthesis' in window
  if (!available) {
    label = 'indisponível neste navegador'
    hint = null
    emit()
    return
  }
  refreshVoices()
  window.speechSynthesis.addEventListener('voiceschanged', refreshVoices)
  const unlock = () => {
    unlockTts()
    window.removeEventListener('pointerdown', unlock)
    window.removeEventListener('keydown', unlock)
  }
  window.addEventListener('pointerdown', unlock, { passive: true })
  window.addEventListener('keydown', unlock)
}

export function unlockTts(): void {
  if (!available || unlocked) return
  unlocked = true
  try {
    window.speechSynthesis.cancel()
    const priming = new SpeechSynthesisUtterance(' ')
    applyUtteranceSettings(priming, pickVoice())
    priming.volume = 0
    window.speechSynthesis.speak(priming)
    window.speechSynthesis.cancel()
  } catch {
    // iOS may reject the silent priming; later speaks still run on tap.
  }
  refreshVoices()
}

export function stopTts(): void {
  if (!available) return
  window.speechSynthesis.cancel()
}

export function speak(text: string, kind: SpeakKind = 'prompt'): void {
  if (!available || !text.trim()) return
  try {
    window.speechSynthesis.cancel()
    const spoken = toFlirtySpeech(text, kind)
    if (!spoken) return
    const utterance = new SpeechSynthesisUtterance(spoken)
    applyUtteranceSettings(utterance, pickVoice())
    window.speechSynthesis.speak(utterance)
  } catch {
    // Never block the UI if the engine throws.
  }
}

export function isStandaloneDisplay(): boolean {
  if (typeof window === 'undefined') return false
  const media = window.matchMedia('(display-mode: standalone)').matches
  const ios = 'standalone' in navigator && Boolean((navigator as Navigator & { standalone?: boolean }).standalone)
  return media || ios
}
