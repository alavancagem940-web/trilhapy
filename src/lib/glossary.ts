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

export function firstUnseenTerm(text: string, seen: readonly string[]): GlossaryTerm | null {
  for (const term of GLOSSARY) {
    if (seen.includes(term.id)) continue
    if (term.pattern.test(text)) return term
  }
  return null
}
