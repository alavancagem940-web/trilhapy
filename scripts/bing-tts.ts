/**
 * Microsoft neural TTS via Bing Translator (same Francisca/Giovanna/Yara/Thalita/Manuela
 * models the Edge Read Aloud catalog exposes). Node-only — never imported by the PWA
 * bundle. Used by prebuild, Vite __tts, and live tests.
 */
export const BING_TRANSLATOR = 'https://www.bing.com/translator'
export const BING_TFETTTS = 'https://www.bing.com/tfettts'

const EDGE_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0'

export type BingSession = {
  ig: string
  token: string
  key: string
  fetchedAt: number
}

function isMpeg(bytes: Uint8Array): boolean {
  if (bytes.length < 3) return false
  if (bytes[0] === 0xff && (bytes[1]! & 0xe0) === 0xe0) return true
  return bytes[0] === 0x49 && bytes[1] === 0x44 && bytes[2] === 0x33
}

export async function fetchBingSession(): Promise<BingSession> {
  const response = await fetch(BING_TRANSLATOR, {
    headers: {
      'User-Agent': EDGE_UA,
      Accept: 'text/html',
    },
  })
  if (!response.ok) {
    throw new Error(`Bing translator ${response.status}`)
  }
  const html = await response.text()
  const ig = html.match(/IG:"([A-F0-9]+)"/)?.[1]
  const helper = html.match(/params_AbusePreventionHelper = \[(\d+),"([^"]+)",(\d+)\]/)
  if (!ig || !helper) {
    throw new Error('Bing translator token missing')
  }
  return { ig, key: helper[1]!, token: helper[2]!, fetchedAt: Date.now() }
}

export async function synthesizeBingSsml(ssml: string, session?: BingSession): Promise<Uint8Array> {
  let active = session ?? (await fetchBingSession())
  const attempt = async (current: BingSession): Promise<Uint8Array> => {
    const url = `${BING_TFETTTS}?isvertical=1&IG=${current.ig}&IID=translator.5024.1`
    const body = new URLSearchParams({
      ssml,
      token: current.token,
      key: current.key,
    })
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'User-Agent': EDGE_UA,
        'Content-Type': 'application/x-www-form-urlencoded',
        Origin: 'https://www.bing.com',
        Referer: 'https://www.bing.com/translator',
      },
      body,
    })
    const bytes = new Uint8Array(await response.arrayBuffer())
    if (response.ok && isMpeg(bytes)) return bytes
    throw new Error(`Bing tfettts ${response.status} ct=${response.headers.get('content-type')} len=${bytes.length}`)
  }

  try {
    return await attempt(active)
  } catch (first) {
    active = await fetchBingSession()
    try {
      return await attempt(active)
    } catch {
      throw first
    }
  }
}

let cached: BingSession | null = null

export async function synthesizeBingSsmlCached(ssml: string): Promise<Uint8Array> {
  if (!cached || Date.now() - cached.fetchedAt > 45 * 60 * 1000) {
    cached = await fetchBingSession()
  }
  try {
    return await synthesizeBingSsml(ssml, cached)
  } catch {
    cached = await fetchBingSession()
    return synthesizeBingSsml(ssml, cached)
  }
}
