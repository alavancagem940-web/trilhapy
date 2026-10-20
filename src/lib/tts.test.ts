import { afterEach, describe, expect, it, vi } from 'vitest'
import { HAPPY_PATH_ENGINE, ttsAssetHash, ttsAssetPath } from './microsoft-neural'
import { MPEG_GRACE_MS } from './tts'

function mpegAudioMock(play: ReturnType<typeof vi.fn>) {
  return {
    play,
    pause: vi.fn(),
    load: vi.fn(),
    preload: 'auto',
    playsInline: true,
    volume: 1,
    muted: false,
    paused: true,
    src: '',
    currentSrc: '',
    currentTime: 0,
    style: {} as CSSStyleDeclaration,
    setAttribute: vi.fn(),
    removeAttribute: vi.fn(),
  }
}

async function loadTts(play = vi.fn().mockResolvedValue(undefined)) {
  vi.resetModules()
  const audioInstance = mpegAudioMock(play)
  const speechSpeak = vi.fn()
  const speechCancel = vi.fn()
  const speechResume = vi.fn()
  vi.stubGlobal(
    'Audio',
    class {
      constructor() {
        return audioInstance
      }
    },
  )
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('no-live-tts')))
  vi.stubGlobal('speechSynthesis', {
    speak: speechSpeak,
    cancel: speechCancel,
    resume: speechResume,
  })
  vi.stubGlobal('SpeechSynthesisUtterance', class {
    text = ''
    lang = ''
    rate = 1
    pitch = 1
    volume = 1
    constructor(text?: string) {
      this.text = text ?? ''
    }
  })
  Object.assign(URL, {
    createObjectURL: vi.fn(() => 'blob:neural'),
    revokeObjectURL: vi.fn(),
  })
  const mod = await import('./tts')
  return { ...mod, audioInstance, speechSpeak, speechCancel, play }
}

describe('caminho feliz iPhone', () => {
  it('não usa speechSynthesis no caminho feliz', async () => {
    const { happyPathUsesSpeechSynthesis } = await import('./tts')
    expect(HAPPY_PATH_ENGINE).toBe('microsoft-neural-audio')
    expect(happyPathUsesSpeechSynthesis()).toBe(false)
  })
})

describe('speak() toca MPEG com Audio()', () => {
  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
    vi.resetModules()
  })

  it('no toque, aponta o Audio para o MPEG empacotado e chama play(), sem Web Speech', async () => {
    const prompt = 'O que é uma variável em Python?'
    const { initTts, speak, getTtsStatus, stopTts, audioInstance, speechSpeak, play } = await loadTts()
    initTts()
    speak(prompt, 'prompt')
    await vi.waitFor(() => {
      expect(play).toHaveBeenCalled()
    })
    const expected = `/${ttsAssetPath('pt-BR-FranciscaNeural', ttsAssetHash('pt-BR-FranciscaNeural', prompt))}`
    expect(audioInstance.src.endsWith(expected) || audioInstance.src === expected).toBe(true)
    expect(getTtsStatus().engine).toBe('microsoft-neural-audio')
    expect(speechSpeak).not.toHaveBeenCalled()
    stopTts()
    expect(audioInstance.load).not.toHaveBeenCalled()
    expect(audioInstance.removeAttribute).not.toHaveBeenCalled()
  })

  it('o primeiro toque destrava Audio() e speechSynthesis', async () => {
    const { initTts, unlockTts, audioInstance, speechSpeak, play } = await loadTts()
    initTts()
    unlockTts()
    expect(play).toHaveBeenCalled()
    expect(audioInstance.src.startsWith('data:audio/wav')).toBe(true)
    expect(speechSpeak).toHaveBeenCalledTimes(1)
    const warm = speechSpeak.mock.calls[0]![0] as SpeechSynthesisUtterance
    expect(warm.volume).toBe(0)
  })

  it('se o MPEG for bloqueado, fala o texto da lição no Web Speech na hora', async () => {
    const play = vi.fn().mockRejectedValue(new DOMException('blocked', 'NotAllowedError'))
    const prompt = 'O que é uma variável em Python?'
    const { speak, getTtsStatus, speechSpeak } = await loadTts(play)
    speak(prompt, 'prompt')
    await vi.waitFor(() => {
      expect(speechSpeak).toHaveBeenCalled()
    })
    const uttered = speechSpeak.mock.calls[0]![0] as SpeechSynthesisUtterance
    expect(uttered.text).toBe(prompt)
    expect(uttered.text.toLowerCase()).not.toMatch(/chega mais perto|mmm|tesão/)
    expect(getTtsStatus().engine).toBe('webspeech-fallback')
  })

  it('se o MPEG atrasar, cai no Web Speech dentro da janela de graça', async () => {
    vi.useFakeTimers()
    const play = vi.fn().mockReturnValue(new Promise(() => {}))
    const prompt = 'Uma regra diz: se está chovendo, leve o guarda-chuva.'
    const { speak, getTtsStatus, speechSpeak } = await loadTts(play)
    speak(prompt, 'prompt')
    expect(speechSpeak).not.toHaveBeenCalled()
    await vi.advanceTimersByTimeAsync(MPEG_GRACE_MS)
    expect(speechSpeak).toHaveBeenCalled()
    const uttered = speechSpeak.mock.calls[0]![0] as SpeechSynthesisUtterance
    expect(uttered.text).toBe(prompt)
    expect(uttered.text).not.toMatch(/Relaxa o corpo|chega mais perto/)
    expect(getTtsStatus().engine).toBe('webspeech-fallback')
  })
})
