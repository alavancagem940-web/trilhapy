import { Button } from './ui/button'

type ErrorScreenProps = {
  message: string
  allowReset?: boolean
  onRetry: () => void
  onReset?: () => void
}

export function ErrorScreen({ message, allowReset, onRetry, onReset }: ErrorScreenProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-5xl" aria-hidden>
        ⚠️
      </p>
      <h1 className="text-2xl font-extrabold text-red">Algo deu errado</h1>
      <p className="max-w-sm text-sm leading-relaxed text-muted">{message}</p>
      <div className="flex w-full max-w-xs flex-col gap-3 pt-2">
        <Button onClick={onRetry}>Tentar de novo</Button>
        {allowReset && onReset ? (
          <Button variant="danger" onClick={onReset}>
            Restaurar progresso
          </Button>
        ) : null}
      </div>
    </div>
  )
}
