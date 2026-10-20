import { fill, mc, order, theory, type Level } from '../lesson-core'

export const nivelAvancado: Level = {
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
      theory: theory({
        concept:
          'Orientação a objetos organiza o programa em tipos que você mesmo descreve. A classe é o molde: quais dados o objeto tem e o que ele sabe fazer. O objeto (instância) é um exemplar concreto, como um gato chamado Mimi feito a partir da classe Gato. Atributos guardam dados; métodos são funções ligadas ao objeto.',
        syntax:
          'class Nome: começa o molde. O construtor é def __init__(self, ...): e roda quando você chama Nome(...). self representa o próprio objeto; o Python preenche self na chamada, você não passa ele. Atributos nascem com self.nome = nome. Crie o objeto com mimi = Gato("Mimi") e use mimi.nome.',
        syntaxCode:
          'class Pessoa:\n    def __init__(self, nome):\n        self.nome = nome\n\nana = Pessoa("Ana")\nprint(ana.nome)\n\n# class é o molde; ana é o objeto',
        examples: [
          {
            caption: 'Molde, construtor e um objeto',
            code: 'class Gato:\n    def __init__(self, nome):\n        self.nome = nome\n\nmimi = Gato("Mimi")\nprint(mimi.nome)',
            output: 'Mimi',
          },
          {
            caption: 'Dois objetos, mesmos campos, valores diferentes',
            code: 'class Conta:\n    def __init__(self, saldo):\n        self.saldo = saldo\n\na = Conta(10)\nb = Conta(50)\nprint(a.saldo)\nprint(b.saldo)',
            output: '10\n50',
          },
        ],
        speak:
          'Classe é o molde; objeto é o exemplar. O construtor se chama init com dois sublinhados de cada lado. self é o próprio objeto. Atributos usam self ponto nome.',
      }),
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
          'A classe descreve o tipo: quais atributos e métodos existem. O objeto é um exemplar com valores próprios. O número 3 é um objeto int, não uma classe que você definiu agora.',
          'Classe não é o objeto em si nem um erro. É o projeto, o molde. A partir dela você cria vários objetos com a mesma estrutura e dados diferentes.',
        ),
        mc(
          'nav_q2',
          'O primeiro parâmetro de um método de instância costuma ser...',
          ['this', 'self', 'cls obrigatoriamente'],
          'self',
          'Por convenção o primeiro parâmetro é self: o próprio objeto. Você não passa self na chamada; o Python preenche. this é o nome em outras linguagens. cls aparece em métodos de classe, não no __init__ comum.',
          'Em Python o convênio do método de instância é self. this não é o nome padrão aqui. cls não é o primeiro parâmetro de __init__.',
        ),
        fill(
          'nav_q3',
          'Complete o construtor:\n\nclass Pessoa:\n    def ??(self, nome):\n        self.nome = nome',
          ['__init__', 'def __init__'],
          '__init__ é o construtor: roda quando você faz Pessoa("Ana"). Os dois sublinhados de cada lado são obrigatórios. Lá dentro, self.nome = nome guarda o atributo.',
          'O nome do construtor é __init__. Sem os sublinhados o Python não chama esse método na criação do objeto.',
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
          'Molde, construtor, atributo, instância, uso. A classe precisa existir antes de Gato("Mimi"). print(mimi.nome) lê o atributo gravado no __init__.',
          'Comece por class Gato:, depois o __init__ indentado, self.nome = nome, então mimi = Gato("Mimi") e print(mimi.nome). Não dá para instanciar antes da classe.',
        ),
      ],
    },
    {
      id: 'nav_metodos',
      title: 'Atributos e métodos',
      subtitle: 'Dados no objeto e ações que usam esses dados.',
      kind: 'lesson',
      xpReward: 30,
      theory: theory({
        concept:
          'Atributo é um pedaço de dado colado no objeto: self.saldo, self.nome. Método é uma função definida na classe que recebe self e por isso enxerga esses dados. objeto.metodo() chama a ação. Isso junta estado e comportamento: a conta sabe depositar no próprio saldo, em vez de uma função solta procurar a conta.',
        syntax:
          'Dentro da classe, def depositar(self, valor): e no corpo self.saldo = self.saldo + valor. Fora, c.depositar(5). Não passe self na chamada. Atributos também podem ser lidos e escritos de fora (c.saldo), mas o hábito saudável é mudar estado pelos métodos, para as regras ficarem num lugar só.',
        syntaxCode:
          'class Conta:\n    def __init__(self, saldo):\n        self.saldo = saldo\n\n    def depositar(self, valor):\n        self.saldo = self.saldo + valor\n\nc = Conta(10)\nc.depositar(5)\nprint(c.saldo)    # 15',
        examples: [
          {
            caption: 'Método usa e altera o atributo',
            code: 'class Conta:\n    def __init__(self, saldo):\n        self.saldo = saldo\n\n    def depositar(self, valor):\n        self.saldo = self.saldo + valor\n\nc = Conta(10)\nc.depositar(5)\nprint(c.saldo)',
            output: '15',
          },
          {
            caption: 'Ler atributo depois do construtor',
            code: 'class Conta:\n    def __init__(self, saldo):\n        self.saldo = saldo\n\nc = Conta(10)\nprint(c.saldo)',
            output: '10',
          },
        ],
        speak:
          'Atributo é o dado do objeto, como saldo. Método é a função da classe que recebe self e pode mudar esse dado. Você chama objeto ponto método com parênteses.',
      }),
      exercises: [
        mc(
          'nav_c1',
          'class Conta:\n    def __init__(self, saldo):\n        self.saldo = saldo\n\nc = Conta(10)\nprint(c.saldo)\n\nO que aparece?',
          ['saldo', '10', 'Conta'],
          '10',
          'O objeto c foi construído com saldo 10. c.saldo lê esse atributo. print mostra 10, não o nome da classe nem a palavra saldo.',
          'O valor impresso é 10, o que foi guardado em self.saldo. print(c.saldo) não escreve Conta nem o identificador saldo.',
          'Classe Conta com saldo 10. print c.saldo. O que aparece?',
        ),
        fill(
          'nav_c2',
          'Escreva a primeira linha de uma classe chamada Relatorio.',
          ['class Relatorio:', 'class Relatorio():'],
          'A declaração é class Relatorio: com dois pontos. Os parênteses vazios são opcionais em Python 3 e não mudam o molde básico.',
          'Use class Relatorio: — palavra class, o nome com inicial maiúscula por convenção, e dois pontos. def Relatorio não cria classe.',
          'Escreva a primeira linha de uma classe chamada Relatório.',
        ),
        mc(
          'nav_met_q3',
          'Para depositar 5 reais em c, qual chamada está no estilo Python?',
          ['depositar(c, 5) como função solta obrigatória', 'c.depositar(5)', 'c.depositar(c, 5)'],
          'c.depositar(5)',
          'O objeto vem antes do ponto. self é preenchido com c automaticamente, então você só passa o valor 5. Passar c de novo duplicaria o argumento.',
          'A chamada idiomática é c.depositar(5). self não se escreve na chamada. c.depositar(c, 5) mandaria dois argumentos além do self implícito.',
        ),
        order(
          'nav_met_q4',
          'Ordene: classe com método depositar e um depósito.',
          [
            'class Conta:',
            '    def __init__(self, saldo):',
            '        self.saldo = saldo',
            '    def depositar(self, valor):',
            '        self.saldo = self.saldo + valor',
            'c = Conta(10)',
            'c.depositar(5)',
          ],
          'Classe, construtor, método, objeto, chamada. Depois disso c.saldo vale 15.',
          'Defina a classe e os métodos antes de criar c. O depósito c.depositar(5) só existe depois do def depositar.',
        ),
      ],
    },
    {
      id: 'nav_automacao',
      title: 'Automação',
      subtitle: 'Faça o computador repetir tarefas chatas com segurança.',
      kind: 'lesson',
      xpReward: 30,
      theory: theory({
        concept:
          'Automação, neste curso, é um programa que executa tarefas repetitivas no seu lugar: listar arquivos de uma pasta, filtrar os .txt, gerar um recado, lembrar um passo. O ganho é consistência e tempo. O risco é o script fazer depressa uma besteira grande. Por isso começamos em pasta de teste e imprimimos o que faríamos antes de mudar algo de verdade.',
        syntax:
          'pathlib.Path representa caminhos. Path("teste") / "arquivo.txt" junta pastas de forma legível. pasta.iterdir() gera cada item. item.suffix é a extensão (.txt). item.name é só o nome. for item in pasta.iterdir(): visita um por um. Combine com if item.suffix == ".txt". Não apague a pasta home para testar.',
        syntaxCode:
          'from pathlib import Path\n\npasta = Path("teste")\nfor item in pasta.iterdir():\n    print(item.name)\n    if item.suffix == ".txt":\n        print("texto:", item)',
        examples: [
          {
            caption: 'Listar nomes — ensaio seguro, sem apagar nada',
            code: 'from pathlib import Path\n\npasta = Path("teste")\nfor item in pasta.iterdir():\n    print(item.name)',
            output: 'notas.txt\nfoto.jpg',
          },
          {
            caption: 'Filtrar só arquivos de texto',
            code: 'from pathlib import Path\n\npasta = Path("teste")\nfor item in pasta.iterdir():\n    if item.suffix == ".txt":\n        print(item.name)',
            output: 'notas.txt',
          },
        ],
        speak:
          'Automação é código que faz tarefas repetidas. Path monta caminhos, iterdir visita cada item, suffix é a extensão. Comece numa pasta de teste e imprima antes de modificar.',
      }),
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
          'Renomear arquivos, gerar relatórios, listar uma pasta: o script trabalha no lugar dos cliques repetidos. Não é delegar para um humano nem só desligar a máquina.',
          'Automação aqui significa código que faz a tarefa. Pedir para outra pessoa ou desligar o computador não é o conceito desta lição.',
        ),
        mc(
          'nav_q6',
          'Qual módulo da biblioteca padrão ajuda a trabalhar com caminhos de arquivos?',
          ['random', 'pathlib', 'tkinter'],
          'pathlib',
          'pathlib oferece Path, iterdir, suffix e o operador / para juntar pastas. random sorteia; tkinter monta janela. O foco de caminhos modernos é pathlib.',
          'O módulo certo é pathlib. random não monta caminho de arquivo; tkinter é interface gráfica.',
        ),
        fill(
          'nav_q7',
          'Complete o laço que visita cada Path em uma pasta:\n\nfor item in pasta.??():',
          ['iterdir', 'iterdir()'],
          'iterdir() gera os itens da pasta, um por um. O for recebe cada Path. É o “para cada arquivo e subpasta daqui”.',
          'O método é iterdir. Complete com iterdir ou iterdir(). Não use listdir neste exercício: o objeto Path usa iterdir().',
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
          'Ensaie o efeito (dry-run): print dos nomes, pasta isolada, depois a mudança de verdade. Automação potente precisa de cautela porque o erro também se repete rápido.',
          'Nunca teste apagando a pasta pessoal nem lance dois scripts que se atropelam. O caminho seguro é pasta de teste mais print do que seria feito.',
        ),
      ],
    },
    {
      id: 'nav_desafio',
      title: 'Desafio avançado',
      subtitle: 'Feche a trilha demonstrando POO e automação.',
      kind: 'challenge',
      xpReward: 60,
      theory: theory({
        concept:
          'O desafio final mistura classe/objeto e um laço seguro em pasta de teste. Classe é molde, __init__ constrói, self.atributo guarda, método age. Automação percorre pasta.iterdir() e filtra, por exemplo, item.suffix == ".txt", imprimindo antes de alterar.',
        syntax:
          'class Relatorio: def __init__(self, titulo): self.titulo = titulo. pasta = Path("teste"); for item in pasta.iterdir(): print(item.name).',
        syntaxCode:
          'from pathlib import Path\n\nclass Relatorio:\n    def __init__(self, titulo):\n        self.titulo = titulo\n\npasta = Path("teste")\nfor item in pasta.iterdir():\n    print(item.name)',
        examples: [
          {
            caption: 'Objeto com atributo visível',
            code: 'class Conta:\n    def __init__(self, saldo):\n        self.saldo = saldo\n\nc = Conta(10)\nprint(c.saldo)',
            output: '10',
          },
          {
            caption: 'Ensaio: só listar nomes da pasta de teste',
            code: 'from pathlib import Path\npasta = Path("teste")\nfor item in pasta.iterdir():\n    print(item.name)',
            output: 'notas.txt',
          },
        ],
        speak:
          'Desafio avançado. Classe é molde, init constrói, self guarda atributo. Path e iterdir listam a pasta. Imprima primeiro, mude depois, e filtre pela extensão.',
      }),
      exercises: [
        mc(
          'nav_des_q1',
          'class Conta:\n    def __init__(self, saldo):\n        self.saldo = saldo\n\nc = Conta(10)\nprint(c.saldo)\n\nO que aparece?',
          ['saldo', '10', 'Conta'],
          '10',
          'c.saldo é o valor colocado no __init__. print mostra 10. Este é o mesmo raciocínio de variável, só que o nome está colado no objeto.',
          'Aparece 10. print(c.saldo) lê o atributo, não o nome da classe nem a palavra saldo.',
          'Classe Conta com saldo 10. print c.saldo. O que aparece?',
        ),
        fill(
          'nav_des_q2',
          'Escreva a primeira linha de uma classe chamada Relatorio.',
          ['class Relatorio:', 'class Relatorio():'],
          'class Relatorio: declara o molde. Convenção: inicial maiúscula no nome da classe.',
          'A linha é class Relatorio: com dois pontos. Sem class você não cria o tipo.',
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
          'Laço + filtro no suffix é automação clássica de arquivos. item.suffix == ".txt" separa texto de imagem sem apagar nada.',
          'Você precisa visitar cada item e testar o nome ou o suffix. O sistema não adivinha, e apagar tudo não é filtrar.',
        ),
        order(
          'nav_c4',
          'Ordene um esboço seguro: pasta de teste, listar, depois agir.',
          ['pasta = Path("teste")', 'for item in pasta.iterdir():', '    print(item.name)'],
          'Aponte para o teste, percorra, observe. Só então — noutro passo, com calma — você mudaria arquivos. print é o ensaio.',
          'Sem apontar a pasta, o laço não tem o que percorrer. A ordem é Path("teste"), for item in pasta.iterdir(): e print(item.name) indentado.',
        ),
      ],
    },
  ],
}
