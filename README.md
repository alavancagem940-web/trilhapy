# TrilhaPy

PWA mobile-first para aprender Python do zero, em português, no estilo Duolingo. Feita para o iPhone (Safari → Tela de Início) e Android (Chrome → Instalar app). Não é um binário da App Store: é um site que abre como app.

A trilha vai do **Básico ao Avançado**. Cada nível tem lições curtas e um **desafio final**. É preciso acertar cerca de **75%** do desafio para liberar a etapa seguinte. Respostas certas ficam verdes e valem XP; erradas ficam vermelhas. **Não há vidas nem corações**: se errar, você tenta de novo ou avança, sem limite.

O leitor de voz usa a **Web Speech API** (`pt-BR`): lê cada pergunta ao aparecer, lê a alternativa quando você toca, e o botão **Ouvir** repete. O áudio não trava a tela.

## Primeira trilha

| Nível | Faixa | O que você pratica |
| --- | --- | --- |
| 1 | Básico | Lógica, variáveis, tipos de dados e `print` |
| 2 | Elementar | `if`/`else` e operadores lógicos |
| 3 | Intermediário | `for`/`while` e listas |
| 4 | Intermediário+ | Funções e `try`/`except` |
| Avançado | Avançado | Orientação a objetos e automação |

Tipos de exercício: múltipla escolha, preenchimento e ordenar o código. O progresso fica só no `localStorage` deste aparelho — sem conta, sem banco e sem nuvem.

## Como rodar localmente

Node 22+ e npm:

```bash
npm install
npm run dev
```

O servidor sobe em [http://127.0.0.1:43817](http://127.0.0.1:43817). No celular da mesma rede, use o IP da máquina na mesma porta.

Outros comandos:

```bash
npm test          # currículo, XP e desbloqueio
npm run build     # gera dist/ para GitHub Pages
npm run preview   # serve o build na mesma porta 43817
```

No iPhone, o Safari às vezes só libera a voz depois do primeiro toque na tela. Toque em **Ouvir** ou numa alternativa se o autoplay ficar mudo.

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
4. Cada push em `main` publica o app.

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

- `src/lib/lessons.ts` — currículo e correção
- `src/lib/progress.ts` — XP e desbloqueio no `localStorage`
- `src/lib/tts.ts` — Web Speech API em `pt-BR`, sem bloquear a UI
- `src/components/` — trilha, lição, estados vazio / carregando / erro
- `public/` — ícones PWA e `apple-touch-icon.png`

## Fora deste recorte

- Conta, nuvem ou multiplayer
- Outras linguagens além de Python
- App nativo iOS/Android (`.ipa` / `.apk`)
