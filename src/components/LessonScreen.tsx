import { useEffect, useRef, useState } from 'react'
import { ChevronLeft } from 'lucide-react'
import { THEORY_CARD_TITLE, checkAnswer, spokenPrompt, spokenTheory, type Exercise, type Unit } from '../lib/lessons'
import { XP_PER_CORRECT, type ProgressStore } from '../lib/progress'
import { speak, stopTts, unlockTts } from '../lib/tts'
import { Button } from './ui/button'
import { Progress } from './ui/progress'
import { SpeakerButton } from './SpeakerButton'
import { TheoryCard } from './TheoryCard'
import { cn } from '../lib/cn'

type LessonScreenProps = {
  unit: Unit
  store: ProgressStore
  onXp: () => void
  onExit: () => void
  onFinished: (correctCount: number) => void
}

export function LessonScreen({ unit, store, onXp, onExit, onFinished }: LessonScreenProps) {
  const [phase, setPhase] = useState<'theory' | 'quiz'>('theory')
  const [index, setIndex] = useState(0)
  const correctCountRef = useRef(0)
  const [checkedCorrect, setCheckedCorrect] = useState(false)

  const exercise = unit.exercises[index]
  const total = unit.exercises.length
  const progressValue =
    phase === 'theory' ? 0 : ((index + (checkedCorrect ? 1 : 0)) / Math.max(1, total)) * 100

  useEffect(() => () => stopTts(), [])

  if (phase === 'theory') {
    return (
      <TheoryCard
        unit={unit}
        onExit={onExit}
        onContinue={() => {
          setPhase('quiz')
          const first = unit.exercises[0]
          if (first) speak(spokenPrompt(first), 'prompt')
        }}
      />
    )
  }

  if (!exercise) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
        <h1 className="text-xl font-extrabold text-red">Lição não encontrada</h1>
        <Button variant="outline" onClick={onExit}>
          Voltar à trilha
        </Button>
      </div>
    )
  }

  const kindLabel = unit.kind === 'challenge' ? 'Desafio' : 'Lição'

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center gap-3 px-4 pt-3">
        <Button variant="outline" size="sm" onClick={onExit} aria-label="Sair da lição">
          <ChevronLeft className="size-4" aria-hidden />
          Sair
        </Button>
        <p className="min-w-0 flex-1 truncate text-sm font-extrabold text-white">
          {kindLabel} · {unit.title}
        </p>
      </div>
      <div className="px-4 pt-3">
        <Progress value={progressValue} />
        <button
          type="button"
          className="mt-2 text-left text-xs font-extrabold text-gold underline decoration-gold/40 underline-offset-4"
          onClick={() => {
            setPhase('theory')
            speak(spokenTheory(unit), 'theory')
          }}
        >
          Ver {THEORY_CARD_TITLE}
        </button>
      </div>
      <ExercisePanel
        key={exercise.id}
        exercise={exercise}
        index={index}
        total={total}
        onCorrect={() => {
          correctCountRef.current += 1
          setCheckedCorrect(true)
          store.addXp(XP_PER_CORRECT)
          onXp()
        }}
        onIncorrect={() => setCheckedCorrect(false)}
        onRetry={() => {
          setCheckedCorrect(false)
        }}
        onAdvance={() => {
          const next = index + 1
          if (next >= total) {
            onFinished(correctCountRef.current)
            return
          }
          setCheckedCorrect(false)
          setIndex(next)
          const upcoming = unit.exercises[next]
          if (upcoming) speak(spokenPrompt(upcoming), 'prompt')
        }}
      />
    </div>
  )
}

type ExercisePanelProps = {
  exercise: Exercise
  index: number
  total: number
  onCorrect: () => void
  onIncorrect: () => void
  onRetry: () => void
  onAdvance: () => void
}

