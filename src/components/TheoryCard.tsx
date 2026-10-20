import { ChevronLeft } from 'lucide-react'
import { THEORY_CARD_TITLE, spokenTheory, type Unit } from '../lib/lessons'
import { speak, unlockTts } from '../lib/tts'
import { Button } from './ui/button'
import { SpeakerButton } from './SpeakerButton'

type TheoryCardProps = {
  unit: Unit
  onContinue: () => void
  onExit: () => void
}

export function TheoryCard({ unit, onContinue, onExit }: TheoryCardProps) {
  const theory = unit.theory
  const continueLabel = unit.kind === 'challenge' ? 'Começar o desafio' : 'Começar os exercícios'

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center gap-3 px-4 pt-3">
        <Button variant="outline" size="sm" onClick={onExit} aria-label="Sair da lição">
          <ChevronLeft className="size-4" aria-hidden />
          Sair
        </Button>
        <p className="min-w-0 flex-1 truncate text-sm font-extrabold text-white">{unit.title}</p>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 pt-4 pb-36">
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-xs font-bold text-muted">Leia antes de praticar</p>
          <SpeakerButton
            ariaLabel="Ouvir a explicação de novo"
            onClick={() => {
              unlockTts()
              speak(spokenTheory(unit), 'theory')
            }}
          />
        </div>

        <section className="rounded-3xl border-2 border-gold bg-card px-4 py-4 shadow-[0_6px_0_0_rgba(0,0,0,0.28)]">
          <h1 className="text-[1.35rem] font-extrabold leading-snug text-gold">{THEORY_CARD_TITLE}</h1>
          <p className="mt-1 text-sm font-bold text-white">{unit.subtitle}</p>

          <div className="mt-5">
            <h2 className="text-xs font-extrabold uppercase tracking-[0.16em] text-gold">1. Conceito</h2>
            <p className="mt-2 text-sm leading-relaxed text-white/90">{theory.concept}</p>
          </div>

          <div className="mt-5">
            <h2 className="text-xs font-extrabold uppercase tracking-[0.16em] text-gold">2. Sintaxe</h2>
            <p className="mt-2 text-sm leading-relaxed text-white/90">{theory.syntax}</p>
            <CodeBlock code={theory.syntaxCode} />
          </div>

          <div className="mt-5">
            <h2 className="text-xs font-extrabold uppercase tracking-[0.16em] text-gold">3. Exemplos</h2>
            <ol className="mt-2 flex flex-col gap-4">
              {theory.examples.map((example) => (
                <li key={example.caption}>
                  <p className="text-sm font-extrabold text-white">{example.caption}</p>
                  <CodeBlock code={example.code} />
                  {example.output ? (
                    <div className="mt-2 rounded-2xl bg-ink px-3 py-2">
                      <p className="text-[11px] font-extrabold uppercase tracking-wide text-muted">Saída</p>
                      <pre className="mt-1 overflow-x-auto font-mono text-[12px] leading-relaxed whitespace-pre text-green">
                        {example.output}
                      </pre>
                    </div>
                  ) : null}
                </li>
              ))}
            </ol>
          </div>
        </section>
      </div>

      <div className="sticky bottom-0 border-t border-line/80 bg-ink/95 px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur">
        <Button
          size="lg"
          onClick={() => {
            unlockTts()
            onContinue()
          }}
        >
          {continueLabel}
        </Button>
      </div>
    </div>
  )
}

function CodeBlock({ code }: { code: string }) {
  return (
    <pre className="mt-2 overflow-x-auto rounded-2xl bg-ink px-3 py-3 font-mono text-[12px] leading-relaxed whitespace-pre text-[#d7e6ec]">
      {code}
    </pre>
  )
}
