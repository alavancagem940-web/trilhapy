# TrilhaPy

PWA **TrilhaPy** no GitHub, mobile-first, para aprender Python do zero em português, no estilo Duolingo. Feita para o iPhone (Safari → Tela de Início) e Android (Chrome → Instalar app). Não é um binário da App Store: é um site que abre como app. Publicado em https://alavancagem940-web.github.io/trilhapy/ (o host é a conta do GitHub; o nome do app é TrilhaPy).

A trilha vai do **Básico ao Avançado**. Cada módulo começa pelo card **Explicação Teórica Prática** (conceito, sintaxe e exemplos reais em Python) e só então vai aos exercícios. Cada nível fecha com um **desafio**. É preciso acertar cerca de **75%** do desafio para liberar a etapa seguinte. Respostas certas ficam verdes e valem XP; erradas ficam vermelhas — nos dois casos o app explica o **motivo correto**. **Não há vidas nem corações**: se errar, você tenta de novo ou avança, sem limite.

## Leitor de voz (Microsoft neural)

O motor de voz no cliente monta SSML da Microsoft (rate `+0%`, pitch `+0Hz` — narração didática natural) e **toca MPEG neural com `Audio()`**. No iPhone o caminho feliz **não usa** `speechSynthesis` nem a voz compacta do sistema.

- **Padrão: Francisca** (`pt-BR-FranciscaNeural`). Adulta, clara, pt-BR, não infantil. Não é clone da Luísa Viotti nem modelo com o nome dela.
- **Lista para trocar:** Francisca, Giovanna, Yara, Thalia, Manuela. Thalia usa `pt-BR-ThalitaNeural` (o id `ThaliaNeural` não sintetiza na Microsoft).
- O TTS lê o **texto da lição** (pergunta, alternativa, teoria, feedback) de forma normal. Sem flerte, sem “chega mais perto”, sem “mmm”, sem provocação.
- Lê a **Explicação Teórica Prática** e cada pergunta ao aparecer, lê a alternativa quando você toca, lê o feedback, e o botão **Ouvir** repete.
- Fallback `speechSynthesis` se o MPEG neural falhar, for bloqueado no iPhone ou atrasar (~0,5 s). O texto falado continua o da lição, sem flerte. O primeiro toque destrava `Audio()` e `speechSynthesis`.

No desenvolvimento local, o Vite expõe `POST /__tts` (hop same-origin para a síntese Microsoft). No GitHub Pages o app toca os MPEG neurais gerados no build com o mesmo SSML.

## Primeira trilha

| Nível | Faixa | Módulos |
| --- | --- | --- |
| 1 | Básico | Lógica básica · Variáveis · Tipos de dados · `print` · desafio |
| 2 | Elementar | `if`/`else` · Comparação · Operadores lógicos · desafio |
| 3 | Intermediário | `for`/`range` · `while` · Listas · desafio |
| 4 | Intermediário+ | Funções · Parâmetros e `return` · `try`/`except` · desafio |
| Avançado | Avançado | Classes · Atributos e métodos · Automação · desafio |

Tipos de exercício: múltipla escolha, preenchimento e ordenar o código. O progresso fica só no `localStorage` deste aparelho — sem conta, sem banco e sem nuvem.

## Como rodar localmente

Node 22+ e npm:

```bash
npm install
npm run dev
```

