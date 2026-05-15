# HomeOfficeLife — Project Guide for Claude Code

This is the **HomeOfficeLife** (setup-smart-style) repo — a Brazilian platform that helps remote workers set up, evaluate, and improve their home office.

- **Domain:** `homeofficelife.com.br`
- **Stack:** TanStack Start (React 19) + Vite + Bun + Supabase (project ref `icwgkbvwehkjmkuiecuj`)
- **Runtime:** `bun` at `~/.bun/bin/bun` — no npm/node
- **Dev:** `bun dev` on port 8080
- **Build:** `bun run build`
- **Deploy:** Render (auto-deploy from `main` branch). PR + squash merge flow.

## Quick context

| Surface | Route | Purpose |
|---|---|---|
| Home | `/` | Landing + Hero with AI diagnosis dropzone |
| Diagnóstico IA | `/diagnostico` | Upload setup photo → 0-10 score + tips (Gemini 2.5 Pro) |
| Galeria | `/galeria` | Curated home office photos by category |
| Loja | `/marketplace` | C2C marketplace de usados (URL é `/marketplace`, label visível é "Loja") |
| Kits | `/kits` | Curated shopping lists com links afiliados |
| Premium | `/premium` | R$ 9,90/mês — análises ilimitadas |

## Design System — HomeOfficeLife

Sempre use o skill em `.claude/skills/homeofficelife-design/` para qualquer tarefa de UI, design ou front-end.

### Antes de criar qualquer interface:
1. Leia o `README.md` do skill (contexto do produto, tom de voz, visual foundations)
2. Use os tokens de `colors_and_type.css` (cores, tipografia, espaçamento, sombras, gradientes)
3. Copie assets de `assets/` (logo, fotos, ícones)
4. Referência os componentes em `preview/` e `ui_kits/` como base visual
5. **Antes de qualquer tela com diagnóstico, produtos, kits ou galeria, leia `product-rules.md`** — mapa obrigatório problema → produto
6. **Antes de qualquer ajuste mobile (web ou PWA), leia `mobile-ux.md`** — wireframes ASCII, bottom nav, touch targets, regras P1-P4
7. **Antes de seedar setups novos ou exemplos, consulte `setups-referencia.md`** — 30 setups curados com touchpoints corretos e produtos válidos por perfil

### Regras visuais obrigatórias:
- Background: cream `#FBF8F1`, nunca branco puro
- Primary: deep teal (oklch 0.42 0.07 195)
- Accent: coral `#F36458` — só para IA e momentos premium
- Títulos: Space Grotesk 700, letter-spacing `-0.025em`
- Corpo: DM Sans 400/500/600/700
- Ícones: Lucide (stroke 2, currentColor)
- Cards: `rounded-3xl`, border 1px, `shadow-soft`, `hover:-translate-y-1`
- Corners generosos: base `1rem`, nunca cantos retos
- Sombras com tinta teal, nunca preto puro
- Dark mode: ativar com `class="dark"` no html/body

### Tom de voz (PT-BR):
- Direto, brasileiro, forma "você"
- Verbos imperativos: "Avalie", "Descubra", "Melhore"
- Números concretos: "3 análises grátis", "em 30 segundos", "R$ 4,90/mês"
- Sem jargão SaaS em inglês
- Emoji só: ✨ (IA) e 🔥 (trending)

### Pricing:
- Gratuito **R$ 0** | Premium **R$ 4,90/mês** | Pro **R$ 9,90/mês**
- Badge: "Preço especial de lançamento"

### Validação de setups — OBRIGATÓRIO:

**A galeria existe pra inspirar ambientes completos, NÃO pra ser vitrine de produtos.**

Critério mínimo pra uma imagem aparecer na galeria, cards, exemplos, kits, hero ou categorias:
- Ambiente de trabalho montado, com **contexto real de uso**
- **Mínimo 3 elementos funcionais** combinados na mesma cena
- Tem que permitir análise de ergonomia, iluminação, organização, cabos, produtividade e conforto

