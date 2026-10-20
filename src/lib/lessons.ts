export type ExerciseType = 'multiple_choice' | 'fill_blank' | 'order_code'
export type UnitKind = 'lesson' | 'challenge'
export type NormalizeMode = 'text' | 'code'

export type Exercise = {
  id: string
  type: ExerciseType
  prompt: string
  explainCorrect: string
  explainWrong: string
  speak?: string
  choices: string[]
  answer: string | string[]
  accepted: string[]
  lines: string[]
  normalize: NormalizeMode
}

export type Unit = {
  id: string
  title: string
  subtitle: string
  kind: UnitKind
  xpReward: number
  exercises: Exercise[]
}

export type Level = {
  id: string
  order: number
  band: string
  title: string
  description: string
  units: Unit[]
}

export type CheckResult = {
  correct: boolean
  message: string
}

export function spokenPrompt(exercise: Exercise): string {
  return exercise.speak ?? exercise.prompt
}

function mc(
  id: string,
  prompt: string,
  choices: readonly string[],
  answer: string,
  explainCorrect: string,
  explainWrong: string,
  speak?: string,
): Exercise {
  if (!choices.includes(answer)) {
    throw new Error(`Resposta '${answer}' não está nas alternativas de ${id}`)
  }
  return {
    id,
    type: 'multiple_choice',
    prompt,
    choices: [...choices],
    answer,
    accepted: [],
    lines: [],
    explainCorrect,
    explainWrong,
    speak,
    normalize: 'text',
  }
}

function fill(
  id: string,
  prompt: string,
  accepted: readonly string[],
  explainCorrect: string,
  explainWrong: string,
  speak?: string,
  normalize: NormalizeMode = 'code',
): Exercise {
  return {
    id,
    type: 'fill_blank',
    prompt,
    choices: [],
    answer: accepted[0] ?? '',
    accepted: [...accepted],
    lines: [],
    explainCorrect,
    explainWrong,
    speak,
    normalize,
  }
}

function order(
  id: string,
  prompt: string,
  lines: readonly string[],
  explainCorrect: string,
  explainWrong: string,
  speak?: string,
): Exercise {
  return {
    id,
    type: 'order_code',
    prompt,
    choices: [],
    answer: [...lines],
    accepted: [],
    lines: [...lines],
    explainCorrect,
    explainWrong,
    speak,
    normalize: 'code',
  }
}

function tidyInput(value: string): string {
  return value
    .replace(/[\u200b\u200c\u200d\ufeff]/g, '')
    .replace(/\u00a0|\u202f|\u2007/g, ' ')
    .replace(/\uff1d/g, '=')
    .replace(/\u201c|\u201d|\u2018|\u2019/g, "'")
    .trim()
}

function normText(value: string): string {
  return tidyInput(value).toLowerCase().replace(/\s+/g, ' ')
}

function normCode(value: string): string {
  const text = tidyInput(value)
    .toLowerCase()
    .replace(/[.;]+$/g, '')
    .replaceAll('"', "'")
    .replaceAll('“', "'")
    .replaceAll('”', "'")
    .replaceAll('‘', "'")
    .replaceAll('’', "'")
    .replaceAll('«', "'")
    .replaceAll('»', "'")
  return text.replace(/\s+/g, '')
}

/** Also accept `nome = "Ana"` or `Ana` when the blank lists `"Ana"`. */
const ASSIGN_PREFIX = /^[a-z_][\w.]*\s*=\s*/

function unwrapQuotes(value: string): string {
  if (value.length < 2) return value
  const start = value[0]
  const end = value[value.length - 1]
  if ((start === "'" && end === "'") || (start === '"' && end === '"')) {
    return value.slice(1, -1)
  }
  return value
}

function fillVariants(normalized: string): string[] {
  const values = new Set<string>([normalized])
  const withoutAssign = normalized.replace(ASSIGN_PREFIX, '')
  if (withoutAssign !== normalized && withoutAssign.length > 0) {
    values.add(withoutAssign)
  }
  for (const current of [...values]) {
    const unquoted = unwrapQuotes(current)
    if (unquoted !== current && unquoted.length > 0) values.add(unquoted)
  }
  return [...values]
}

