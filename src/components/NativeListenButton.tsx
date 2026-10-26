import { Volume2 } from 'lucide-react'
import { NATIVE_LISTEN_LABEL } from '../lib/speech-persona'
import { speak, unlockTts } from '../lib/tts'
import { Button } from './ui/button'

type NativeListenButtonProps = {
  phrase: string
  className?: string
}

export function NativeListenButton({ phrase, className }: NativeListenButtonProps) {
  return (
    <Button
      variant="blue"
      size="sm"
      className={className}
      aria-label={NATIVE_LISTEN_LABEL}
      onClick={(event) => {
        event.stopPropagation()
        unlockTts()
        speak(phrase, 'native')
      }}
    >
      <Volume2 className="size-4 shrink-0" aria-hidden />
      {NATIVE_LISTEN_LABEL}
    </Button>
  )
}