O servidor sobe em [http://127.0.0.1:43817](http://127.0.0.1:43817). No celular da mesma rede, use o IP da máquina na mesma porta. O `__tts` local sintetiza na hora (Microsoft neural) e o `Audio()` toca o MPEG — no iPhone da LAN isso não cai em Web Speech.

Outros comandos:

```bash
npm test            # currículo, XP, SSML, síntese real Microsoft
npm run test:playback  # síntese + play() no Chrome com Audio()
npm run test:ios       # MPEG com UA de iPhone + toque / fallback Web Speech
npm run build       # gera MPEG neurais + dist/ para GitHub Pages
npm run preview     # serve o build na mesma porta 43817
```

No iPhone, o Safari só libera áudio depois do primeiro toque. O app destrava `Audio()` e `speechSynthesis` nesse toque. Depois de uma atualização, **feche o PWA na tela inicial (deslize para cima e mate o app) e abra de novo** para pegar o service worker novo (`trilhapy-ios-audio-v7`).

## Publicar no GitHub Pages (incluindo o base path)

O Vite precisa saber o caminho público do site. Sem isso, o JS/CSS e o service worker quebram.

| Tipo de site | URL final | `VITE_BASE` |
| --- | --- | --- |
| Projeto | `https://USUARIO.github.io/NOME_DO_REPO/` | `/NOME_DO_REPO/` |
| Usuário / organização | `https://USUARIO.github.io/` | `/` |

Build local para um repositório chamado `trilhapy`:

```bash
VITE_BASE=/trilhapy/ npm run build
```

A pasta `dist/` é o site estático. Tem um arquivo `.nojekyll` para o GitHub Pages não ignorar arquivos do Vite.

### Opção A — GitHub Actions (recomendada)

1. Envie este repositório para o GitHub.
2. Em **Settings → Pages**, escolha **GitHub Actions** como fonte.
3. O workflow em `.github/workflows/github-pages.yml` define `VITE_BASE` sozinho:
   - `/NOME_DO_REPO/` em site de projeto
   - `/` se o repositório for `USUARIO.github.io`
4. Cada push em `main` publica o app. O build gera os MPEG neurais (Microsoft) e empacota no site.

### Opção B — pasta `docs/` ou branch `gh-pages`

```bash
VITE_BASE=/NOME_DO_REPO/ npm run build
# copie dist/ para docs/ (ou publique a pasta dist na branch gh-pages)
```

Em **Settings → Pages**, aponte para essa pasta/branch. Confira se o `index.html` gerado referencia `/NOME_DO_REPO/assets/...`, não `/assets/...`.

O service worker (PWA) só funciona se o `VITE_BASE` for exatamente o caminho em que o site é servido. Se o app “ficar preso” numa versão velha depois de um deploy, limpe os dados do site no navegador ou reabra pelo ícone da tela inicial.

## Colocar na Tela de Início

Depois que o site estiver no ar (GitHub Pages ou a máquina local em HTTPS / localhost):

### iPhone (Safari)

1. Abra o site no **Safari** (não no Chrome).
2. Toque em **Compartilhar**.
3. Toque em **Adicionar à Tela de Início**.
4. Confirme o nome **TrilhaPy**.
5. Abra o ícone e, se o iOS perguntar, escolha **Abrir como App Web**.

O ícone usa `apple-touch-icon`, `theme-color` `#131F24` e `display: standalone`. Não é um `.ipa` da App Store.

### Android (Chrome)

1. Abra o site no **Chrome**.
2. No menu, toque em **Instalar app** ou **Adicionar à tela inicial**.
3. Confirme. O Chrome também pode mostrar o banner **Instalar app** dentro do próprio TrilhaPy.

## Arquivos

- `src/lib/lessons.ts` — correção, desbloqueio e validação do currículo
- `src/lib/curriculum/` — teoria e exercícios (N1–Avançado)
- `src/components/TheoryCard.tsx` — card **Explicação Teórica Prática**
- `src/lib/progress.ts` — XP e desbloqueio no `localStorage`
- `src/lib/microsoft-neural.ts` — vozes, SSML, hash do MPEG
- `src/lib/tts.ts` — motor no cliente: `Audio()` + MPEG neural Microsoft, sem Web Speech no caminho feliz
- `src/lib/speech-persona.ts` — normaliza o texto falado (sem persona extra)
- `scripts/bing-tts.ts` — síntese Microsoft no build e nos testes
- `src/components/` — trilha, lição, estados vazio / carregando / erro
- `public/` — ícones PWA e `apple-touch-icon.png`

## Fora deste recorte

- Conta, nuvem ou multiplayer
- Outras linguagens além de Python
- App nativo iOS/Android (`.ipa` / `.apk`)
