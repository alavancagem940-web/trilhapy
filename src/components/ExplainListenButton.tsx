import { Volume2 } from 'lucide-react'
import { EXPLAIN_LISTEN_LABEL } from '../lib/speech-persona'
import { speak, unlockTts } from '../lib/tts'
import { Button } from './ui/button'

type ExplainListenButtonProps = {
  text: string
  className?: string
}

export function ExplainListenButton({ text, className }: ExplainListenButtonProps) {
  return (
    <Button
      variant="gold"
      size="sm"
      className={className}
      aria-label={EXPLAIN_LISTEN_LABEL}
      onClick={(event) => {
        event.stopPropagation()
        unlockTts()
        speak(text, 'explain')
      }}
    >
      <Volume2 className="size-4 shrink-0" aria-hidden />
      {EXPLAIN_LISTEN_LABEL}
    </Button>
  )
}
