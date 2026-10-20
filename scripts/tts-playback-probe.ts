import { chromium } from 'playwright-core'
import { synthesizeBingSsmlCached } from './bing-tts'
import { DEFAULT_VOICE_ID, buildSsml, isMpegBuffer } from '../src/lib/microsoft-neural'

const chromePath = '/usr/bin/google-chrome-stable'
const phrase = 'Olá Marcelo. Esta é a voz neural no iPhone, tocada com Audio.'

const mpeg = await synthesizeBingSsmlCached(buildSsml(phrase, DEFAULT_VOICE_ID))
if (!isMpegBuffer(mpeg)) {
  throw new Error('síntese não devolveu MPEG')
}
const b64 = Buffer.from(mpeg).toString('base64')

const browser = await chromium.launch({
  executablePath: chromePath,
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--autoplay-policy=no-user-gesture-required'],
})
const page = await browser.newPage()
await page.setContent(`<!doctype html><html><body><script>
const bytes = Uint8Array.from(atob("${b64}"), c => c.charCodeAt(0));
const blob = new Blob([bytes], { type: "audio/mpeg" });
const audio = new Audio(URL.createObjectURL(blob));
window.__engine = "microsoft-neural-audio";
audio.addEventListener("timeupdate", () => {
  if (audio.currentTime > 0.05) document.title = "PLAYED";
});
audio.addEventListener("error", () => { document.title = "ERROR"; });
audio.play().catch((err) => { document.title = "PLAY_FAIL:" + err; });
</script></body></html>`)

const ok = await page.waitForFunction(() => document.title === 'PLAYED', { timeout: 15000 }).then(
  () => true,
  () => false,
)
const title = await page.title()
const engine = await page.evaluate(() => (window as unknown as { __engine: string }).__engine)
await browser.close()

if (!ok || engine !== 'microsoft-neural-audio') {
  throw new Error(`playback failed title=${title} engine=${engine}`)
}
console.log('playback ok', { bytes: mpeg.length, engine, speechSynthesis: false })
