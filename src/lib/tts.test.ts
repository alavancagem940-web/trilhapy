import { afterEach, describe, expect, it, vi } from 'vitest'
import { HAPPY_PATH_ENGINE } from './microsoft-neural'

describe('caminho feliz iPhone', () => {
  it('não usa speechSynthesis no caminho feliz', async () => {
    const { happyPathUsesSpeechSynthesis } = await import('./tts')
    expect(HAPPY_PATH_ENGINE).toBe('microsoft-neural-audio')
    expect(happyPathUsesSpeechSynthesis()).toBe(false)
  })
})

describe('speak() toca MPEG com Audio()', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
    vi.resetModules()
  })

  it('busca o MPEG neural e chama play() no Audio, sem speechSynthesis', async () => {
    vi.resetModules()
    const mpeg = Uint8Array.from([0xff, 0xf3, 0x48, 0xc4, 0x00, 0x00, 0x00, 0x03])
    const play = vi.fn().mockResolvedValue(undefined)
    const audioInstance = {
      play,
      pause: vi.fn(),
      load: vi.fn(),
      preload: 'auto',
      volume: 1,
      src: '',
      currentTime: 0,
      setAttribute: vi.fn(),
      removeAttribute: vi.fn(),
    }
    const speechSpeak = vi.fn()
    const fetchMock = vi.fn().mockImplementation(async () => ({
      ok: true,
      arrayBuffer: async () => mpeg.buffer.slice(mpeg.byteOffset, mpeg.byteOffset + mpeg.byteLength),
    }))

    vi.stubGlobal(
      'Audio',
      class {
        constructor() {
          return audioInstance
        }
      },
    )
    vi.stubGlobal('speechSynthesis', { speak: speechSpeak, cancel: vi.fn() })
    vi.stubGlobal('fetch', fetchMock)
    Object.assign(URL, {
      createObjectURL: vi.fn(() => 'blob:neural'),
      revokeObjectURL: vi.fn(),
    })

    const { initTts, speak, getTtsStatus, stopTts } = await import('./tts')
    initTts()
    speak('O que é uma variável em Python?', 'prompt')
    await vi.waitFor(() => {
      expect(play).toHaveBeenCalled()
    })
    expect(audioInstance.src).toBe('blob:neural')
    expect(getTtsStatus().engine).toBe('microsoft-neural-audio')
    expect(speechSpeak).not.toHaveBeenCalled()
    stopTts()
  })
})
