import { fill, mc, order, theory, type Level } from '../lesson-core'

export const nivel4: Level = {
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
      theory: theory({
        concept:
          'Função é um bloco com nome. Você define uma vez e chama várias vezes, eventualmente com valores diferentes. Definir não executa: só guarda a receita. Chamar com parênteses executa a receita. Isso evita copiar o mesmo código e deixa a intenção clara: dobro(5) lê melhor do que 5 * 2 espalhado em dez lugares.',
        syntax:
          'A palavra-chave é def, depois o nome, parênteses com parâmetros, dois pontos e o corpo indentado. return envia um valor para quem chamou. Se não houver return, a função devolve None. Chame com nome(). Argumentos na chamada correspondem aos parâmetros da definição, na ordem, a menos que você use nome=valor.',
        syntaxCode:
          'def saudacao():\n    print("oi")\n\ndef dobro(n):\n    return n * 2\n\nsaudacao()          # executa o bloco\nresultado = dobro(5)  # resultado vale 10',
        examples: [
          {
            caption: 'Definir guarda; chamar executa',
            code: 'def saudacao():\n    print("oi")\n\nsaudacao()\nsaudacao()',
            output: 'oi\noi',
          },
          {
            caption: 'return devolve o valor para quem chamou',
            code: 'def dobro(n):\n    return n * 2\n\nprint(dobro(5))',
            output: '10',
          },
        ],
        speak:
          'Função usa def, nome, parênteses e dois pontos. Definir não executa. Chamar com parênteses executa. return devolve o resultado para quem chamou.',
      }),
      exercises: [
        mc(
          'n4_q1',
          'Qual palavra-chave define uma função?',
          ['func', 'def', 'lambda somente'],
          'def',
          'Em Python a definição começa com def. Não existe a palavra func neste contexto. lambda existe para funções anônimas curtas, mas não substitui def no dia a dia do iniciante.',
          'A palavra correta é def. Escrevemos def nome(parametros): e o bloco indentado. func é de outras linguagens; lambda não é o caminho padrão aqui.',
        ),
        fill(
          'n4_q2',
          'Complete a função que devolve o dobro:\n\ndef dobro(n):\n    ?? n * 2',
          ['return n * 2', 'return n*2'],
          'return n * 2 envia o resultado para quem chamou. print(n * 2) só mostraria na tela e a função devolveria None.',
          'Use return n * 2. print não devolve valor. Sem return, dobro(5) não pode ser guardado em uma variável de forma útil.',
          'Complete a função que devolve o dobro. def dobro n, o quê n vezes 2?',
        ),
        mc(
          'n4_q3',
          'O que acontece ao chamar saudacao() se ela foi definida com def saudacao():?',
          ['O Python apaga a função', 'O bloco da função executa', 'Nada, funções nunca rodam'],
          'O bloco da função executa',
          'Os parênteses na chamada disparam o corpo. Definir com def só registra a receita; saudacao() é o momento de cozinhar.',
          'Chamar não apaga a função e não é um no-op. saudacao() executa o bloco indentado de def saudacao():',
        ),
        order(
          'n4_q4',
          'Ordene: definir soma e usar o resultado.',
          ['def soma(a, b):', '    return a + b', 'total = soma(2, 3)', 'print(total)'],
          'Defina, devolva, chame, mostre. A função precisa existir antes da chamada. total recebe 5 e o print mostra 5.',
          'Comece por def soma(a, b): e return a + b indentado. Só então total = soma(2, 3) e print(total). Invertendo, o nome soma ainda não existe.',
        ),
      ],
    },
    {
      id: 'n4_parametros',
      title: 'Parâmetros e return',
      subtitle: 'Entrada pelos parênteses, saída pelo return — print só exibe.',
      kind: 'lesson',
      xpReward: 25,
      theory: theory({
        concept:
          'Parâmetros são os nomes na definição; argumentos são os valores na chamada. return entrega um resultado que pode ir para uma variável, para um print ou para outra função. print e return não são a mesma coisa: print fala com a tela; return fala com o restante do código. Uma função pode ter vários parâmetros separados por vírgula.',
        syntax:
          'def media(a, b): cria dois parâmetros. Na chamada, media(4, 6) liga 4 a a e 6 a b. return (a + b) / 2 devolve a média. Depois da return, o restante da função não roda. Você pode dar valor padrão: def eco(msg, vezes=1). Neste curso, foque em parâmetros posicionais e um único return claro.',
        syntaxCode:
          'def media(a, b):\n    return (a + b) / 2\n\nresultado = media(4, 6)   # 5.0\nprint(resultado)\n\n# print dentro da função não substitui return\ndef mostra_media(a, b):\n    print((a + b) / 2)    # mostra, mas devolve None',
        examples: [
          {
            caption: 'Dois parâmetros, um retorno',
            code: 'def soma(a, b):\n    return a + b\n\nprint(soma(2, 3))',
            output: '5',
          },
          {
            caption: 'eco devolve o próprio argumento',
            code: 'def eco(msg):\n    return msg\n\nprint(eco("ping"))',
            output: 'ping',
          },
        ],
        speak:
          'Parâmetros são os nomes da definição; argumentos são os valores da chamada. return devolve um valor. print só mostra na tela e não substitui o return.',
      }),
      exercises: [
        fill(
          'n4_c2',
          'Escreva a primeira linha de uma função media com parametros a e b.',
          ['def media(a, b):', 'def media(a,b):'],
          'A primeira linha é def media(a, b): — palavra def, nome, parênteses com os parâmetros e dois pontos. O corpo vem indentado na linha seguinte.',
          'Use def media(a, b): com dois pontos no fim. Sem def o Python não cria a função; sem dois pontos a sintaxe quebra.',
          'Escreva a primeira linha de uma função média com parâmetros a e b.',
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
          'Você pode imprimir o que uma função retornou, mas print sozinho não vira resultado da função. Quem chama precisa do return para guardar o valor.',
          'São ferramentas diferentes. return entrega o valor ao chamador; print escreve na tela e devolve None. Invertê-los é o erro clássico nesta lição.',
        ),
        mc(
          'n4_par_q3',
          'def eco(msg):\n    return msg\nprint(eco("ping"))\n\nO que aparece?',
          ['msg', 'ping', 'eco'],
          'ping',
          'eco recebe "ping", devolve esse mesmo texto, e print mostra ping. A palavra msg é só o nome do parâmetro, não o que sai na tela.',
          'O que aparece é ping, o argumento. msg é o apelido interno; eco é o nome da função. Nem msg nem eco são impressos.',
          'def eco msg, return msg, print eco ping. O que aparece?',
        ),
        order(
          'n4_par_q4',
          'Ordene: função que devolve a média e uso do resultado.',
          ['def media(a, b):', '    return (a + b) / 2', 'print(media(4, 6))'],
          'Definição, return com a conta, depois a chamada dentro do print. media(4, 6) vale 5.0.',
          'A função precisa ser definida antes da chamada. O return indentado calcula; o print usa media(4, 6).',
        ),
      ],
    },
    {
      id: 'n4_erros',
      title: 'Tratamento de erros',
      subtitle: 'Quando algo dá errado, capture o erro em vez de quebrar tudo.',
      kind: 'lesson',
      xpReward: 25,
      theory: theory({
        concept:
          'Alguns trechos podem falhar: transformar "oi" em int, abrir arquivo que não existe, dividir por zero. Se ninguém tratar, o programa para e mostra um traceback. try/except deixa você tentar o trecho arriscado e responder ao erro com uma mensagem ou um valor seguro. O objetivo não é esconder bug: é falhar de forma compreensível.',
        syntax:
          'try: abre o bloco que pode falhar. except TipoDoErro: trata aquele tipo. ValueError aparece quando o valor tem o tipo certo mas o conteúdo não serve, como int("oi"). ZeroDivisionError é divisão por zero. except Exception é amplo demais para o começo: prefira o erro específico. else no try roda se não houve erro; finally roda sempre — mencione, mas pratique o par try/except.',
        syntaxCode:
          'try:\n    n = int(texto)\nexcept ValueError:\n    n = 0\n    print("isso nao era numero")\n\n# int("oi") levanta ValueError\n# int("10") funciona e n vira 10',
        examples: [
          {
            caption: 'Converter texto inválido sem quebrar o programa',
            code: 'texto = "oi"\ntry:\n    n = int(texto)\nexcept ValueError:\n    n = 0\nprint(n)',
            output: '0',
          },
          {
            caption: 'Quando a conversão dá certo, o except não entra',
            code: 'texto = "10"\ntry:\n    n = int(texto)\nexcept ValueError:\n    n = 0\nprint(n)',
            output: '10',
          },
        ],
        speak:
          'try tenta um trecho que pode falhar. except captura o tipo do erro, por exemplo ValueError na conversão int. Assim o programa explica o problema em vez de fechar.',
      }),
      exercises: [
        mc(
          'n4_q5',
          'Qual par de palavras protege um trecho que pode falhar?',
          ['start/end', 'try/except', 'open/close'],
          'try/except',
          'try envolve o código arriscado; except declara o que fazer se aquele erro acontecer. start/end e open/close não são o padrão de exceção em Python.',
          'O padrão da linguagem é try/except. open/close fala de arquivos; não substitui o tratamento de exceção.',
        ),
        mc(
          'n4_q6',
          'int("oi") costuma gerar...',
          ['ValueError', 'uma string nova', 'True'],
          'ValueError',
          'int espera um texto que represente número. "oi" não representa, então o Python levanta ValueError. Nada vira string nova nem True.',
          'O erro típico é ValueError: o tipo do argumento é string, mas o valor não pode virar inteiro. Não há conversão mágica para True.',
        ),
        fill(
          'n4_q7',
          'Complete:\n\ntry:\n    n = int(texto)\n?? ValueError:\n    n = 0',
          ['except ValueError:', 'except ValueError'],
          'except ValueError: captura só essa falha e permite escolher n = 0. Os dois pontos abrem o bloco de tratamento, como no if.',
          'A linha é except ValueError:. Sem except o erro escapa. catch não existe em Python.',
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
          'Uma mensagem clara ou um valor seguro é melhor do que a tela vermelha. Você ainda corrige a causa; só não deixa o programa morrer no colo da pessoa.',
          'except não acelera o código e não deve varrer bugs para debaixo do tapete. O ganho é responder ao erro: explicar, pedir de novo, usar um padrão.',
        ),
      ],
    },
    {
      id: 'n4_desafio',
      title: 'Desafio do Nível 4',
      subtitle: 'Passe para chegar ao Nível Avançado.',
      kind: 'challenge',
      xpReward: 50,
      theory: theory({
        concept:
          'O desafio cobra def, parâmetros, return versus print e try/except. Antes de cada questão, pergunte: isto define, chama, devolve ou mostra? E se falhar a conversão, quem segura o erro?',
        syntax:
          'def nome(param): corpo. return valor. try: conversao. except ValueError: plano B. print só exibe o que já existe ou o que a função devolveu.',
        syntaxCode:
          'def eco(msg):\n    return msg\n\nprint(eco("ping"))\n\ntry:\n    n = int(texto)\nexcept ValueError:\n    n = 0',
        examples: [
          {
            caption: 'Chamada usa o return',
            code: 'def eco(msg):\n    return msg\nprint(eco("ping"))',
            output: 'ping',
          },
          {
            caption: 'except só entra se int falhar',
            code: 'texto = "oi"\ntry:\n    n = int(texto)\nexcept ValueError:\n    n = 0\nprint(n)',
            output: '0',
          },
        ],
        speak:
          'Desafio do nível 4. def define, parênteses chamam, return devolve, print mostra, try tenta e except ValueError trata conversão inválida.',
      }),
      exercises: [
        mc(
          'n4_c1',
          'def eco(msg):\n    return msg\nprint(eco("ping"))\n\nO que aparece?',
          ['msg', 'ping', 'eco'],
          'ping',
          'A função devolve o argumento "ping". print recebe esse retorno e mostra ping. O nome do parâmetro msg não é impresso.',
          'O texto na tela é ping. eco só devolve o que recebeu; print imprime esse retorno, não a palavra msg nem o nome eco.',
          'def eco msg, return msg, print eco ping. O que aparece?',
        ),
        fill(
          'n4_des_q2',
          'Escreva a primeira linha de uma função media com parametros a e b.',
          ['def media(a, b):', 'def media(a,b):'],
          'def media(a, b): abre a função com dois parâmetros. É a linha que o Python precisa para saber o nome e as entradas.',
          'A resposta é def media(a, b): com dois pontos. function media não existe em Python.',
          'Escreva a primeira linha de uma função média com parâmetros a e b.',
        ),
        order(
          'n4_c3',
          'Ordene um try/except que transforma texto em número ou usa 0.',
          ['try:', '    n = int(texto)', 'except ValueError:', '    n = 0'],
          'Tente converter; se o texto não for número, ValueError cai no except e n vira 0. except vem imediatamente depois do try.',
          'A ordem é try:, n = int(texto) indentado, except ValueError:, n = 0 indentado. except não pode aparecer antes do try.',
        ),
        mc(
          'n4_des_q4',
          'Uma função calcula e outra só mostra. Qual combinação está certa?',
          [
            'As duas devem usar só print e nunca return',
            'A que calcula usa return; quem quer ver o valor pode dar print no resultado',
            'return serve apenas para texto e print apenas para número',
          ],
          'A que calcula usa return; quem quer ver o valor pode dar print no resultado',
          'Separar cálculo e exibição deixa a função reutilizável: você pode somar sem imprimir, ou imprimir depois. return não é exclusivo de texto.',
          'Cálculo devolve com return. Mostrar é papel do print, em geral fora da função ou depois da chamada. print não substitui return.',
        ),
      ],
    },
  ],
}
