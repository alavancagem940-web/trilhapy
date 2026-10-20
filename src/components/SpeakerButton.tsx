import { Volume2 } from 'lucide-react'
import { Button } from './ui/button'

type SpeakerButtonProps = {
  onClick: () => void
  label?: string
}

export function SpeakerButton({ onClick, label = 'Ouvir' }: SpeakerButtonProps) {
  return (
    <Button variant="blue" size="sm" onClick={onClick} aria-label="Ouvir a pergunta de novo">
      <Volume2 className="size-4" aria-hidden />
      {label}
    </Button>
  )
}
