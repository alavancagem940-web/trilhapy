import { fill, mc, order, theory, type Level } from '../lesson-core'

export const nivel2: Level = {
  id: 'nivel_2',
  order: 2,
  band: 'Elementar',
  title: 'Nível 2 · Elementar',
  description: 'Decisões com if/else e operadores lógicos.',
  units: [
    {
      id: 'n2_if_else',
      title: 'if e else',
      subtitle: 'O programa escolhe um caminho conforme a condição.',
      kind: 'lesson',
      xpReward: 20,
      theory: theory({
        concept:
          'if pergunta: “esta condição é verdadeira?”. Se for, o Python entra no bloco indentado. else é o plano B: roda só quando o if não entrou. Os dois caminhos são exclusivos — em um mesmo if/else, só um bloco executa.',
        syntax:
          'A linha do if termina obrigatoriamente com dois pontos. O bloco de baixo deve estar indentado (4 espaços é o padrão). else também leva dois pontos e o mesmo recuo do if, não do bloco interno. Dá para encadear elif para testar outras condições no meio.',
        syntaxCode:
          'if condicao:\n    faca_isto()\nelse:\n    faca_aquilo()\n\n# três caminhos:\nif nota >= 7:\n    print("ok")\nelif nota >= 5:\n    print("recuperacao")\nelse:\n    print("estudo")',
        examples: [
          {
            caption: 'Maioridade com if/else',
            code: 'idade = 16\nif idade >= 18:\n    print("sim")\nelse:\n    print("nao")',
            output: 'nao',
          },
          {
            caption: 'Quando a condição é verdadeira, o else é ignorado',
            code: 'nota = 9\nif nota >= 7:\n    print("ok")\nelse:\n    print("estudo")',
            output: 'ok',
          },
        ],
        speak:
          'if executa o bloco só quando a condição é verdadeira. else é o caminho contrário. Cada linha de if, elif ou else termina com dois pontos, e o bloco vai indentado.',
      }),
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
          'if é uma pergunta. Se a resposta for True, o Python desce para o bloco indentado. Se for False, ele pula aquele bloco inteiro.',
          'O bloco do if não é comentário e não roda sempre. Ele só executa quando a condição avalia para True. Se for False, essas linhas são puladas.',
        ),
        fill(
          'n2_q2',
          'Complete a condição para maior de idade em Python (18 ou mais):\n\nif idade ?? 18:',
          ['if idade >= 18:', 'idade >= 18'],
          '>= significa maior ou igual. idade >= 18 é verdade para 18, 19, 40… e falsa para 17. Os dois pontos fecham a pergunta do if.',
          'A comparação correta é idade >= 18. Só > 18 deixaria a pessoa de 18 anos de fora. Escreva if idade >= 18:',
          'Complete a condição para maior de idade. if idade o quê 18?',
        ),
        order(
          'n2_q3',
          'Ordene um if/else que imprime ok se nota for pelo menos 7.',
          ['if nota >= 7:', '    print("ok")', 'else:', '    print("estudo")'],
          'A espinha é if, bloco verdadeiro, else, bloco contrário. Os prints ficam indentados; else alinha com if.',
          'Comece pelo if nota >= 7: e o print ok indentado. Depois else: e o print estudo indentado. else nunca vem antes do if.',
        ),
        mc(
          'n2_q4',
          'O bloco do else executa quando...',
          ['A condição do if é verdadeira', 'A condição do if é falsa', 'O programa termina'],
          'A condição do if é falsa',
          'else quer dizer “caso contrário”. Só entra se o if não entrou. Se a condição for True, o Python ignora o else.',
          'else não encerra o programa e não roda junto com o if. Ele é o plano B: somente quando a condição do if é False.',
        ),
      ],
    },
    {
      id: 'n2_comparacao',
      title: 'Operadores de comparação',
      subtitle: 'Perguntas que dão True ou False: ==, !=, >, <, >=, <=.',
      kind: 'lesson',
      xpReward: 20,
      theory: theory({
        concept:
          'Comparar é fazer uma pergunta cujo resultado é bool. == pergunta se dois valores são iguais; != se são diferentes; > < >= <= comparam tamanho. O resultado dessas expressões alimenta o if. Um único = atribui; dois == comparam. Misturar os dois é o erro mais comum neste nível.',
        syntax:
          'Os seis operadores são: == igual, != diferente, > maior, < menor, >= maior ou igual, <= menor ou igual. Eles ficam entre dois valores e devolvem True ou False. Dá para comparar números e também textos (igualdade de string). Não use = dentro da condição quando a intenção for comparar.',
        syntaxCode:
          'idade == 18      # igual a 18?\nidade != 18      # diferente de 18?\nidade > 18       # maior que 18?\nidade < 18       # menor que 18?\nidade >= 18      # 18 ou mais?\nidade <= 18      # 18 ou menos?\n\nsenha == "secreta"',
        examples: [
          {
            caption: '== compara; um único = guardaria um valor',
            code: 'idade = 18\nprint(idade == 18)\nprint(idade == 20)',
            output: 'True\nFalse',
          },
          {
            caption: '>= inclui o limite; > não inclui',
            code: 'nota = 7\nprint(nota >= 7)\nprint(nota > 7)',
            output: 'True\nFalse',
          },
        ],
        speak:
          'Comparação devolve verdadeiro ou falso. Use dois iguais para comparar, um igual só para guardar valor. Maior ou igual inclui o limite; maior que não inclui.',
      }),
      exercises: [
        mc(
          'n2_cmp_q1',
          'Qual símbolo pergunta se dois valores são iguais?',
          ['=', '==', '>='],
          '==',
          '== é o operador de igualdade. Ele devolve True ou False. Um único = não pergunta nada: ele atribui o valor da direita no nome da esquerda.',
          'Para comparar igualdade usamos ==. O sinal = sozinho guarda valor numa variável e não deve ir na condição do if quando a ideia é perguntar.',
        ),
        fill(
          'n2_cmp_q2',
          'Complete para testar se senha é exatamente secreta:\n\nif senha ?? "secreta":',
          ['if senha == "secreta":', 'senha == "secreta"'],
          'senha == "secreta" é True só quando o texto guardado é exatamente secreta. Dois iguais comparam; as aspas marcam o texto.',
          'Use == entre senha e "secreta". Um único = tentaria atribuir dentro do if e gera erro de sintaxe. A linha fica if senha == "secreta":',
          'Complete para testar se senha é exatamente secreta. if senha o quê secreta?',
        ),
        mc(
          'n2_cmp_q3',
          'n = 10\nprint(n != 10)\n\nO que aparece?',
          ['True', 'False', '10'],
          'False',
          '!= significa “é diferente?”. 10 não é diferente de 10, então a pergunta é falsa e print mostra False.',
          'n vale 10, então n != 10 é False. True apareceria se n fosse outro número. 10 não é impresso porque o print mostra o resultado da comparação, não o valor de n.',
          'n igual a 10, print n diferente de 10. O que aparece?',
        ),
        mc(
          'n2_cmp_q4',
          'Qual expressão é True quando a pessoa tem 18 anos e a regra é “18 ou mais”?',
          ['idade > 18', 'idade >= 18', 'idade == 17'],
          'idade >= 18',
          '>= inclui o 18. idade > 18 deixaria o recém-18 de fora. idade == 17 testa outra coisa.',
          'A regra “18 ou mais” é idade >= 18. O operador > não conta o próprio 18. == 17 só seria verdade para quem tem 17.',
        ),
      ],
    },
    {
      id: 'n2_operadores',
      title: 'Operadores lógicos',
      subtitle: 'Combine perguntas com and, or e not.',
      kind: 'lesson',
      xpReward: 20,
      theory: theory({
        concept:
          'Às vezes uma decisão depende de duas perguntas. and exige que as duas sejam True. or aceita se pelo menos uma for True. not inverte: True vira False e False vira True. Isso espelha o português: “convite e pontual”, “chuva ou vento”, “não atrasada”.',
        syntax:
          'Os operadores lógicos escrevem por extenso: and, or, not — não use && ou || (isso é de outras linguagens). A ordem de leitura usual é not primeiro, depois and, depois or. Use parênteses quando a frase ficar ambígua. Cada lado de and/or deve ser uma expressão booleana, por exemplo uma comparação.',
        syntaxCode:
          'a and b     # True só se os dois forem True\na or b      # True se um dos dois for True\nnot a       # inverte a\n\nif convite and not atrasada:\n    print("entra")\nif chuva or vento:\n    print("fica em casa")',
        examples: [
          {
            caption: 'and é exigente; or é inclusivo',
            code: 'print(True and False)\nprint(True or False)\nprint(not True)',
            output: 'False\nTrue\nFalse',
          },
          {
            caption: 'Duas exigências ao mesmo tempo',
            code: 'convite = True\natrasada = False\nif convite and not atrasada:\n    print("entra")',
            output: 'entra',
          },
        ],
        speak:
          'and só é verdadeiro se os dois lados forem verdadeiros. or vale se pelo menos um for verdadeiro. not inverte o valor. Em Python as palavras são and, or e not.',
      }),
      exercises: [
        mc(
          'n2_q5',
          'True and False vale...',
          ['True', 'False', 'None'],
          'False',
          'and só devolve True quando os dois lados são True. Aqui o segundo lado é False, então o resultado inteiro é False.',
          'Se qualquer lado do and for False, a expressão toda é False. True and False portanto vale False, não True.',
        ),
        mc(
          'n2_q6',
          'True or False vale...',
          ['True', 'False', '0'],
          'True',
          'or devolve True se pelo menos um lado for True. O primeiro lado já basta, então o resultado é True.',
          'No or, uma única verdade resolve. True or False é True. Só seria False se os dois lados fossem False.',
        ),
        mc(
          'n2_q7',
          'not True vale...',
          ['True', 'False', 'True True'],
          'False',
          'not inverte o booleano. O contrário de True é False. Não duplica o valor e não deixa True como está.',
          'not vira a lógica do avesso: not True é False, not False é True. Por isso a resposta é False.',
        ),
        fill(
          'n2_q8',
          'Uma pessoa entra se tiver convite e não estiver atrasada. Qual condição?\n\nif convite and ?? atrasada:',
          ['if convite and not atrasada:', 'convite and not atrasada'],
          'and junta as duas exigências. not atrasada é True quando atrasada é False. A entrada só acontece se existir convite e pontualidade.',
          'A condição completa é convite and not atrasada. and exige os dois; not nega o atraso. Não use or aqui: or deixaria entrar quem só tem uma das duas coisas.',
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
      theory: theory({
        concept:
          'O desafio mistura if/else, comparações e and/or/not. Leia a condição em voz alta como uma frase: “se idade for pelo menos 18”, “se chuva ou vento”. Depois escolha o caminho que o Python seguiria com os valores dados.',
        syntax:
          'Esqueleto: if comparacao: bloco. else: bloco. Combine com and, or, not. Lembre: == compara, = atribui; >= inclui o limite; and exige os dois lados.',
        syntaxCode:
          'if idade >= 18:\n    print("sim")\nelse:\n    print("nao")\n\nif chuva or vento:\n    print("casa")\n\nif convite and not atrasada:\n    print("entra")',
        examples: [
          {
            caption: 'Simule os valores antes de responder',
            code: 'idade = 16\nif idade >= 18:\n    print("sim")\nelse:\n    print("nao")',
            output: 'nao',
          },
          {
            caption: 'or cobre qualquer um dos dois casos',
            code: 'chuva = False\nvento = True\nif chuva or vento:\n    print("casa")',
            output: 'casa',
          },
        ],
        speak:
          'No desafio do nível 2, leia a condição com os valores dados. if escolhe o caminho, else é o contrário, and exige os dois, or aceita um.',
      }),
      exercises: [
        mc(
          'n2_c1',
          'idade = 16\nif idade >= 18:\n    print("sim")\nelse:\n    print("nao")\n\nO que aparece?',
          ['sim', 'nao', '16'],
          'nao',
          '16 é menor que 18, então idade >= 18 é False. O Python pula o print("sim") e executa o else, que mostra nao.',
          'A condição é falsa porque 16 não chega a 18. Com if falso, o bloco do else é que roda, portanto aparece nao — não sim e não o número 16.',
          'idade igual a 16. Se idade maior ou igual a 18, print sim, senão print não. O que aparece?',
        ),
        fill(
          'n2_c2',
          'Complete: se chuva ou vento, fica em casa.\n\nif chuva ?? vento:',
          ['if chuva or vento:', 'chuva or vento'],
          'or é o operador de “pelo menos um”. Chuva sozinha, vento sozinho ou os dois: a condição fica True e a pessoa fica em casa.',
          'Use or entre chuva e vento: if chuva or vento:. and exigiria os dois ao mesmo tempo, o que não é o enunciado.',
          'Complete: se chuva ou vento, fica em casa. if chuva o quê vento?',
        ),
        mc(
          'n2_c3',
          'Qual expressão é verdadeira só se os dois forem verdadeiros?',
          ['a or b', 'a and b', 'not a'],
          'a and b',
          'and é o “e” exigente: precisa de a True e b True. or aceita um; not inverte um único valor.',
          'A expressão que exige os dois lados verdadeiros é a and b. a or b passa com um só. not a não combina dois valores.',
        ),
        order(
          'n2_c4',
          'Ordene: avisar se a senha for secreta.',
          ['if senha == "secreta":', '    print("entrada")', 'else:', '    print("bloqueado")'],
          'Compare com ==, trate o sim no bloco do if e o não no else. Indentação marca cada caminho.',
          'A comparação if senha == "secreta": vem primeiro. Depois o print de entrada indentado, então else e o print bloqueado indentado.',
        ),
      ],
    },
  ],
}
