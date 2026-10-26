export type GlossaryTerm = {
  id: string
  title: string
  body: string
  pattern: RegExp
}

export const GLOSSARY: readonly GlossaryTerm[] = [
  {
    id: 'variavel',
    title: 'Variável',
    body: 'Variável é um nome que aponta para um valor na memória. Pense numa caixa com etiqueta: o nome é a etiqueta, o conteúdo é o valor.',
    pattern: /variável/i,
  },
  {
    id: 'funcao',
    title: 'Função',
    body: 'Função é um bloco de código com nome. Você chama o nome e o Python executa aquele bloco. print é uma função: ela mostra um valor na tela.',
    pattern: /função/i,
  },
  {
    id: 'lista',
    title: 'Lista',
    body: 'Lista é uma sequência ordenada de valores no mesmo nome. O primeiro item fica na posição 0. Você pode acrescentar, ler e percorrer cada item.',
    pattern: /\blista\b/i,
  },
  {
    id: 'loop',
    title: 'Loop',
    body: 'Loop, ou laço, repete um passo enquanto uma condição for verdadeira, ou uma vez para cada item. for e while são os laços do Python.',
    pattern: /\b(loop|laço|repetição)\b/i,
  },
  {
    id: 'dicionario',
    title: 'Dicionário',
    body: 'Dicionário guarda pares de chave e valor. Você pede a chave e recebe o valor, em vez de contar a posição como numa lista.',
    pattern: /dicionário/i,
  },
]

export type GlossarySpan = {
  term: GlossaryTerm
  start: number
  end: number
}

export function glossarySpans(text: string): GlossarySpan[] {
  const found: GlossarySpan[] = []
  for (const term of GLOSSARY) {
    const flags = term.pattern.flags.includes('g') ? term.pattern.flags : `${term.pattern.flags}g`
    const pattern = new RegExp(term.pattern.source, flags)
    for (const match of text.matchAll(pattern)) {
      if (match.index == null || match[0].length === 0) continue
      found.push({ term, start: match.index, end: match.index + match[0].length })
    }
  }
  found.sort((left, right) => left.start - right.start || right.end - left.end)
  const kept: GlossarySpan[] = []
  let cursor = 0
  for (const span of found) {
    if (span.start < cursor) continue
    kept.push(span)
    cursor = span.end
  }
  return kept
}

export function firstUnseenTerm(text: string, seen: readonly string[]): GlossaryTerm | null {
  for (const span of glossarySpans(text)) {
    if (!seen.includes(span.term.id)) return span.term
  }
  return null
}
