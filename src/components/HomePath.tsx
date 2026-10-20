import { Check, Lock, Star, Trophy } from 'lucide-react'
import { LEVELS, type Level, type Unit } from '../lib/lessons'
import { isStandaloneDisplay, type TtsStatus } from '../lib/tts'
import type { ProgressStore } from '../lib/progress'
import { Button } from './ui/button'
import { cn } from '../lib/cn'

type HomePathProps = {
  store: ProgressStore
  tts: TtsStatus
  onStart: (unitId: string) => void
  onReset: () => void
  onInstall?: () => void
  canInstall?: boolean
}

const ZIGZAG = ['translate-x-0', 'translate-x-12', '-translate-x-10', 'translate-x-8'] as const

export function HomePath({ store, tts, onStart, onReset, onInstall, canInstall }: HomePathProps) {
  const current = store.currentUnit()
  const standalone = isStandaloneDisplay()
  const empty = store.isEmpty()

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-auto px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
      <section className="pt-5 pb-2">
        <h1 className="text-[1.65rem] font-extrabold leading-tight text-white">Sua trilha de Python</h1>
        <p className="mt-1 text-sm leading-relaxed text-muted">
          {empty
            ? 'Você ainda não ganhou XP. Comece pelo Nível 1 — Básico.'
            : 'Continue de onde parou. Cada módulo só abre o próximo depois do desafio (~75%).'}
        </p>
        <p className="mt-2 text-xs text-muted">Leitor de voz: {tts.label}</p>
        {tts.hint ? <p className="mt-2 text-xs leading-relaxed text-gold">{tts.hint}</p> : null}
      </section>

      {!standalone ? (
        <div className="mt-3 rounded-2xl border border-line bg-card px-4 py-3 text-sm text-muted">
          <p className="font-bold text-white">Instalar no celular</p>
          <p className="mt-1 leading-relaxed">
            iPhone: um toque instala o perfil e coloca o ícone na Tela de Início. Depois abra Ajustes →
            Perfil baixado → Instalar.
          </p>
          <a
            className="mt-3 flex h-12 w-full items-center justify-center rounded-2xl bg-primary text-sm font-extrabold text-primary-foreground"
            href="./trilhapy.mobileconfig"
          >
            Instalar no iPhone
          </a>
          {canInstall && onInstall ? (
            <Button className="mt-2 w-full" variant="blue" onClick={onInstall}>
              Instalar no Android
            </Button>
          ) : null}
        </div>
      ) : null}

      <ol className="mt-6 flex flex-col gap-10">
        {LEVELS.map((level) => (
          <LevelSection
            key={level.id}
            level={level}
            store={store}
            currentUnitId={current?.unit.id}
            onStart={onStart}
          />
        ))}
      </ol>

      <p className="mt-10 text-center text-xs leading-relaxed text-muted">
        Progresso salvo só neste aparelho, no navegador. Sem conta, sem nuvem e sem vidas.
      </p>
      <button
        type="button"
        className="mx-auto mt-3 mb-4 text-xs font-bold text-muted underline decoration-line underline-offset-4"
        onClick={onReset}
      >
        Restaurar progresso
      </button>
    </div>
  )
}

function LevelSection({
  level,
  store,
  currentUnitId,
  onStart,
}: {
  level: Level
  store: ProgressStore
  currentUnitId?: string
  onStart: (unitId: string) => void
}) {
  const unlocked = store.isLevelUnlocked(level.id)
  return (
    <li>
      <div className="mb-5 text-center">
        <p className={cn('text-xs font-extrabold uppercase tracking-[0.18em]', unlocked ? 'text-gold' : 'text-muted')}>
          {level.band}
        </p>
        <h2 className={cn('mt-1 text-lg font-extrabold', unlocked ? 'text-white' : 'text-muted')}>{level.title}</h2>
        <p className="mx-auto mt-1 max-w-[20rem] text-xs leading-relaxed text-muted">{level.description}</p>
        {!unlocked ? (
          <p className="mt-2 text-xs font-bold text-muted">Bloqueado até passar no desafio do nível anterior.</p>
        ) : null}
      </div>
      <div className="relative mx-auto flex max-w-[20rem] flex-col items-center">
        <div className="absolute top-8 bottom-8 left-1/2 w-1.5 -translate-x-1/2 rounded-full bg-line" aria-hidden />
        {level.units.map((unit, index) => (
          <PathNode
            key={unit.id}
            unit={unit}
            index={index}
            complete={store.isUnitComplete(unit.id)}
            available={unlocked && store.isUnitUnlocked(level.id, unit.id)}
            current={unit.id === currentUnitId}
            onStart={onStart}
          />
        ))}
      </div>
    </li>
  )
}

function PathNode({
  unit,
  index,
  complete,
  available,
  current,
  onStart,
}: {
  unit: Unit
  index: number
  complete: boolean
  available: boolean
  current: boolean
  onStart: (unitId: string) => void
}) {
  const challenge = unit.kind === 'challenge'
  const locked = !available
  return (
    <div className={cn('relative z-10 mb-8 flex w-full flex-col items-center', ZIGZAG[index % ZIGZAG.length])}>
      <button
        type="button"
        disabled={locked}
        onClick={() => onStart(unit.id)}
        aria-label={`${unit.title}. ${complete ? 'Concluída' : available ? 'Disponível' : 'Bloqueada'}`}
        className={cn(
          'flex size-[4.6rem] items-center justify-center rounded-full border-[3.5px] shadow-[0_6px_0_0_rgba(0,0,0,0.35)] transition-transform touch-manipulation',
          complete && 'border-green-dark bg-green text-white',
          !complete && available && !challenge && 'border-[#3C9A02] bg-green text-white',
          !complete && available && challenge && 'border-[#C99B00] bg-gold text-[#102012]',
          locked && 'border-[#3A4B52] bg-[#24333A] text-muted',
          current && 'scale-110 ring-4 ring-gold/70 animate-[pulse-ring_1.8s_ease-in-out_infinite]',
          !locked && 'active:translate-y-1',
        )}
      >
        {complete ? (
          <Check className="size-8 stroke-[3]" aria-hidden />
        ) : locked ? (
          <Lock className="size-7" aria-hidden />
        ) : challenge ? (
          <Trophy className="size-8" aria-hidden />
        ) : (
          <Star className="size-8 fill-white/20" aria-hidden />
        )}
      </button>
      <p className="mt-2 max-w-[11rem] text-center text-sm font-extrabold leading-tight text-white">{unit.title}</p>
      <p className="mt-0.5 max-w-[13rem] text-center text-[11px] leading-snug text-muted">
        {complete ? 'Concluída · Revisar' : available ? (challenge ? 'Desafio liberado' : 'Disponível') : 'Bloqueada'}
      </p>
    </div>
  )
}
