import { fill, mc, order, theory, type Level } from '../lesson-core'

export const nivel3: Level = {
  id: 'nivel_3',
  order: 3,
  band: 'Intermediário',
  title: 'Nível 3 · Intermediário',
  description: 'Laços de repetição (for/while) e listas.',
  units: [
    {
      id: 'n3_for',
      title: 'for e range',
      subtitle: 'Percorra uma sequência conhecida sem copiar o código.',
      kind: 'lesson',
      xpReward: 25,
      theory: theory({
        concept:
          'O for serve quando você já sabe o conjunto a percorrer: uma lista de frutas, as letras de um texto, ou uma contagem. A variável do for recebe um item de cada vez, e o bloco indentado roda para cada item. range(n) gera os inteiros 0, 1, 2 até n-1 — o n fica de fora.',
        syntax:
          'Escreva for, o nome do item, a palavra in, a sequência e dois pontos. O bloco indentado usa esse nome. range(3) → 0, 1, 2. range(1, 4) → 1, 2, 3. range(0, 6, 2) conta de 2 em 2. O nome (i, fruta, item) é escolha sua; o importante é usá-lo dentro do bloco.',
        syntaxCode:
          'for item in sequencia:\n    use(item)\n\nfor i in range(3):\n    print(i)          # 0, depois 1, depois 2\n\nfor fruta in ["uva", "kiwi"]:\n    print(fruta)',
        examples: [
          {
            caption: 'range(3) dá três voltas: 0, 1 e 2',
            code: 'for i in range(3):\n    print("oi")',
            output: 'oi\noi\noi',
          },
          {
            caption: 'O for visita cada item da lista',
            code: 'for fruta in ["uva", "kiwi"]:\n    print(fruta)',
            output: 'uva\nkiwi',
          },
        ],
        speak:
          'for percorre uma sequência. A variável recebe um item por volta. range n gera de zero até n menos um, então range 3 tem três voltas.',
      }),
      exercises: [
        mc(
          'n3_q1',
          'Quantas vezes este laço imprime oi?\n\nfor i in range(3):\n    print("oi")',
          ['2', '3', '4'],
          '3',
          'range(3) gera 0, 1 e 2: três números, três voltas, três prints. O 3 não entra na sequência.',
          'range(n) começa em 0 e para antes de n. range(3) tem os valores 0, 1 e 2 — três voltas, não duas nem quatro.',
          'Quantas vezes este laço imprime oi? for i in range 3, print oi.',
        ),
        fill(
          'n3_for_q2',
          'O que range(2) gera? Responda como dois números separados por vírgula.',
          ['0, 1', '0,1', '0, 1,'],
          'range(2) produz 0 e 1. O número 2 é o limite exclusivo: ele não faz parte da sequência.',
          'A sequência é 0 e 1. Escreva 0, 1. range(2) não inclui o 2 e não começa no 1.',
          'O que range 2 gera? Responda como dois números separados por vírgula.',
          'text',
        ),
        mc(
          'n3_for_q3',
          'Qual linha percorre cada cor da lista cores?',
          ['for cores in cor:', 'for cor in cores:', 'while cor == cores:'],
          'for cor in cores:',
          'lemos “para cada cor em cores”. O nome depois de for é o item da vez; o nome depois de in é a lista. while não percorre lista sozinho.',
          'A forma idiomática é for cor in cores:. Inverter (for cores in cor) trata o item como se fosse a lista. while precisaria de índice e condição à parte.',
        ),
        order(
          'n3_q4',
          'Ordene um for que imprime cada fruta da lista.',
          ['frutas = ["uva", "kiwi"]', 'for fruta in frutas:', '    print(fruta)'],
          'Crie a lista, percorra com for, use o item no print indentado. Sem a lista existir, o for não tem o que visitar.',
          'Primeiro frutas = ["uva", "kiwi"], depois for fruta in frutas: e por fim o print(fruta) indentado.',
        ),
      ],
    },
    {
      id: 'n3_lacos',
      title: 'while',
      subtitle: 'Repita enquanto a condição for verdadeira — e lembre de atualizar.',
      kind: 'lesson',
      xpReward: 25,
      theory: theory({
        concept:
          'while pergunta toda volta: “ainda é verdade?”. Enquanto for, o bloco roda de novo. A diferença prática para o for: você usa while quando a parada depende de uma condição que muda (um contador, uma resposta da pessoa, um arquivo que acabou), não de uma lista pronta. Se a condição nunca virar False, o laço não termina.',
        syntax:
          'while condicao: e bloco indentado. Quase sempre existem três peças: preparar uma variável antes, testar no while, atualizar a variável no fim do bloco. Esquecer a atualização é o clássico loop infinito. break sai na hora; continue pula para a próxima checagem. Neste curso, foque em condição + atualização.',
        syntaxCode:
          'n = 0\nwhile n < 3:\n    print(n)\n    n = n + 1     # sem esta linha, n fica 0 para sempre\n\n# equivalente aproximado: for i in range(3)',
        examples: [
          {
            caption: 'Contar 0 e 1 e parar antes de 2',
            code: 'n = 0\nwhile n < 2:\n    print(n)\n    n = n + 1',
            output: '0\n1',
          },
          {
            caption: 'A condição é testada antes de cada volta',
            code: 'n = 5\nwhile n < 3:\n    print("nao entra")\nprint("fim")',
            output: 'fim',
          },
        ],
        speak:
          'while repete enquanto a condição for verdadeira. Prepare a variável, teste, use, e atualize no fim do bloco para o laço poder terminar.',
      }),
      exercises: [
        mc(
          'n3_q2',
          'Qual é a diferença principal entre for e while?',
          [
            'for só funciona com texto; while só com números',
            'for percorre uma sequência; while repete enquanto a condição for verdadeira',
            'while é mais rápido e por isso substitui o for',
          ],
          'for percorre uma sequência; while repete enquanto a condição for verdadeira',
          'for já sabe os itens (lista, range). while só sabe a pergunta de parada. Os dois repetem; o critério é que muda. Nenhum é “mais Python” em velocidade para este curso.',
          'Não é uma divisão texto versus número, nem uma questão de velocidade. for visita uma sequência; while continua enquanto a condição for True.',
        ),
        fill(
          'n3_q3',
          'Complete o while que conta até sair (enquanto n for menor que 3):\n\nwhile n ?? 3:',
          ['while n < 3:', 'n < 3'],
          'while n < 3: segue enquanto n for 0, 1 ou 2. Quando n vira 3, a condição fica False e o laço para.',
          'A condição é n < 3, portanto a linha é while n < 3:. n <= 3 daria uma volta a mais; n > 3 quase nunca entraria se n começa em 0.',
          'Complete o while que conta até sair, enquanto n for menor que 3.',
        ),
        order(
          'n3_c3',
          'Ordene um while que imprime n e soma 1 até n chegar a 2.',
          ['n = 0', 'while n < 2:', '    print(n)', '    n = n + 1'],
          'Comece n em 0, teste n < 2, use o valor, depois some 1. A atualização evita o laço eterno e faz n passar por 0 e 1.',
          'A ordem é n = 0, while n < 2:, print(n) indentado e n = n + 1 indentado. Sem somar, n continua 0 e o while nunca termina.',
        ),
        mc(
          'n3_wh_q4',
          'O que costuma acontecer se você esquecer n = n + 1 dentro de while n < 3?',
          [
            'O Python corrige sozinho e para em 3',
            'O laço pode repetir para sempre porque n não muda',
            'O while vira um for automaticamente',
          ],
          'O laço pode repetir para sempre porque n não muda',
          'A condição olha n. Se n permanece 0, 0 < 3 continua True em todas as voltas. Por isso a atualização é parte da sintaxe prática do while.',
          'Não existe conversão automática para for nem correção mágica. Sem mudar n, a condição permanece verdadeira e o laço não acaba.',
        ),
      ],
    },
    {
      id: 'n3_listas',
      title: 'Listas',
      subtitle: 'Uma fila de valores com índices começando em 0.',
      kind: 'lesson',
      xpReward: 25,
      theory: theory({
        concept:
          'Lista é uma coleção ordenada e mutável: vários valores numa única variável, na ordem em que você colocou. Cada posição tem um índice. O primeiro item é 0, o segundo é 1, e assim por diante. Listas combinam com for: um único bloco trata todos os itens.',
        syntax:
          'Crie com colchetes e vírgulas: numeros = [1, 2, 3]. Acesse com lista[indice]. len(lista) devolve a quantidade de itens. lista.append(x) coloca x no final. lista[0] = "novo" troca o primeiro. Índices negativos contam do fim: lista[-1] é o último. Misturar tipos é permitido, mas no começo prefira listas homogêneas.',
        syntaxCode:
          'cores = ["azul", "verde", "rosa"]\nprint(cores[0])      # azul\nprint(len(cores))    # 3\ncores.append("roxo")\n\nfor cor in cores:\n    print(cor)',
        examples: [
          {
            caption: 'Índice zero é o primeiro item',
            code: 'cores = ["azul", "verde", "rosa"]\nprint(cores[0])\nprint(cores[2])',
            output: 'azul\nrosa',
          },
          {
            caption: 'append acrescenta no fim; len conta itens',
            code: 'fila = [10, 20]\nfila.append(30)\nprint(fila)\nprint(len(fila))',
            output: '[10, 20, 30]\n3',
          },
        ],
        speak:
          'Lista usa colchetes. O primeiro índice é zero. len conta itens, append coloca no final, e o for percorre cada valor com o mesmo código.',
      }),
      exercises: [
        mc(
          'n3_q5',
          'cores = ["azul", "verde", "rosa"]\nQual é cores[0]?',
          ['verde', 'azul', 'rosa'],
          'azul',
          'O índice 0 é a primeira posição. azul está no começo, verde em 1, rosa em 2. Em Python a contagem da lista começa no zero.',
          'cores[0] é azul, o primeiro item. verde seria cores[1] e rosa cores[2]. A contagem não começa em 1.',
          'cores igual a azul, verde, rosa. Qual é cores na posição zero?',
        ),
        mc(
          'n3_q6',
          'O que lista.append(x) faz?',
          ['Remove o primeiro item', 'Coloca x no final da lista', 'Ordena a lista'],
          'Coloca x no final da lista',
          'append só acrescenta. A lista fica um item maior, e x vira o novo último. Quem remove é pop ou remove; quem ordena é sort.',
          'append não apaga nem ordena: ele adiciona x no fim. Depois de append, len aumenta em 1.',
        ),
        fill(
          'n3_q7',
          'Complete para criar uma lista com 1, 2 e 3:\n\nnumeros = ?',
          ['[1, 2, 3]', '[1,2,3]', 'numeros = [1, 2, 3]', 'numeros=[1,2,3]'],
          'Colchetes abrem e fecham a lista; vírgulas separam os itens. A atribuição numeros = [1, 2, 3] guarda essa fila no nome numeros.',
          'Use colchetes: [1, 2, 3]. Parênteses criariam uma tupla; chaves, um conjunto ou dicionário. Pode responder só a lista ou a linha inteira.',
          'Complete para criar uma lista com 1, 2 e 3. numeros igual a quê?',
        ),
        mc(
          'n3_q8',
          'len([10, 20]) devolve...',
          ['10', '2', '20'],
          '2',
          'len conta quantos itens existem, não soma 10+20 nem devolve o primeiro valor. Há dois elementos, portanto o comprimento é 2.',
          'A resposta é 2 porque a lista tem dois itens. 10 e 20 são conteúdos, não o tamanho. len não soma os números.',
        ),
      ],
    },
    {
      id: 'n3_desafio',
      title: 'Desafio do Nível 3',
      subtitle: 'Passe para seguir às funções no Nível 4.',
      kind: 'challenge',
      xpReward: 50,
      theory: theory({
        concept:
          'Aqui você mistura for, while e listas. Pergunte: já tenho a sequência? Use for. A parada depende de uma condição que eu mesmo atualizo? Use while. Preciso guardar vários valores e visitá-los? Use lista + índice 0 + len + append.',
        syntax:
          'for item in lista: bloco. for i in range(n): bloco. n = 0; while n < limite: bloco; n = n + 1. lista[0] é o primeiro; len(lista) é a quantidade.',
        syntaxCode:
          'letras = ["a", "b", "c"]\nprint(letras[2])    # c\n\nfor letra in letras:\n    print(letra)\n\nn = 0\nwhile n < 2:\n    print(n)\n    n = n + 1',
        examples: [
          {
            caption: 'Índice do terceiro item',
            code: 'letras = ["a", "b", "c"]\nprint(letras[2])',
            output: 'c',
          },
          {
            caption: 'for na lista evita copiar print três vezes',
            code: 'for letra in ["a", "b"]:\n    print(letra)',
            output: 'a\nb',
          },
        ],
        speak:
          'Desafio do nível 3. for percorre sequência, while depende da condição, lista começa no índice zero. Lembre de atualizar o while.',
      }),
      exercises: [
        fill(
          'n3_c1',
          'O que range(2) gera? Responda como dois números separados por vírgula.',
          ['0, 1', '0,1', '0, 1,'],
          'Dois valores: 0 e 1. O limite 2 fica de fora, como em qualquer range(n).',
          'Escreva 0, 1. range(2) não inclui o 2. Também não começa em 1.',
          'O que range 2 gera? Responda como dois números separados por vírgula.',
          'text',
        ),
        mc(
          'n3_c2',
          'letras = ["a", "b", "c"]\nQual índice de "c"?',
          ['0', '1', '2'],
          '2',
          'a está em 0, b em 1, c em 2. O terceiro item de uma lista tem índice 2 porque a contagem começa no zero.',
          'O índice de c é 2. 0 seria a, 1 seria b. Não conte começando em 1.',
        ),
        order(
          'n3_des_q3',
          'Ordene um while que imprime n e soma 1 até n chegar a 2.',
          ['n = 0', 'while n < 2:', '    print(n)', '    n = n + 1'],
          'Prepare n, teste, imprima, atualize. Assim o laço mostra 0 e 1 e para quando n vira 2.',
          'Sem n = 0 o while não tem valor inicial. Sem n = n + 1 ele não termina. A ordem é inicializar, while, print, incrementar.',
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
          'Um for na lista trata cada item sem copiar linhas. A lista guarda os valores; o laço visita um por um. if continua sendo necessário para decisões, não é substituído.',
          'Listas não proíbem print nem substituem if. A utilidade é guardar vários valores e percorrê-los com o mesmo bloco, em vez de repetir código.',
        ),
      ],
    },
  ],
}
