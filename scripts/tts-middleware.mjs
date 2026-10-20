const DEFAULT_VOICE = 'pt-BR-FranciscaNeural'
const VOICES = new Set([
  'pt-BR-FranciscaNeural',
  'pt-BR-GiovannaNeural',
  'pt-BR-YaraNeural',
  'pt-BR-ThalitaNeural',
  'pt-BR-ManuelaNeural',
])
const EDGE_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0'

function escapeSsml(text) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function buildSsml(text, voice) {
  const body = escapeSsml(text.trim())
  return (
    `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="pt-BR">` +
    `<voice name="${voice}"><prosody rate="+0%" pitch="+0Hz">${body}</prosody></voice></speak>`
  )
}

function isMpeg(bytes) {
  return bytes.length >= 3 && bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0
}

let session = null

async function fetchSession() {
  const response = await fetch('https://www.bing.com/translator', {
    headers: { 'User-Agent': EDGE_UA, Accept: 'text/html' },
  })
  const html = await response.text()
  const ig = html.match(/IG:"([A-F0-9]+)"/)?.[1]
  const helper = html.match(/params_AbusePreventionHelper = \[(\d+),"([^"]+)",(\d+)\]/)
  if (!ig || !helper) throw new Error('Bing translator token missing')
  session = { ig, key: helper[1], token: helper[2], fetchedAt: Date.now() }
  return session
}

async function synthesize(ssml) {
  if (!session || Date.now() - session.fetchedAt > 45 * 60 * 1000) {
    await fetchSession()
  }
  const post = async (current) => {
    const url = `https://www.bing.com/tfettts?isvertical=1&IG=${current.ig}&IID=translator.5024.1`
    const body = new URLSearchParams({ ssml, token: current.token, key: current.key })
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
    throw new Error(`Bing tfettts ${response.status}`)
  }
  try {
    return await post(session)
  } catch {
    await fetchSession()
    return post(session)
  }
}

function isTtsPath(url) {
  if (!url) return false
  const path = url.split('?')[0]
  return path === '/__tts' || path.endsWith('/__tts')
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', (chunk) => chunks.push(chunk))
    req.on('end', () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}'))
      } catch (error) {
        reject(error)
      }
    })
    req.on('error', reject)
  })
}

export function attachTtsMiddleware(server) {
  server.middlewares.use((req, res, next) => {
    if (!isTtsPath(req.url)) {
      next()
      return
    }
    void (async () => {
      res.setHeader('Access-Control-Allow-Origin', '*')
      res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
      res.setHeader('Access-Control-Allow-Headers', 'content-type')
      if (req.method === 'OPTIONS') {
        res.statusCode = 204
        res.end()
        return
      }
      if (req.method !== 'POST') {
        res.statusCode = 405
        res.end('method not allowed')
        return
      }
      try {
        const body = await readJson(req)
        const text = typeof body.text === 'string' ? body.text : ''
        const voice = VOICES.has(body.voice) ? body.voice : DEFAULT_VOICE
        if (!text.trim()) {
          res.statusCode = 400
          res.end('missing text')
          return
        }
        const mpeg = await synthesize(buildSsml(text, voice))
        res.statusCode = 200
        res.setHeader('Content-Type', 'audio/mpeg')
        res.setHeader('Cache-Control', 'no-store')
        res.end(Buffer.from(mpeg))
      } catch (error) {
        console.error('[tts-middleware]', error)
        res.statusCode = 502
        res.end('tts failed')
      }
    })()
  })
}