function fillMatches(accepted: readonly string[], submission: string, norm: (value: string) => string): boolean {
  const got = fillVariants(norm(submission))
  return accepted.some((item) => {
    const want = fillVariants(norm(item))
    return got.some((value) => want.includes(value))
  })
}

function fillWrongMessage(exercise: Exercise, submission: string): string {
  const typed = submission.trim()
  const examples = [...new Set(exercise.accepted)].slice(0, 3).join(', ')
  if (!typed) return exercise.explainWrong
  return `Ainda não. Você digitou: ${typed}. Formas que passam: ${examples}.`
}

export function checkAnswer(exercise: Exercise, submission: unknown): CheckResult {
  let ok = false
  if (exercise.type === 'multiple_choice') {
    ok = String(submission) === String(exercise.answer)
  } else if (exercise.type === 'fill_blank') {
    const norm = exercise.normalize === 'code' ? normCode : normText
    ok = fillMatches(exercise.accepted, String(submission), norm)
  } else if (exercise.type === 'order_code') {
    const got = Array.isArray(submission) ? submission.map(String) : []
    const expected = exercise.lines
    ok = got.length === expected.length && got.every((line, i) => line === expected[i])
  }
  let message = ok ? exercise.explainCorrect : exercise.explainWrong
  if (ok === false && exercise.type === 'fill_blank') {
    message = fillWrongMessage(exercise, String(submission))
  }
  return { correct: ok, message }
}

export function challengePassThreshold(total: number): number {
  return Math.max(1, Math.ceil(total * 0.75))
}

export function getLevel(levelId: string): Level | undefined {
  return LEVELS.find((level) => level.id === levelId)
}

export function unitById(unitId: string): Unit | undefined {
  for (const [, unit] of iterUnits()) {
    if (unit.id === unitId) return unit
  }
  return undefined
}

export function levelForUnit(unitId: string): Level | undefined {
  for (const [level, unit] of iterUnits()) {
    if (unit.id === unitId) return level
  }
  return undefined
}

export function* iterUnits(): Generator<[Level, Unit]> {
  for (const level of LEVELS) {
    for (const unit of level.units) {
      yield [level, unit]
    }
  }
}

export function validateCurriculum(): void {
  if (LEVELS.length === 0) throw new Error('Currículo vazio.')
  const seen = new Set<string>()
  for (const level of LEVELS) {
    if (level.units.length === 0) throw new Error(`Nível ${level.id} sem unidades.`)
    if (level.units[level.units.length - 1]?.kind !== 'challenge') {
      throw new Error(`Nível ${level.id} precisa terminar com um desafio.`)
    }
    for (const unit of level.units) {
      if (seen.has(unit.id)) throw new Error(`Unidade duplicada: ${unit.id}`)
      seen.add(unit.id)
      if (unit.exercises.length < 3) {
        throw new Error(`Unidade ${unit.id} precisa de pelo menos 3 exercícios.`)
      }
      for (const exercise of unit.exercises) {
        if (exercise.type === 'multiple_choice' && !exercise.choices.includes(String(exercise.answer))) {
          throw new Error(`Alternativa inválida em ${exercise.id}`)
        }
        if (exercise.type === 'fill_blank' && exercise.accepted.length === 0) {
          throw new Error(`Sem respostas aceitas em ${exercise.id}`)
        }
        if (exercise.type === 'order_code' && exercise.lines.length < 2) {
          throw new Error(`Ordem incompleta em ${exercise.id}`)
        }
      }
    }
  }
}

