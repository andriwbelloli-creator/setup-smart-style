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

## Diretivas de design

**Sempre que estiver criando ou ajustando UI, slides, mocks, prototypes, landing pages ou produção de visual:**

1. **Use a skill `homeofficelife-design`** em `.claude/skills/homeofficelife-design/`. Lê o `README.md` dela primeiro.
2. Cores oficiais: teal `#0E3D3F` (primary), coral `#F36458` (accent), cream `#F7F5F0` (background neutro). Não inventar paleta.
3. Tipografia: Space Grotesk (display) + DM Sans (body). Já carregadas via `@fontsource`.
4. Logo: `homeoffice` + `life` em peso mais leve. Use o componente `<Logo>` em `src/components/brand/Logo.tsx`.

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
