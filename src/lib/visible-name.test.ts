import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()

function stripGithubIoHost(text: string): string {
  return text.replaceAll('alavancagem940-web.github.io', 'GITHUB_IO_HOST')
}

describe('nome visível', () => {
  it('não usa alavancagem como nome do produto', () => {
    const files = [
      'index.html',
      'public/instalar.html',
      'README.md',
      'package.json',
      'vite.config.ts',
      'src/components/Header.tsx',
    ]
    for (const file of files) {
      const text = stripGithubIoHost(readFileSync(join(root, file), 'utf8'))
      expect(text.toLowerCase(), file).not.toMatch(/alavancagem/)
    }
  })

  it('perfil iOS mostra TrilhaPy; o host github.io permanece', () => {
    const xml = readFileSync(join(root, 'public/trilhapy.mobileconfig'), 'utf8')
    expect(xml).toContain('<string>TrilhaPy</string>')
    expect(xml).toContain('web.trilhapy.webclip')
    expect(xml).toContain('<string>web.trilhapy</string>')
    expect(xml).toContain('https://alavancagem940-web.github.io/trilhapy/')
    expect(xml).not.toContain('web.alavancagem940')
  })

  it('service worker didático v6 e SSML natural no hop local', () => {
    const vite = readFileSync(join(root, 'vite.config.ts'), 'utf8')
    expect(vite).toContain("cacheId: 'trilhapy-didactic-tts-v6'")
    expect(vite).toContain("cacheName: 'trilhapy-neural-mp3-v6'")
    const hop = readFileSync(join(root, 'scripts/tts-middleware.mjs'), 'utf8')
    expect(hop).toContain('rate="+0%"')
    expect(hop).toContain('pitch="+0Hz"')
    expect(hop).not.toContain('rate="-20%"')
  })
})
