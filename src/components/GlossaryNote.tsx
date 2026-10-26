import { useEffect, useState } from 'react'
import { firstUnseenTerm, type GlossaryTerm } from '../lib/glossary'
import { ExplainListenButton } from './ExplainListenButton'

type GlossaryNoteProps = {
  text: string
  seen: readonly string[]
  onSeen: (id: string) => void
}

export function GlossaryNote({ text, seen, onSeen }: GlossaryNoteProps) {
  const [term] = useState<GlossaryTerm | null>(() => firstUnseenTerm(text, seen))

  useEffect(() => {
    if (!term) return
    onSeen(term.id)
  }, [term, onSeen])

  if (!term) return null

  return (
    <aside className="mt-3 rounded-2xl border border-gold/50 bg-[#3D3411] px-4 py-3">
      <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-gold">Primeira vez</p>
      <p className="mt-1 text-sm font-extrabold text-white">{term.title}</p>
      <p className="mt-1 text-sm leading-relaxed text-white/90">{term.body}</p>
      <div className="mt-2">
        <ExplainListenButton text={`${term.title}. ${term.body}`} />
      </div>
    </aside>
  )
}
