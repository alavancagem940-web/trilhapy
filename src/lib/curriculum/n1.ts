import { fill, mc, order, theory, type Level } from '../lesson-core'

export const nivel1: Level = {
  id: 'nivel_1',
  order: 1,
  band: 'Básico',
  title: 'Nível 1 · Básico',
  description: 'Lógica do dia a dia, variáveis, tipos de dados e print.',
  units: [
    {
      id: 'n1_logica',
      title: 'Lógica básica',
      subtitle: 'O computador só faz o que está escrito, na ordem dos passos.',
      kind: 'lesson',
      xpReward: 20,
      theory: theory({
        concept:
          'Programar começa com lógica: uma lista de passos claros. O Python não adivinha o que você quis dizer. Ele lê de cima para baixo e executa cada linha. Uma regra típica é “se isto for verdade, faça aquilo”. Se a condição não for verdade, aquele passo é ignorado.',
        syntax:
          'Não existe um comando chamado “lógica”. Você escreve instruções, uma por linha. Uma decisão usa if, dois pontos e um bloco indentado (recuado com espaços). A indentação faz parte da sintaxe: o que está mais para dentro pertence ao if.',
        syntaxCode:
          'passo_um()\npasso_dois()\n\nif condicao:\n    acao_quando_for_verdade()\n# se condicao for False, o Python pula a acao',
        examples: [
          {
            caption: 'Uma regra do dia a dia virando código',
            code: 'esta_chovendo = True\nif esta_chovendo:\n    print("leve o guarda-chuva")',
            output: 'leve o guarda-chuva',
          },
          {
            caption: 'A ordem das linhas muda o resultado',
            code: 'print("primeiro o pão")\nprint("depois o recheio")',
            output: 'primeiro o pão\ndepois o recheio',
          },
        ],
        speak:
          'Lógica é a ordem dos passos. O Python lê de cima para baixo e só entra no se quando a condição for verdadeira. Indentação marca o bloco da decisão.',
      }),
      exercises: [
        mc(
          'n1_q1',
          'Uma regra diz: se está chovendo, leve o guarda-chuva. Está chovendo. O que você faz?',
          ['Fica em casa de qualquer jeito', 'Leva o guarda-chuva', 'Espera o sol sem decidir nada'],
          'Leva o guarda-chuva',
          'A regra tem uma condição e uma ação. A condição “está chovendo” é verdadeira, então a ação precisa acontecer: levar o guarda-chuva. É assim que um if funciona.',
          'A condição da regra é verdadeira (está chovendo). Em lógica, quando o “se” vale, a ação ligada a ele acontece. Por isso o passo correto é levar o guarda-chuva, e não ignorar a regra.',
        ),
        mc(
          'n1_log_q2',
          'O Python executa as linhas de um arquivo comum em qual ordem?',
          [
            'De baixo para cima',
            'De cima para baixo, uma depois da outra',
            'Em ordem aleatória a cada execução',
          ],
          'De cima para baixo, uma depois da outra',
          'Um script comum é uma receita: a primeira linha roda, depois a segunda, e assim por diante. Por isso criar a variável antes de usar é obrigatório.',
          'O interpretador não sorteia linhas. Ele começa no topo do arquivo e desce. Se você usa um nome antes de criá-lo, ainda não existe.',
        ),
        fill(
          'n1_log_q3',
          'Complete a decisão: se a lâmpada estiver quebrada, avise.\n\nif lampada_quebrada??',
          ['if lampada_quebrada:', 'lampada_quebrada:'],
          'Toda decisão começa com if, a condição e dois pontos. Os dois pontos abrem o bloco indentado da ação.',
          'A forma correta é if lampada_quebrada: — a palavra if, a condição e os dois pontos. Sem os dois pontos o Python não sabe onde começa o bloco.',
          'Complete a decisão: se a lâmpada estiver quebrada, avise. if lampada_quebrada e depois o quê?',
        ),
        order(
          'n1_log_q4',
          'Ordene os passos de uma receita lógica: preparar, decidir, agir.',
          ['fome = True', 'if fome:', '    print("fazer lanche")'],
          'Primeiro existe o fato (fome = True). Depois a pergunta (if). Por último a ação indentada. Sem o fato, a decisão não tem o que testar.',
          'A ordem correta é guardar o fato, testar com if e só então executar a ação recuada. Se o print vier antes do if, ele não depende da condição.',
        ),
      ],
    },
    {
      id: 'n1_logica_variaveis',
      title: 'Variáveis',
      subtitle: 'Um nome que guarda um valor, como uma etiqueta numa caixa.',
      kind: 'lesson',
      xpReward: 20,
      theory: theory({
        concept:
          'Uma variável é um nome que aponta para um valor na memória. Pense numa caixa com etiqueta: o nome é a etiqueta, o conteúdo é o valor. Você escolhe o nome; o Python guarda o que está dentro. Mais tarde, usar o nome é o mesmo que usar o valor guardado.',
        syntax:
          'A atribuição usa um único sinal de igual. O nome fica sempre à esquerda e o valor à direita. O Python lê isso como “guarde este valor neste nome”. Nomes podem ter letras, números e sublinhado, mas não podem começar com número nem ter espaço. Maiúsculas e minúsculas são diferentes: Idade e idade são caixas distintas.',
        syntaxCode:
          'nome_da_variavel = valor\n\nidade = 20\nmensagem = "oi"\nativo = True\n# errado: 20 = idade\n# errado: minha idade = 20',
        examples: [
          {
            caption: 'Guardar um texto e usar depois',
            code: 'nome = "Ana"\nprint(nome)',
            output: 'Ana',
          },
          {
            caption: 'O valor novo substitui o antigo',
            code: 'pontos = 10\npontos = 12\nprint(pontos)',
            output: '12',
          },
        ],
        speak:
          'Variável é um nome que guarda um valor. Escreva o nome, igual, e o valor à direita. Se atribuir de novo, o conteúdo antigo é substituído.',
      }),
      exercises: [
        mc(
          'n1_q2',
          'O que é uma variável em Python?',
          [
            'Um botão da janela do programa',
            'Um nome que guarda um valor na memória',
            'Um erro que o Python inventa',
          ],
          'Um nome que guarda um valor na memória',
          'Isso. A linha nome = "Ana" cria a etiqueta nome apontando para o texto Ana. Depois, print(nome) mostra o conteúdo da caixa, não a palavra “variável”.',
          'Variável não é botão nem erro. É só um nome (a etiqueta) ligado a um valor (o conteúdo). Por isso dizemos que ela guarda um valor na memória.',
        ),
        fill(
          'n1_q3',
          'Complete para guardar o texto Ana na variável nome:\n\nnome = ?',
          ['"Ana"', "'Ana'", 'nome = "Ana"', "nome = 'Ana'"],
          'O texto Ana precisa de aspas para ser string. A linha completa fica nome = "Ana" (aspas simples também valem). Sem aspas, o Python procuraria uma variável chamada Ana.',
          'O valor à direita precisa ser o texto Ana entre aspas. Pode responder "Ana", Ana, ou a linha inteira nome = "Ana". Sem aspas o Python acha que Ana é outro nome de variável.',
          'Complete para guardar o texto Ana na variável nome. nome igual a quê?',
        ),
        order(
          'n1_q4',
          'Ordene o código para criar a variável e depois mostrar o valor.',
          ['nome = "Lia"', 'print(nome)'],
          'Primeiro a caixa precisa existir (nome = "Lia"). Só depois o print pode ler o conteúdo. Invertendo, o Python ainda não conhece nome e acusa NameError.',
          'Crie a variável antes de imprimir. print(nome) só funciona depois da atribuição, porque a etiqueta precisa existir na memória.',
        ),
        mc(
          'n1_var_q5',
          'Depois destas linhas, o que ficou guardado em x?\n\nx = 3\nx = 8',
          ['3', '8', '3 e 8 ao mesmo tempo'],
          '8',
          'Cada atribuição substitui o valor anterior. x = 3 coloca 3; x = 8 coloca 8 no mesmo nome. A caixa não acumula os dois números.',
          'Uma variável comum guarda um valor de cada vez. A última atribuição vence: x termina valendo 8, não 3.',
        ),
      ],
    },
    {
      id: 'n1_tipos',
      title: 'Tipos de dados',
      subtitle: 'Número, texto e verdadeiro/falso não se misturam à toa.',
      kind: 'lesson',
      xpReward: 20,
      theory: theory({
        concept:
          'Todo valor em Python tem um tipo: o “formato” da informação. Os quatro que você mais vai ver no começo são int (número inteiro), float (número com ponto decimal), str (texto) e bool (True ou False). O tipo decide o que dá para fazer: 10 + 2 soma; "10" + "2" cola textos.',
        syntax:
          'Números inteiros se escrevem sem aspas: 10, 0, -3. Decimais usam ponto, nunca vírgula: 2.5. Texto vai entre aspas simples ou duplas. Booleanos são as palavras True e False, com T e F maiúsculos, sem aspas. A função type(valor) devolve o tipo; int("10") tenta transformar texto em inteiro.',
        syntaxCode:
          'inteiro = 10          # int\ndecimal = 2.5        # float\ntexto = "10"         # str\nflag = True          # bool\n\nprint(type(inteiro))\nprint(int("10"))     # vira o número 10',
        examples: [
          {
            caption: 'O mesmo desenho 10 muda de tipo com aspas',
            code: 'print(type(10))\nprint(type("10"))',
            output: "<class 'int'>\n<class 'str'>",
          },
          {
            caption: 'True é booleano, não texto',
            code: 'aberto = True\nprint(type(aberto))\nprint(aberto)',
            output: "<class 'bool'>\nTrue",
          },
        ],
        speak:
          'Os tipos básicos são int, float, str e bool. Número sem aspas é int. Tudo entre aspas é texto. True e False são booleanos, com letra maiúscula e sem aspas.',
      }),
      exercises: [
        mc(
          'n1_q5',
          'Qual é o tipo do valor 10?',
          ['str (texto)', 'int (número inteiro)', 'bool (verdadeiro/falso)'],
          'int (número inteiro)',
          '10 está sem aspas e sem ponto decimal, então é int. Inteiro significa número completo, sem parte fracionária.',
          'Números escritos sem aspas são numéricos. Sem ponto decimal, o tipo é int. str exigiria aspas; bool seria True ou False.',
        ),
        mc(
          'n1_q6',
          'Qual é o tipo de "10"?',
          ['int', 'float', 'str'],
          'str',
          'As aspas transformam os caracteres 1 e 0 em texto. "10" não soma como número: "10" + "2" vira "102".',
          'Tudo que está entre aspas é str, mesmo que pareça número. Para ser int, escreveríamos 10 sem aspas.',
        ),
        mc(
          'n1_tip_q3',
          'True é um valor de qual tipo?',
          ['str', 'int', 'bool'],
          'bool',
          'True e False são os dois valores booleanos. Servem para condições: ligado/desligado, sim/não. Não são texto (não levam aspas) nem o número 1.',
          'True sem aspas e com T maiúsculo é bool. Se fosse texto, estaria escrito "True". Se fosse número, seria 1 ou 0, não a palavra True.',
        ),
        fill(
          'n1_tip_q4',
          'Qual função mostra o tipo de um valor? Complete:\n\n??(idade)',
          ['type(idade)', 'type'],
          'type(idade) devolve o tipo do valor guardado em idade, por exemplo <class \'int\'>. É o termômetro do tipo, não muda o valor.',
          'A função é type. Escreva type(idade). Não use print no lugar: print mostra o valor, type classifica o valor.',
          'Qual função mostra o tipo de um valor? Complete type de idade.',
        ),
      ],
    },
    {
      id: 'n1_tipos_print',
      title: 'print',
      subtitle: 'Mostrar valores na tela para você enxergar o que o programa fez.',
      kind: 'lesson',
      xpReward: 20,
      theory: theory({
        concept:
          'print é a função que envia texto para a saída padrão, em geral a tela. Ela não calcula sozinha e não guarda resultado em variável: só mostra o que você passou. Para quem está começando, print é a lanterna: você vê se a variável está com o valor que imaginou.',
        syntax:
          'Escreva print, abra parênteses, coloque o valor ou a variável, feche parênteses. Vários valores podem ir separados por vírgula: print os separa com espaço. Texto literal precisa de aspas; nome de variável vai sem aspas, senão vira texto fixo. Em Python 3 os parênteses são obrigatórios.',
        syntaxCode:
          'print("Olá, mundo")\nprint(nome)\nprint("soma =", 2 + 3)\n# print nome   <- falta o parêntese no Python 3',
        examples: [
          {
            caption: 'Texto fixo na tela',
            code: 'print("Olá, mundo")',
            output: 'Olá, mundo',
          },
          {
            caption: 'print mostra o conteúdo da variável, não o nome',
            code: 'recado = "oi"\nprint(recado)',
            output: 'oi',
          },
        ],
        speak:
          'print mostra valores na tela. Use parênteses. Texto vai entre aspas; o nome da variável vai sem aspas para aparecer o conteúdo.',
      }),
      exercises: [
        mc(
          'n1_q7',
          'O que a função print faz?',
          ['Apaga a variável', 'Mostra o valor na tela', 'Pede uma senha ao sistema'],
          'Mostra o valor na tela',
          'print envia o conteúdo para a saída, em geral a tela do celular ou do computador. A variável continua existindo depois; nada é apagado.',
          'print não apaga nem pede senha. Ele só exibe o que você colocou entre os parênteses, para você ver o resultado.',
        ),
        fill(
          'n1_q8',
          'Escreva a linha que mostra exatamente Olá, mundo na tela.',
          ['print("Olá, mundo")', "print('Olá, mundo')", 'print("Olá, mundo");'],
          'print("Olá, mundo") manda o texto literal para a tela. As aspas marcam a string; os parênteses chamam a função.',
          'A linha correta é print("Olá, mundo"). Precisa da função print, dos parênteses e das aspas em volta do texto.',
          'Escreva a linha que mostra exatamente Olá, mundo na tela.',
        ),
        mc(
          'n1_print_q3',
          'nome = "Bo"\nprint("nome")\n\nO que aparece?',
          ['Bo', 'nome', 'print'],
          'nome',
          'As aspas fazem "nome" ser texto fixo. print("nome") escreve as quatro letras n-o-m-e. Para ver Bo, seria print(nome) sem aspas.',
          'Com aspas, o Python não olha a variável: ele imprime o texto nome. O conteúdo Bo só aparece se você escrever print(nome) sem aspas.',
          'nome igual a Bo, print aspas nome aspas. O que aparece?',
        ),
        order(
          'n1_print_q4',
          'Ordene: guardar um recado e imprimir o conteúdo.',
          ['recado = "oi"', 'print(recado)'],
          'A variável nasce na primeira linha. A segunda mostra o conteúdo oi. print(recado) sem aspas é o que lê a caixa.',
          'Sem criar recado primeiro, o print não tem o que ler. Depois use print(recado), não print("recado"), para ver oi.',
        ),
      ],
    },
    {
      id: 'n1_desafio',
      title: 'Desafio do Nível 1',
      subtitle: 'Passe neste teste para desbloquear o Nível 2.',
      kind: 'challenge',
      xpReward: 40,
      theory: theory({
        concept:
          'Este desafio junta a lógica de passos, variáveis, tipos e print. Antes de responder, releia a ideia: o Python executa de cima para baixo, guarda valores em nomes, trata "10" diferente de 10, e print só mostra o que recebe.',
        syntax:
          'Lembretes rápidos: nome = valor cria a caixa; o tipo vem do valor (aspas → str, número sem ponto → int, True/False → bool); print(variavel) mostra o conteúdo; print("variavel") mostra o texto fixo.',
        syntaxCode:
          'idade = 20\ntexto = "20"\nprint(idade)   # mostra 20, tipo int\nprint(texto)   # mostra 20, tipo str\nif idade >= 18:\n    print("ok")',
        examples: [
          {
            caption: 'Variável, tipo e print juntos',
            code: 'nome = "Bo"\nprint(nome)\nprint(type(nome))',
            output: "Bo\n<class 'str'>",
          },
          {
            caption: 'A ordem ainda importa no desafio',
            code: 'recado = "oi"\nprint(recado)',
            output: 'oi',
          },
        ],
        speak:
          'Desafio do nível 1. Relembre: variável guarda valor, tipo depende de aspas ou não, print mostra o conteúdo, e as linhas rodam de cima para baixo.',
      }),
      exercises: [
        mc(
          'n1_c1',
          'Qual linha cria uma variável idade com o número 20?',
          ['print(idade)', 'idade = 20', '20 = idade'],
          'idade = 20',
          'Na atribuição o nome fica à esquerda e o valor à direita: idade = 20. print(idade) só mostraria um valor que já existe. 20 = idade é inválido: o número não pode ser o nome da caixa.',
          'A forma correta é idade = 20. O Python não aceita 20 = idade, porque o lado esquerdo precisa ser um nome, não um número. print não cria variável.',
        ),
        fill(
          'n1_c2',
          'O que este programa imprime?\n\nnome = "Bo"\nprint(nome)\n\nDigite só o texto que aparece.',
          ['Bo'],
          'nome guarda o texto Bo. print(nome) sem aspas lê a caixa e mostra Bo, não a palavra nome.',
          'O resultado na tela é Bo. print(nome) mostra o conteúdo da variável. Se fosse print("nome"), aí sim apareceria a palavra nome.',
          'O que este programa imprime? nome igual a Bo, print nome. Digite só o texto que aparece.',
          'text',
        ),
        mc(
          'n1_c3',
          'True é um valor de qual tipo?',
          ['str', 'int', 'bool'],
          'bool',
          'True e False são booleanos. Eles alimentam decisões (if). Não são o texto "True" nem o inteiro 1, embora às vezes se comportem parecido em contas.',
          'O tipo correto é bool. str teria aspas; int seria um número como 1. True escrito assim, com T maiúsculo e sem aspas, é booleano.',
        ),
        order(
          'n1_c4',
          'Ordene: guardar um recado e imprimir.',
          ['recado = "oi"', 'print(recado)'],
          'Guardar e depois mostrar: dois passos. A variável precisa existir antes do print ler o conteúdo oi.',
          'A sequência correta cria recado = "oi" e só então chama print(recado). Invertendo, o nome ainda não existe.',
        ),
      ],
    },
  ],
}