function ExercisePanel({
  exercise,
  index,
  total,
  onCorrect,
  onIncorrect,
  onRetry,
  onAdvance,
}: ExercisePanelProps) {
  const [selected, setSelected] = useState<string | null>(null)
  const [fillValue, setFillValue] = useState('')
  const [orderBuilt, setOrderBuilt] = useState<string[]>([])
  const [pool, setPool] = useState(() => shuffleLines(exercise))
  const [checked, setChecked] = useState(false)
  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null)
  const [message, setMessage] = useState('')
  const [hint, setHint] = useState('')
  const fillRef = useRef<HTMLInputElement>(null)

  function liveFillValue(): string {
    return fillRef.current?.value ?? fillValue
  }

  function currentSubmission(): unknown {
    if (exercise.type === 'multiple_choice') return selected
    if (exercise.type === 'fill_blank') return liveFillValue()
    return orderBuilt
  }

  function retryInPlace() {
    setChecked(false)
    setLastCorrect(null)
    setMessage('')
    setHint('')
    onRetry()
    window.setTimeout(() => fillRef.current?.focus(), 40)
  }

  function verify() {
    unlockTts()
    if (checked) return
    const fillNow = liveFillValue()
    if (exercise.type === 'fill_blank' && fillNow !== fillValue) {
      setFillValue(fillNow)
    }
    if (exercise.type === 'multiple_choice' && !selected) {
      setHint('Escolha uma alternativa para verificar.')
      return
    }
    if (exercise.type === 'fill_blank' && !fillNow.trim()) {
      setHint('Digite uma resposta antes de verificar.')
      return
    }
    if (exercise.type === 'order_code' && orderBuilt.length !== exercise.lines.length) {
      setHint('Use todas as linhas, na ordem que você acha correta.')
      return
    }
    setHint('')
    const submission = exercise.type === 'fill_blank' ? fillNow : currentSubmission()
    const result = checkAnswer(exercise, submission)
    setChecked(true)
    setLastCorrect(result.correct)
    setMessage(result.message)
    speak(
      result.correct ? exercise.explainCorrect : exercise.explainWrong,
      result.correct ? 'feedback-correct' : 'feedback-wrong',
    )
    if (result.correct) onCorrect()
    else onIncorrect()
  }

  return (
    <>
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 pt-4 pb-36">
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-xs font-bold text-muted">
            Pergunta {index + 1} de {total}
          </p>
          <SpeakerButton onClick={() => speak(spokenPrompt(exercise), 'prompt')} />
        </div>
        <h1 className="whitespace-pre-wrap text-[1.35rem] font-extrabold leading-snug text-white">{exercise.prompt}</h1>

        {exercise.type === 'multiple_choice' ? (
          <ul className="mt-5 flex flex-col gap-3">
            {exercise.choices.map((choice) => {
              const isSelected = selected === choice
              const showGreen = checked && lastCorrect && choice === exercise.answer
              const showRed = checked && lastCorrect === false && choice === selected
              return (
                <li key={choice}>
                  <button
                    type="button"
                    disabled={checked}
                    onClick={() => {
                      setSelected(choice)
                      speak(choice, 'choice')
                    }}
                    className={cn(
                      'w-full rounded-2xl border-2 px-4 py-3.5 text-left text-[0.95rem] font-bold leading-snug text-white transition-colors touch-manipulation',
                      showGreen && 'border-green bg-green text-[#102012]',
                      showRed && 'border-red bg-red',
                      !checked && isSelected && 'border-blue bg-[#1A3340]',
                      !checked && !isSelected && 'border-line bg-card',
                      checked && !showGreen && !showRed && 'border-line bg-card opacity-60',
                    )}
                  >
                    {choice}
                  </button>
                </li>
              )
            })}
          </ul>
        ) : null}

        {exercise.type === 'fill_blank' ? (
          <div className="mt-5">
            <p className="text-xs text-muted">Digite a resposta (código ou texto, conforme o enunciado).</p>
            <input
              ref={fillRef}
              value={fillValue}
              disabled={checked}
              autoCapitalize="off"
              autoCorrect="off"
              autoComplete="off"
              spellCheck={false}
              placeholder="Sua resposta"
              onChange={(event) => setFillValue(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') verify()
              }}
              className={cn(
                'mt-2 h-12 w-full rounded-2xl border-2 bg-card px-4 font-mono text-sm text-white outline-none placeholder:text-muted',
                checked && lastCorrect && 'border-green bg-green-soft',
                checked && lastCorrect === false && 'border-red bg-red-soft',
                !checked && 'border-line focus:border-blue',
              )}
            />
          </div>
        ) : null}

        {exercise.type === 'order_code' ? (
          <div className="mt-5">
            <p className="text-xs text-muted">Toque nas linhas na ordem correta. Cada toque é lido em voz alta.</p>
            <div className="mt-3 rounded-2xl border border-line bg-card/80 p-3">
              {orderBuilt.length === 0 ? (
                <p className="px-1 py-2 text-sm text-muted">Sua ordem aparece aqui.</p>
              ) : (
                <ol className="flex flex-col gap-2">
                  {orderBuilt.map((line, lineIndex) => (
                    <li
                      key={`built-${lineIndex}-${line}`}
                      className="rounded-xl bg-ink px-3 py-2 font-mono text-[13px] text-white"
                    >
                      {line}
                    </li>
                  ))}
                </ol>
              )}
            </div>
            <div className="mt-3 flex flex-col gap-2">
              {pool.map((line, lineIndex) => (
                <button
                  key={`pool-${lineIndex}-${line}`}
                  type="button"
                  disabled={checked}
                  onClick={() => {
                    setPool((current) => {
                      const copy = [...current]
                      copy.splice(lineIndex, 1)
                      return copy
                    })
                    setOrderBuilt((built) => [...built, line])
                    speak(line, 'choice')
                  }}
                  className="rounded-2xl border-2 border-line bg-card px-4 py-3 text-left font-mono text-[13px] text-white touch-manipulation"
                >
                  {line}
                </button>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              disabled={checked || orderBuilt.length === 0}
              onClick={() => {
                const last = orderBuilt[orderBuilt.length - 1]
                if (!last) return
                setOrderBuilt((built) => built.slice(0, -1))
                setPool((current) => [...current, last])
              }}
            >
              Desfazer
            </Button>
          </div>
        ) : null}

        {hint ? (
          <p className="mt-4 rounded-2xl bg-[#3D3411] px-4 py-3 text-sm font-bold text-gold">{hint}</p>
        ) : null}
      </div>

      <div className="sticky bottom-0 border-t border-line/80 bg-ink/95 px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur">
        {!checked ? (
          <Button size="lg" onClick={verify}>
            Verificar
          </Button>
        ) : lastCorrect ? (
          <div className="rounded-2xl bg-green-soft p-4">
            <p className="font-extrabold text-green">Correto! +{XP_PER_CORRECT} XP</p>
            <p className="mt-2 text-[11px] font-extrabold uppercase tracking-[0.14em] text-green">
              Por que está certo
            </p>
            <p className="mt-1 text-sm leading-relaxed text-white/90">{message}</p>
            <Button className="mt-3 w-full" onClick={onAdvance}>
              Continuar
            </Button>
          </div>
        ) : (
          <div className="rounded-2xl bg-red-soft p-4">
            <p className="font-extrabold text-red">Ainda não</p>
            <p className="mt-2 text-[11px] font-extrabold uppercase tracking-[0.14em] text-red">
              O motivo correto
            </p>
            <p className="mt-1 text-sm leading-relaxed text-white/90">{message}</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Button variant="outline" className="border-red text-red" onClick={retryInPlace}>
                Tentar de novo
              </Button>
              <Button variant="danger" onClick={onAdvance}>
                Avançar
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

function shuffleLines(exercise: Exercise): string[] {
  const pool = [...exercise.lines]
  if (pool.length < 2) return pool
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    const current = pool[i]!
    pool[i] = pool[j]!
    pool[j] = current
  }
  if (pool.every((line, i) => line === exercise.lines[i])) {
    const first = pool[0]!
    pool[0] = pool[pool.length - 1]!
    pool[pool.length - 1] = first
  }
  return pool
}
