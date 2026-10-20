import { chromium } from 'playwright-core'
import { collectSpokenLines, DEFAULT_VOICE_ID, ttsAssetHash, ttsAssetPath } from '../src/lib/microsoft-neural'

const chromePath = '/usr/bin/google-chrome-stable'
const IPHONE_UA =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1'
const PAGES = 'https://alavancagem940-web.github.io/trilhapy/'

const prompt =
  collectSpokenLines().find((line) => line.spoken.startsWith('Uma regra diz'))?.spoken ??
  'Uma regra diz: se está chovendo, leve o guarda-chuva. Está chovendo. O que você faz?'
const mpegUrl = `${PAGES}${ttsAssetPath(DEFAULT_VOICE_ID, ttsAssetHash(DEFAULT_VOICE_ID, prompt))}`

const mpegResponse = await fetch(mpegUrl, { headers: { 'User-Agent': IPHONE_UA } })
const mpegBytes = Buffer.from(await mpegResponse.arrayBuffer())
if (mpegResponse.status !== 200 || mpegBytes.length < 2000) {
  throw new Error(`iPhone UA MPEG ${mpegResponse.status} len=${mpegBytes.length} url=${mpegUrl}`)
}
console.log('iphone-ua mpeg ok', {
  status: mpegResponse.status,
  ct: mpegResponse.headers.get('content-type'),
  bytes: mpegBytes.length,
  url: mpegUrl,
})

const browser = await chromium.launch({
  executablePath: chromePath,
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--autoplay-policy=document-user-activation-required'],
})
const context = await browser.newContext({
  userAgent: IPHONE_UA,
  viewport: { width: 390, height: 844 },
  isMobile: true,
  hasTouch: true,
})
const page = await context.newPage()
await page.setContent(`<!doctype html><html><body>
<button id="go">Falar</button>
<button id="blocked">Bloqueado</button>
<script>
const LESSON = ${JSON.stringify(prompt)};
const MPEG = ${JSON.stringify(mpegUrl)};
const GRACE = 480;

function speakFallback(text) {
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'pt-BR';
  window.speechSynthesis.speak(u);
  window.__engine = 'webspeech-fallback';
  window.__spoken = text;
  document.title = 'FALLBACK';
}

function unlock() {
  const silent = new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA');
  silent.play().catch(() => {});
  const warm = new SpeechSynthesisUtterance(' ');
  warm.volume = 0;
  window.speechSynthesis.speak(warm);
}

document.getElementById('go').addEventListener('click', () => {
  unlock();
  const audio = new Audio(MPEG);
  audio.setAttribute('playsinline', 'true');
  let neural = false;
  const timer = setTimeout(() => { if (!neural) speakFallback(LESSON); }, GRACE);
  audio.addEventListener('playing', () => {
    neural = true;
    clearTimeout(timer);
    window.speechSynthesis.cancel();
    window.__engine = 'microsoft-neural-audio';
    window.__spoken = LESSON;
    document.title = 'NEURAL';
  });
  audio.addEventListener('timeupdate', () => {
    if (audio.currentTime > 0.05) {
      neural = true;
      window.__engine = 'microsoft-neural-audio';
      window.__spoken = LESSON;
      document.title = 'NEURAL';
    }
  });
  audio.play().catch(() => { clearTimeout(timer); speakFallback(LESSON); });
});

document.getElementById('blocked').addEventListener('click', () => {
  unlock();
  const audio = new Audio(MPEG);
  audio.play = () => Promise.reject(new DOMException('The request is not allowed by the user agent', 'NotAllowedError'));
  let fell = false;
  const timer = setTimeout(() => { if (!fell) { fell = true; speakFallback(LESSON); } }, GRACE);
  audio.play().catch(() => { if (!fell) { fell = true; clearTimeout(timer); speakFallback(LESSON); } });
});
</script>
</body></html>`)

const withoutGesture = await page.evaluate(async (url) => {
  const audio = new Audio(url)
  try {
    await audio.play()
    return 'played'
  } catch (error) {
    return error instanceof Error ? error.name : 'blocked'
  }
}, mpegUrl)

await page.click('#go')
await page.waitForFunction(() => document.title === 'NEURAL' || document.title === 'FALLBACK', { timeout: 20000 })
const afterTap = {
  title: await page.title(),
  engine: await page.evaluate(() => (window as unknown as { __engine: string }).__engine),
  spoken: await page.evaluate(() => (window as unknown as { __spoken: string }).__spoken),
}

await page.evaluate(() => {
  document.title = ''
})
await page.click('#blocked')
await page.waitForFunction(() => document.title === 'FALLBACK', { timeout: 5000 })
const afterBlock = {
  title: await page.title(),
  engine: await page.evaluate(() => (window as unknown as { __engine: string }).__engine),
  spoken: await page.evaluate(() => (window as unknown as { __spoken: string }).__spoken),
}
await browser.close()

if (!afterTap.spoken || /chega mais perto|mmm|tesão/i.test(afterTap.spoken)) {
  throw new Error(`tap spoken empty/flirty: ${afterTap.spoken}`)
}
if (afterTap.engine !== 'microsoft-neural-audio' && afterTap.engine !== 'webspeech-fallback') {
  throw new Error(`tap engine ${afterTap.engine}`)
}
if (afterBlock.engine !== 'webspeech-fallback' || afterBlock.spoken !== prompt) {
  throw new Error(`blocked fallback failed ${JSON.stringify(afterBlock)}`)
}

console.log('iphone-ua playback ok', {
  withoutGesture,
  afterTap,
  afterBlock: { engine: afterBlock.engine, spoken: afterBlock.spoken.slice(0, 72) },
  speechSynthesisOnHappyPath: afterTap.engine !== 'microsoft-neural-audio',
})
