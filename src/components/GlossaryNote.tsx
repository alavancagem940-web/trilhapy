import { useState } from 'react'
import { glossarySpans, type GlossarySpan } from '../lib/glossary'
import { ExplainListenButton } from './ExplainListenButton'

type GlossaryTextProps = {
  text: string
  seen: readonly string[]
  onSeen: (id: string) => void
}

function spanKey(span: GlossarySpan): string {
  return `${span.term.id}:${span.start}`
}

export function GlossaryText({ text, seen, onSeen }: GlossaryTextProps) {
  const spans = glossarySpans(text)
  const unseen = spans.find((span) => !seen.includes(span.term.id))
  const [sentence, setSentence] = useState(text)
  const [closed, setClosed] = useState(false)
  const [manual, setManual] = useState<string | null>(null)
  if (sentence !== text) {
    setSentence(text)
    setClosed(false)
    setManual(null)
  }
  const autoKey = !closed && unseen ? spanKey(unseen) : null
  const openKey = manual ?? autoKey

  function remember(id: string) {
    onSeen(id)
  }

  const parts: Array<string | GlossarySpan> = []
  let cursor = 0
  for (const span of spans) {
    if (span.start > cursor) parts.push(text.slice(cursor, span.start))
    parts.push(span)
    cursor = span.end
  }
  if (cursor < text.length) parts.push(text.slice(cursor))

  const openSpan = spans.find((span) => spanKey(span) === openKey)

  return (
    <>
      {parts.map((part, index) => {
        if (typeof part === 'string') return <span key={`text-${index}`}>{part}</span>
        const key = spanKey(part)
        const open = openKey === key
        return (
          <button
            key={key}
            type="button"
            className="rounded px-0.5 text-gold underline decoration-dotted decoration-gold underline-offset-[5px]"
            aria-expanded={open}
            onClick={(event) => {
              event.stopPropagation()
              if (open) {
                setManual(null)
                setClosed(true)
                remember(part.term.id)
                return
              }
              setClosed(true)
              setManual(key)
              remember(part.term.id)
            }}
          >
            {text.slice(part.start, part.end)}
          </button>
        )
      })}
      {openSpan ? (
        <span
          role="note"
          className="relative mt-3 block w-full rounded-2xl border border-gold/50 bg-[#3D3411] px-3 py-3 text-left text-base font-medium shadow-[0_10px_24px_rgba(0,0,0,0.35)]"
        >
          <span
            aria-hidden
            className="absolute -top-1.5 left-6 size-3 rotate-45 border-t border-l border-gold/50 bg-[#3D3411]"
          />
          <span className="block text-[11px] font-extrabold uppercase tracking-[0.14em] text-gold">Termo da aula</span>
          <span className="mt-1 block text-sm font-extrabold text-white">{openSpan.term.title}</span>
          <span className="mt-1 block text-sm leading-relaxed text-white/90">{openSpan.term.body}</span>
          <span className="mt-2 flex items-center justify-between gap-2">
            <ExplainListenButton text={`${openSpan.term.title}. ${openSpan.term.body}`} />
            <button
              type="button"
              className="text-xs font-bold text-gold underline"
              onClick={(event) => {
                event.stopPropagation()
                setManual(null)
                setClosed(true)
                remember(openSpan.term.id)
              }}
            >
              Fechar
            </button>
          </span>
        </span>
      ) : null}
    </>
  )
}

type GlossaryNoteProps = GlossaryTextProps

export function GlossaryNote(props: GlossaryNoteProps) {
  return <GlossaryText {...props} />
}