**Excluir SEMPRE** (proibido em qualquer surface da galeria):
- Apenas uma cadeira, mesa, monitor, notebook, luminária, teclado, mouse, suporte, webcam, microfone, prateleira ou organizador de cabos
- Qualquer objeto decorativo ou peça de mobiliário **isolada**
- Produto único em **fundo branco** (cara de catálogo / e-commerce)
- Imagens que pareçam anúncio de item único

**Exemplos válidos:**
- Mesa + cadeira + notebook
- Mesa + cadeira + monitor
- Notebook + suporte + teclado + mouse
- Monitor + teclado + mouse + cadeira
- Mesa + iluminação + notebook + organização de cabos
- Setup de videochamada com câmera + iluminação + mesa + cadeira

Aplicar em: **galeria** (`/galeria`, `/categorias`), **cards** (`SetupCard`, `MarketplaceSection`), **hero** (Hero da home), **kits** (`/kits`), **categorias**, **exemplos da IA** (mockup do score panel), **previews sociais** (OG image).

### Não fazer:
- Não usar gradientes azul-roxo
- Não usar emoji como ícone
- Não usar cards com borda-esquerda colorida
- Não inventar SVGs — usar Lucide ou placeholders
- Não usar cinza frio — neutrals têm subtom teal
- Não recomendar produto sem problema detectado pela IA (vide `product-rules.md`)

### Logo
Componente canônico: `<Logo>` em `src/components/brand/Logo.tsx`. Lockup: `homeoffice` (700) + `life` (500). Fontes Space Grotesk + DM Sans já carregadas via `@fontsource`.

## Convenções do projeto

- **Memória do user** (Andriw) está em `~/.claude/projects/-Users-andriwbelloli/memory/` — consulte se precisar de contexto histórico.
- **Push direto em `main` está bloqueado.** Sempre cria `feat/<nome>` + PR squash merge.
- **`gh` CLI** está em `~/.local/bin/gh`, autenticado como `andriwbelloli-creator`.
- **Modo autônomo:** age sem confirmar pra tarefas locais (commits, push em feat, edits). Pausa só pra operações destrutivas em produção (DELETE em DB, force push em main, mudar config de auth do Supabase, criar conta com credenciais reais).
- **Sub-agentes disponíveis** em `.claude/agents/`:
  - `browserless-runner` — roda testes QA Browserless + auto-fix.

## Affiliate flow

- Produtos curados (file-only, ids 27+) usam `affiliateUrl` direta com tag Amazon BR `deskly02-20`, Mercado Livre `belloliandriw`, Magalu canal `magazinedesklylife`.
- Produtos seedados no DB (ids 1-26) usam cloaked redirect `/r/<productId>` que start.js resolve via Supabase.
- A função `affiliateHref(p)` em `src/lib/affiliate.ts` lida com ambos os casos automaticamente.

## Pra mudanças de UI/design

Antes de criar/editar componentes:

1. Procura no `.claude/skills/homeofficelife-design/ui_kits/` se já existe equivalente.
2. Roda o preview HTML em `.claude/skills/homeofficelife-design/preview/` pra ver o componente isolado.
3. Reutiliza tokens do `colors_and_type.css` (já estão sincronizados com `src/styles.css`).
4. Mantém compatibilidade mobile-first (Tailwind breakpoints `sm:` / `md:` / `lg:`).

## Não fazer

- ❌ Push direto em `main`
- ❌ Mexer em `package.json` dependencies sem motivo claro
- ❌ Adicionar cor fora da paleta brand sem aprovação
- ❌ Quebrar URLs públicas (`/marketplace`, `/setup/<slug>`, `/diagnostico`, etc) — SEO importa
- ❌ Renomear tabelas Supabase (migrations destrutivas)
- ❌ Comitar `.env*`, `.claude/launch.json`, `.claude/settings.local.json` (já no `.gitignore`)