export const LEVELS: Level[] = [
  {
    id: 'nivel_1',
    order: 1,
    band: 'Básico',
    title: 'Nível 1 · Básico',
    description: 'Lógica do dia a dia, variáveis, tipos de dados e print.',
    units: [
      {
        id: 'n1_logica_variaveis',
        title: 'Lógica e variáveis',
        subtitle: 'Pense em passos e guarde valores em caixinhas nomeadas.',
        kind: 'lesson',
        xpReward: 20,
        exercises: [
          mc(
            'n1_q1',
            'Uma regra diz: se está chovendo, leve o guarda-chuva. Está chovendo. O que você faz?',
            ['Fica em casa de qualquer jeito', 'Leva o guarda-chuva', 'Espera o sol sem decidir nada'],
            'Leva o guarda-chuva',
            'Isso: a condição é verdadeira, então a ação acontece.',
            "Se a condição 'está chovendo' é verdadeira, a ação da regra deve acontecer.",
          ),
          mc(
            'n1_q2',
            'O que é uma variável em Python?',
            [
              'Um botão da janela do programa',
              'Um nome que guarda um valor na memória',
              'Um erro que o Python inventa',
            ],
            'Um nome que guarda um valor na memória',
            'Perfeito. `nome = "Ana"` cria a caixinha `nome` com o valor Ana.',
            'Variável é um nome que aponta para um valor, como uma etiqueta em uma caixa.',
          ),
          fill(
            'n1_q3',
            'Complete para guardar o texto Ana na variável nome:\n\nnome = ?',
            ['"Ana"', "'Ana'", 'nome = "Ana"', "nome = 'Ana'"],
            'Isso. Aspas marcam texto (string).',
            'Pode ser "Ana", Ana, ou a linha inteira nome = "Ana".',
            'Complete para guardar o texto Ana na variável nome. nome igual a quê?',
          ),
          order(
            'n1_q4',
            'Ordene o código para criar a variável e depois mostrar o valor.',
            ['nome = "Lia"', 'print(nome)'],
            'Primeiro guardamos o valor, depois usamos. Ordem importa.',
            'Crie a variável antes de imprimir. Senão o Python não conhece o nome.',
            'Ordene o código para criar a variável e depois mostrar o valor.',
          ),
        ],
      },
      {
        id: 'n1_tipos_print',
        title: 'Tipos e print',
        subtitle: 'Números, texto, verdadeiro/falso e mostrar na tela.',
        kind: 'lesson',
        xpReward: 20,
        exercises: [
          mc(
            'n1_q5',
            'Qual é o tipo do valor 10?',
            ['str (texto)', 'int (número inteiro)', 'bool (verdadeiro/falso)'],
            'int (número inteiro)',
            '10 é um inteiro: não tem parte decimal.',
            'Números sem ponto decimal são int. Texto iria entre aspas.',
          ),
          mc(
            'n1_q6',
            'Qual é o tipo de "10"?',
            ['int', 'float', 'str'],
            'str',
            'Aspas transformam 10 em texto. "10" não serve para somar como número.',
            'Tudo entre aspas é str, mesmo que pareça número.',
          ),
          mc(
            'n1_q7',
            'O que a função print faz?',
            ['Apaga a variável', 'Mostra o valor na tela', 'Pede uma senha ao sistema'],
            'Mostra o valor na tela',
            'print envia o conteúdo para a saída, em geral a tela.',
            'print não calcula sozinho: ele mostra o que você passou.',
          ),
          fill(
            'n1_q8',
            'Escreva a linha que mostra exatamente Olá, mundo na tela.',
            ['print("Olá, mundo")', "print('Olá, mundo')", 'print("Olá, mundo");'],
            'Assim o Python escreve o texto na tela.',
            'Use print e aspas: print("Olá, mundo")',
            'Escreva a linha que mostra exatamente Olá, mundo na tela.',
          ),
        ],
      },
      {
        id: 'n1_desafio',
        title: 'Desafio do Nível 1',
        subtitle: 'Passe neste teste para desbloquear o Nível 2.',
        kind: 'challenge',
        xpReward: 40,
        exercises: [
          mc(
            'n1_c1',
            'Qual linha cria uma variável idade com o número 20?',
            ['print(idade)', 'idade = 20', '20 = idade'],
            'idade = 20',
            'O nome fica à esquerda, o valor à direita do =.',
            'Em Python escrevemos nome = valor, nunca o contrário.',
          ),
          fill(
            'n1_c2',
            'O que este programa imprime?\n\nnome = "Bo"\nprint(nome)\n\nDigite só o texto que aparece.',
            ['Bo'],
            'A variável nome guarda Bo, e print mostra esse valor.',
            'print(nome) mostra o conteúdo da variável, não a palavra nome.',
            'O que este programa imprime? nome igual a Bo, print nome. Digite só o texto que aparece.',
            'text',
          ),
          mc(
            'n1_c3',
            'True é um valor de qual tipo?',
            ['str', 'int', 'bool'],
            'bool',
            'True e False são booleanos: verdadeiro ou falso.',
            'True não é texto nem número: é bool.',
          ),
          order(
            'n1_c4',
            'Ordene: guardar um recado e imprimir.',
            ['recado = "oi"', 'print(recado)'],
            'Guardar e depois mostrar: dois passos claros.',
            'Sem criar recado primeiro, o print não tem o que ler.',
          ),
        ],
      },
    ],
  },
  {
    id: 'nivel_2',
    order: 2,
    band: 'Elementar',
    title: 'Nível 2 · Elementar',
    description: 'Decisões com if/else e operadores lógicos and, or e not.',
    units: [
      {
        id: 'n2_if_else',
        title: 'if e else',
        subtitle: 'O programa escolhe um caminho conforme a condição.',
        kind: 'lesson',
        xpReward: 20,
        exercises: [
          mc(
            'n2_q1',
            'Quando o bloco dentro do if roda?',
            [
              'Sempre, mesmo se a condição for falsa',
              'Só quando a condição for verdadeira',
              'Nunca, if só comenta o código',
            ],
            'Só quando a condição for verdadeira',
            'if pergunta: se for verdade, entra no bloco indentado.',
            'Se a condição for falsa, o Python pula o bloco do if.',
          ),
          fill(
            'n2_q2',
            'Complete a condição para maior de idade em Python (18 ou mais):\n\nif idade ?? 18:',
            ['if idade >= 18:', 'idade >= 18'],
            '>= significa maior ou igual.',
            'Use if idade >= 18:',
            'Complete a condição para maior de idade. if idade o quê 18?',
          ),
          order(
            'n2_q3',
            'Ordene um if/else que imprime ok se nota for pelo menos 7.',
            ['if nota >= 7:', '    print("ok")', 'else:', '    print("estudo")'],
            'if, bloco verdadeiro, else, bloco contrário.',
            'O else vem depois do if, e cada bloco precisa de indentação.',
          ),
          mc(
            'n2_q4',
            'O bloco do else executa quando...',
            ['A condição do if é verdadeira', 'A condição do if é falsa', 'O programa termina'],
            'A condição do if é falsa',
            'else é o plano B: só entra se o if não entrou.',
            'Se o if for verdadeiro, o else é ignorado.',
          ),
        ],
      },
      {
        id: 'n2_operadores',
        title: 'Operadores lógicos',
        subtitle: 'Combine perguntas com and, or e not.',
        kind: 'lesson',
        xpReward: 20,
        exercises: [
          mc(
            'n2_q5',
            'True and False vale...',
            ['True', 'False', 'None'],
            'False',
            'and só é verdadeiro se os dois lados forem verdadeiros.',
            'Se um lado é False, o and inteiro é False.',
          ),
          mc(
            'n2_q6',
            'True or False vale...',
            ['True', 'False', '0'],
            'True',
            'or é verdadeiro se pelo menos um lado for verdadeiro.',
            'Basta uma verdade para o or ser True.',
          ),
          mc(
            'n2_q7',
            'not True vale...',
            ['True', 'False', 'True True'],
            'False',
            'not inverte: verdadeiro vira falso.',
            'not vira a lógica do avesso.',
          ),
          fill(
            'n2_q8',
            'Uma pessoa entra se tiver convite e não estiver atrasada. Qual condição?\n\nif convite and ?? atrasada:',
            ['if convite and not atrasada:', 'convite and not atrasada'],
            'and junta as duas exigências; not nega o atraso.',
            'Use convite and not atrasada.',
            'Uma pessoa entra se tiver convite e não estiver atrasada. Qual condição?',
          ),
        ],
      },
      {
        id: 'n2_desafio',
        title: 'Desafio do Nível 2',
        subtitle: 'Acerte o teste para abrir o Nível 3.',
        kind: 'challenge',
        xpReward: 40,
        exercises: [
          mc(
            'n2_c1',
            'idade = 16\nif idade >= 18:\n    print("sim")\nelse:\n    print("nao")\n\nO que aparece?',
            ['sim', 'nao', '16'],
            'nao',
            '16 < 18, então o else roda.',
            'A condição é falsa, então cai no else.',
            'idade igual a 16. Se idade maior ou igual a 18, print sim, senão print não. O que aparece?',
          ),
          fill(
            'n2_c2',
            'Complete: se chuva ou vento, fica em casa.\n\nif chuva ?? vento:',
            ['if chuva or vento:', 'chuva or vento'],
            'or cobre qualquer um dos dois casos.',
            'Use or entre chuva e vento.',
            'Complete: se chuva ou vento, fica em casa. if chuva o quê vento?',
          ),
          mc(
            'n2_c3',
            'Qual expressão é verdadeira só se os dois forem verdadeiros?',
            ['a or b', 'a and b', 'not a'],
            'a and b',
            'and exige os dois.',
            'or aceita um; not inverte um só.',
          ),
          order(
            'n2_c4',
            'Ordene: avisar se a senha for secreta.',
            ['if senha == "secreta":', '    print("entrada")', 'else:', '    print("bloqueado")'],
            'Compare, depois trate o sim e o não.',
            'A comparação do if vem primeiro.',
          ),
        ],
      },
    ],
  },
  {
    id: 'nivel_3',
    order: 3,
    band: 'Intermediário',
    title: 'Nível 3 · Intermediário',
    description: 'Repetir com for e while, e organizar dados em listas.',
    units: [
      {
        id: 'n3_lacos',
        title: 'for e while',
        subtitle: 'Repita um bloco sem copiar o código várias vezes.',
        kind: 'lesson',
        xpReward: 25,
        exercises: [
          mc(
            'n3_q1',
            'Quantas vezes este laço imprime oi?\n\nfor i in range(3):\n    print("oi")',
            ['2', '3', '4'],
            '3',
            'range(3) gera 0, 1 e 2: três voltas.',
            'range(n) começa em 0 e para antes de n.',
            'Quantas vezes este laço imprime oi? for i in range 3, print oi.',
          ),
          mc(
            'n3_q2',
            'Qual é a diferença principal entre for e while?',
            [
              'for só funciona com texto; while só com números',
              'for percorre uma sequência; while repete enquanto a condição for verdadeira',
              'while é mais rápido e por isso substitui o for',
            ],
            'for percorre uma sequência; while repete enquanto a condição for verdadeira',
            'Use for quando você já tem o conjunto; while quando a parada depende de uma condição.',
            'Os dois repetem, mas o critério de parada é diferente.',
          ),
          fill(
            'n3_q3',
            'Complete o while que conta até sair (enquanto n for menor que 3):\n\nwhile n ?? 3:',
            ['while n < 3:', 'n < 3'],
            'Enquanto n for menor que 3, o bloco continua.',
            'Use while n < 3:',
            'Complete o while que conta até sair, enquanto n for menor que 3.',
          ),
          order(
            'n3_q4',
            'Ordene um for que imprime cada fruta da lista.',
            ['frutas = ["uva", "kiwi"]', 'for fruta in frutas:', '    print(fruta)'],
            'Crie a lista, percorra, use o item.',
            'O for precisa existir a lista antes.',
          ),
        ],
      },
      {
        id: 'n3_listas',
        title: 'Listas',
        subtitle: 'Uma fila de valores com índices começando em 0.',
        kind: 'lesson',
        xpReward: 25,
        exercises: [
          mc(
            'n3_q5',
            'cores = ["azul", "verde", "rosa"]\nQual é cores[0]?',
            ['verde', 'azul', 'rosa'],
            'azul',
            'O primeiro item tem índice 0.',
            'Em Python a contagem da lista começa no zero.',
            'cores igual a azul, verde, rosa. Qual é cores na posição zero?',
          ),
          mc(
            'n3_q6',
            'O que lista.append(x) faz?',
            ['Remove o primeiro item', 'Coloca x no final da lista', 'Ordena a lista'],
            'Coloca x no final da lista',
            'append acrescenta ao fim.',
            'append não apaga: só adiciona no final.',
          ),
          fill(
            'n3_q7',
            'Complete para criar uma lista com 1, 2 e 3:\n\nnumeros = ?',
            ['[1, 2, 3]', '[1,2,3]', 'numeros = [1, 2, 3]', 'numeros=[1,2,3]'],
            'Colchetes e vírgulas montam a lista.',
            'Use colchetes: [1, 2, 3]',
            'Complete para criar uma lista com 1, 2 e 3. numeros igual a quê?',
          ),
          mc(
            'n3_q8',
            'len([10, 20]) devolve...',
            ['10', '2', '20'],
            '2',
            'len conta quantos itens existem, não soma os valores.',
            'Há dois elementos, então len é 2.',
          ),
        ],
      },
      {
        id: 'n3_desafio',
        title: 'Desafio do Nível 3',
        subtitle: 'Passe para seguir às funções no Nível 4.',
        kind: 'challenge',
        xpReward: 50,
        exercises: [
          fill(
            'n3_c1',
            'O que range(2) gera? Responda como dois números separados por vírgula.',
            ['0, 1', '0,1', '0, 1,'],
            'Dois valores: 0 e 1.',
            'range(2) é 0 e 1, não inclui o 2.',
            'O que range 2 gera? Responda como dois números separados por vírgula.',
            'text',
          ),
          mc(
            'n3_c2',
            'letras = ["a", "b", "c"]\nQual índice de "c"?',
            ['0', '1', '2'],
            '2',
            'a=0, b=1, c=2.',
            'O terceiro item está no índice 2.',
          ),
          order(
            'n3_c3',
            'Ordene um while que imprime n e soma 1 até n chegar a 2.',
            ['n = 0', 'while n < 2:', '    print(n)', '    n = n + 1'],
            'Comece n, teste, use, depois atualize n para não ficar eterno.',
            'Sem n = n + 1 o while nunca termina.',
          ),
          mc(
            'n3_c4',
            'Por que listas são úteis em laços?',
            [
              'Porque o Python proíbe print em listas',
              'Porque você percorre vários valores com o mesmo código',
              'Porque listas substituem if',
            ],
            'Porque você percorre vários valores com o mesmo código',
            'Um for na lista trata cada item sem copiar linhas.',
            'Lista guarda vários valores; o laço visita cada um.',
          ),
        ],
      },
    ],
  },
  {
    id: 'nivel_4',
    order: 4,
    band: 'Intermediário+',
    title: 'Nível 4 · Intermediário+',
    description: 'Funções para reutilizar código e try/except para erros.',
    units: [
      {
        id: 'n4_funcoes',
        title: 'Funções',
        subtitle: 'Dê um nome a um bloco e chame quando precisar.',
        kind: 'lesson',
        xpReward: 25,
        exercises: [
          mc(
            'n4_q1',
            'Qual palavra-chave define uma função?',
            ['func', 'def', 'lambda somente'],
            'def',
            'def nome(parametros): começa a função.',
            'Em Python usamos def, não func.',
          ),
          fill(
            'n4_q2',
            'Complete a função que devolve o dobro:\n\ndef dobro(n):\n    ?? n * 2',
            ['return n * 2', 'return n*2'],
            'return envia o resultado para quem chamou.',
            'Use return n * 2 — print só mostra, não devolve.',
            'Complete a função que devolve o dobro. def dobro n, o quê n vezes 2?',
          ),
          mc(
            'n4_q3',
            'O que acontece ao chamar saudacao() se ela foi definida com def saudacao():?',
            ['O Python apaga a função', 'O bloco da função executa', 'Nada, funções nunca rodam'],
            'O bloco da função executa',
            'Definir guarda o bloco; chamar com () executa.',
            'Os parênteses na chamada disparam o corpo da função.',
          ),
          order(
            'n4_q4',
            'Ordene: definir soma e usar o resultado.',
            ['def soma(a, b):', '    return a + b', 'total = soma(2, 3)', 'print(total)'],
            'Defina, devolva, chame, mostre.',
            'A função precisa existir antes da chamada.',
          ),
        ],
      },
      {
        id: 'n4_erros',
        title: 'Tratamento de erros',
        subtitle: 'Quando algo dá errado, capture o erro em vez de quebrar tudo.',
        kind: 'lesson',
        xpReward: 25,
        exercises: [
          mc(
            'n4_q5',
            'Qual par de palavras protege um trecho que pode falhar?',
            ['start/end', 'try/except', 'open/close'],
            'try/except',
            'try tenta; except trata o erro.',
            'O padrão em Python é try/except.',
          ),
          mc(
            'n4_q6',
            'int("oi") costuma gerar...',
            ['ValueError', 'uma string nova', 'True'],
            'ValueError',
            'Não dá para transformar oi em inteiro: ValueError.',
            'O texto não representa um número válido.',
          ),
          fill(
            'n4_q7',
            'Complete:\n\ntry:\n    n = int(texto)\n?? ValueError:\n    n = 0',
            ['except ValueError:', 'except ValueError'],
            'except ValueError captura só essa falha.',
            'A linha é except ValueError:',
            'Complete o except ValueError depois do try que faz n igual a int texto.',
          ),
          mc(
            'n4_q8',
            'Por que tratar erros ajuda quem está começando?',
            [
              'Porque esconde todos os bugs para sempre',
              'Porque o programa pode explicar o problema em vez de fechar',
              'Porque except deixa o código mais rápido',
            ],
            'Porque o programa pode explicar o problema em vez de fechar',
            'Uma mensagem clara é melhor do que uma tela vermelha.',
            'O objetivo é responder ao erro, não acelerar o programa.',
          ),
        ],
      },
      {
        id: 'n4_desafio',
        title: 'Desafio do Nível 4',
        subtitle: 'Passe para chegar ao Nível Avançado.',
        kind: 'challenge',
        xpReward: 50,
        exercises: [
          mc(
            'n4_c1',
            'def eco(msg):\n    return msg\nprint(eco("ping"))\n\nO que aparece?',
            ['msg', 'ping', 'eco'],
            'ping',
            'A função devolve o argumento, e print mostra ping.',
            'eco só devolve o que recebeu.',
            'def eco msg, return msg, print eco ping. O que aparece?',
          ),
          fill(
            'n4_c2',
            'Escreva a primeira linha de uma função media com parametros a e b.',
            ['def media(a, b):', 'def media(a,b):'],
            'def, nome, parâmetros e dois pontos.',
            'Use def media(a, b):',
            'Escreva a primeira linha de uma função média com parâmetros a e b.',
          ),
          order(
            'n4_c3',
            'Ordene um try/except que transforma texto em número ou usa 0.',
            ['try:', '    n = int(texto)', 'except ValueError:', '    n = 0'],
            'Tente converter; se falhar, escolha um valor seguro.',
            'except vem imediatamente depois do try.',
          ),
          mc(
            'n4_c4',
            'return e print são a mesma coisa?',
            [
              'Sim, os dois só mostram na tela',
              'Não: return devolve um valor; print só exibe',
              'Não: print devolve e return só exibe',
            ],
            'Não: return devolve um valor; print só exibe',
            'Você pode imprimir um return, mas print sozinho não vira resultado da função.',
            'São ferramentas diferentes.',
          ),
        ],
      },
    ],
  },
  {
    id: 'nivel_avancado',
    order: 5,
    band: 'Avançado',
    title: 'Nível Avançado',
    description: 'Orientação a objetos e ideias de automação do dia a dia.',
    units: [
      {
        id: 'nav_poo',
        title: 'Orientação a objetos',
        subtitle: 'Classes agrupam dados e comportamentos.',
        kind: 'lesson',
        xpReward: 30,
        exercises: [
          mc(
            'nav_q1',
            'Em POO, o que é uma classe?',
            [
              'Um valor único, como o número 3',
              'Um molde para criar objetos com dados e funções',
              'Um erro especial do Python',
            ],
            'Um molde para criar objetos com dados e funções',
            'A classe descreve o tipo; o objeto é um exemplar.',
            'Classe não é o objeto em si: é o projeto dele.',
          ),
          mc(
            'nav_q2',
            'O primeiro parâmetro de um método de instância costuma ser...',
            ['this', 'self', 'cls obrigatoriamente'],
            'self',
            'self é o próprio objeto. Você não passa ele na chamada: o Python preenche.',
            'Em Python o convênio é chamar de self.',
          ),
          fill(
            'nav_q3',
            'Complete o construtor:\n\nclass Pessoa:\n    def ??(self, nome):\n        self.nome = nome',
            ['__init__', 'def __init__'],
            '__init__ roda quando você faz Pessoa("Ana").',
            'O construtor se chama __init__.',
            'Complete o construtor da classe Pessoa. def o quê self, nome.',
          ),
          order(
            'nav_q4',
            'Ordene: definir a classe, criar o objeto e usar o atributo.',
            [
              'class Gato:',
              '    def __init__(self, nome):',
              '        self.nome = nome',
              'mimi = Gato("Mimi")',
              'print(mimi.nome)',
            ],
            'Molde, construtor, atributo, instância, uso.',
            'Crie a classe antes do objeto.',
          ),
        ],
      },
      {
        id: 'nav_automacao',
        title: 'Automação',
        subtitle: 'Faça o computador repetir tarefas chatas com segurança.',
        kind: 'lesson',
        xpReward: 30,
        exercises: [
          mc(
            'nav_q5',
            'O que é automação neste curso?',
            [
              'Pedir para outra pessoa clicar no seu lugar',
              'Escrever um programa que executa tarefas repetitivas por você',
              'Desligar o computador toda noite',
            ],
            'Escrever um programa que executa tarefas repetitivas por você',
            'Renomear arquivos, gerar relatórios, lembrar um alarme: isso é automação.',
            'Automação é código que trabalha no lugar dos cliques repetidos.',
          ),
          mc(
            'nav_q6',
            'Qual módulo da biblioteca padrão ajuda a trabalhar com caminhos de arquivos?',
            ['random', 'pathlib', 'tkinter'],
            'pathlib',
            'Path("pasta") / "arquivo.txt" monta caminhos de forma legível.',
            'pathlib é o caminho moderno; os.path também existe, mas pathlib é o foco aqui.',
          ),
          fill(
            'nav_q7',
            'Complete o laço que visita cada Path em uma pasta:\n\nfor item in pasta.??():',
            ['iterdir', 'iterdir()'],
            'iterdir gera os itens da pasta, um por um.',
            'O método é iterdir().',
            'Complete o laço que visita cada Path em uma pasta. for item in pasta, que método?',
          ),
          mc(
            'nav_q8',
            'Qual prática é mais segura ao automatizar arquivos?',
            [
              'Apagar a pasta home inteira para testar',
              'Começar com uma pasta de teste e imprimir o que faria antes de mudar tudo',
              'Rodar o script duas vezes ao mesmo tempo na mesma pasta',
            ],
            'Começar com uma pasta de teste e imprimir o que faria antes de mudar tudo',
            'Ensaie o efeito (dry-run) antes de escrever de verdade.',
            'Automação potente precisa de cautela: teste pequeno primeiro.',
          ),
        ],
      },
      {
        id: 'nav_desafio',
        title: 'Desafio avançado',
        subtitle: 'Feche a trilha demonstrando POO e automação.',
        kind: 'challenge',
        xpReward: 60,
        exercises: [
          mc(
            'nav_c1',
            'class Conta:\n    def __init__(self, saldo):\n        self.saldo = saldo\n\nc = Conta(10)\nprint(c.saldo)\n\nO que aparece?',
            ['saldo', '10', 'Conta'],
            '10',
            'O objeto c guarda saldo 10 no atributo.',
            'c.saldo é o valor guardado no __init__.',
            'Classe Conta com saldo 10. print c.saldo. O que aparece?',
          ),
          fill(
            'nav_c2',
            'Escreva a primeira linha de uma classe chamada Relatorio.',
            ['class Relatorio:', 'class Relatorio():'],
            'class Nome:',
            'Use class Relatorio:',
            'Escreva a primeira linha de uma classe chamada Relatório.',
          ),
          mc(
            'nav_c3',
            'Você quer listar só arquivos .txt de uma pasta. Qual ideia é correta?',
            [
              'Ignorar o nome do arquivo e apagar tudo',
              'Percorrer pasta.iterdir() e olhar se o sufixo é .txt',
              'Usar print uma vez e esperar o sistema adivinhar',
            ],
            'Percorrer pasta.iterdir() e olhar se o sufixo é .txt',
            'Laço + filtro no sufixo é automação clássica de arquivos.',
            'Você precisa visitar cada item e testar o nome ou o suffix.',
          ),
          order(
            'nav_c4',
            'Ordene um esboço seguro: pasta de teste, listar, depois agir.',
            ['pasta = Path("teste")', 'for item in pasta.iterdir():', '    print(item.name)'],
            'Aponte para o teste, percorra, observe. Só então você mudaria arquivos.',
            'Sem apontar a pasta, o laço não tem o que percorrer.',
          ),
        ],
      },
    ],
  },
]
