import { Zap } from 'lucide-react'

type HeaderProps = {
  xp: number
}

export function Header({ xp }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-line/70 bg-ink/95 px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur">
      <p className="font-extrabold text-xl tracking-tight text-green">TrilhaPy</p>
      <p className="flex items-center gap-1 rounded-full bg-card px-3 py-1 text-sm font-extrabold text-white">
        <Zap className="size-4 fill-gold text-gold" aria-hidden />
        {xp} XP
      </p>
    </header>
  )
}
