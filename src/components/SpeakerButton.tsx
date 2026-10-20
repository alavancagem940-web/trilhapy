import { Volume2 } from 'lucide-react'
import { Button } from './ui/button'

type SpeakerButtonProps = {
  onClick: () => void
  label?: string
  ariaLabel?: string
}

export function SpeakerButton({
  onClick,
  label = 'Ouvir',
  ariaLabel = 'Ouvir a pergunta de novo',
}: SpeakerButtonProps) {
  return (
    <Button variant="blue" size="sm" onClick={onClick} aria-label={ariaLabel}>
      <Volume2 className="size-4" aria-hidden />
      {label}
    </Button>
  )
}
