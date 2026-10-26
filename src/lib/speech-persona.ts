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
