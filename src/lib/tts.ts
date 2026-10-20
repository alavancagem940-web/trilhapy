export type TtsStatus = {
  available: boolean
  label: string
  unlocked: boolean
}

type StatusListener = (status: TtsStatus) => void

const listeners = new Set<StatusListener>()

let unlocked = false
let available = typeof window !== 'undefined' && 'speechSynthesis' in window
let label = available ? 'preparando voz…' : 'indisponível neste navegador'

function emit(): void {
  const status = { available, label, unlocked }
  for (const listener of listeners) listener(status)
}

function pickVoice(): SpeechSynthesisVoice | null {
  if (!available) return null
  const voices = window.speechSynthesis.getVoices()
  return (
    voices.find((voice) => voice.lang.replace('_', '-') === 'pt-BR') ??
    voices.find((voice) => voice.lang.toLowerCase().startsWith('pt')) ??
    null
  )
}

function refreshVoices(): void {
  if (!available) {
    label = 'indisponível neste navegador'
    emit()
    return
  }
  const voice = pickVoice()
  if (voice) {
    label = `voz pronta (${voice.name})`
  } else if (unlocked) {
    label = 'voz pronta (Web Speech, pt-BR)'
  } else {
    label = 'toque na tela para liberar o áudio no iPhone'
  }
  emit()
}

export function getTtsStatus(): TtsStatus {
  return { available, label, unlocked }
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
    priming.volume = 0
    priming.lang = 'pt-BR'
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

export function speak(text: string): void {
  if (!available || !text.trim()) return
  try {
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'pt-BR'
    utterance.rate = 1.02
    utterance.pitch = 1
    const voice = pickVoice()
    if (voice) utterance.voice = voice
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
