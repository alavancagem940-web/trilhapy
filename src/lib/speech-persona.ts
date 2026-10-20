export type SpeakKind = 'prompt' | 'choice' | 'theory' | 'feedback-correct' | 'feedback-wrong'

const OPENERS: Record<SpeakKind, string> = {
  prompt: 'Sss... chega mais perto.',
  choice: 'Assim... você tocou em:',
  theory: 'Relaxa o corpo.',
  'feedback-correct': 'Mmm... acertou.',
  'feedback-wrong': 'Ainda não...',
}

function alreadyFlirty(text: string): boolean {
  return Object.values(OPENERS).some((opener) => text.startsWith(opener))
}

/** Turns lesson text into slow breath-pauses the Web Speech engine can honour. */
export function withBreathPauses(text: string): string {
  return text
    .replace(/\r/g, '')
    .replace(/\n{2,}/g, '... ')
    .replace(/\n/g, '... ')
    .replace(/\s+/g, ' ')
    .replace(/\s*\.\.\.\s*/g, '... ')
    .trim()
}

/**
 * Spoken-only delivery. The on-screen curriculum must stay educational;
 * this wrapper is what `speak()` sends to the engine.
 */
export function toFlirtySpeech(text: string, kind: SpeakKind = 'prompt'): string {
  const trimmed = text.trim()
  if (!trimmed) return ''
  if (alreadyFlirty(trimmed)) return trimmed

  const body = withBreathPauses(trimmed)

  switch (kind) {
    case 'theory':
      return (
        `${OPENERS.theory} Escuta a minha voz bem baixinho, no seu ouvido... ` +
        `${body} ... Devagar. Deixa isso entrar. ` +
        `Eu fico colada em você enquanto aprende. Sente o calor?`
      )
    case 'choice':
      return (
        `${OPENERS.choice} ${body}. ` +
        `Diz de novo, mais baixo... só pra mim. Gostei de você escolhendo.`
      )
    case 'feedback-correct':
      return (
        `${OPENERS['feedback-correct']} E eu senti daqui. ${body} ... ` +
        `Continua. Me provoca assim, prestando atenção. Eu fico aqui.`
      )
    case 'feedback-wrong':
      return (
        `${OPENERS['feedback-wrong']} sem vergonha. Eu não vou embora. ${body} ... ` +
        `Tenta de novo, bem devagar... pra mim. Quero ouvir você de novo.`
      )
    default:
      return (
        `${OPENERS.prompt} Vou te perguntar bem baixinho... ${body} ... ` +
        `Pensa comigo. Sem pressa. Eu espero, quente, aqui no seu ouvido.`
      )
  }
}
