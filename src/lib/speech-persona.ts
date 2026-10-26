export type SpeakKind =
  | 'prompt'
  | 'choice'
  | 'theory'
  | 'native'
  | 'explain'
  | 'feedback-correct'
  | 'feedback-wrong'

/**
 * Turns lesson copy into a single spoken line: collapse newlines and extra
 * spaces. No openers, wrappers, breath-pauses or flirty delivery.
 */
export function toSpokenText(text: string): string {
  return text
    .replace(/\r/g, '')
    .replace(/\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export const NATIVE_LISTEN_LABEL = 'Ouvir Pronúncia Nativa'
export const EXPLAIN_LISTEN_LABEL = 'Ouvir Explicação'

const CODE =
  /[=()[\]{}]|^\s*(print|def|class|for|while|if|elif|else|return|import|from)\b|\b(print|def|class|return|import|True|False|None)\b/

/** Code and English tokens use Jenny. Portuguese sentences use the teacher voice. */
export function choiceSpeakKind(choice: string): 'native' | 'explain' {
  const text = choice.trim()
  if (!text || /[áàâãéêíóôõúüç]/i.test(text)) return 'explain'
  if (CODE.test(text)) return 'native'
  return 'explain'
}
