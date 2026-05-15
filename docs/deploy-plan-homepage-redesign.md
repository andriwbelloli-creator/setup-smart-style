# Plano de deploy — Homepage redesign + IA generativa

> Doc canônico do pivot pra "Transforme seu home office com IA" com geração
> de imagens decoradas. Sequência de 5 ondas pra implementar sem quebrar
> produção. **Cada onda = 1 sessão Claude Code separada.**

## Contexto

- Handoff de design em `~/Downloads/design_handoff_homeofficelife_homepage/` (22 JSX + assets)
- Backend já tem `affiliate_providers` (28 lojas, 3 ativas) e migration de arquitetura aplicada
- Posicionamento: pivot pra geração visual + diagnóstico + recomendação
- Stack: TanStack Start (React 19) + Vite + Bun + Supabase + Render

---

## Onda 1 — Branch staging + design tokens (sem prod)

**Duração:** 30min · **Risco:** zero

- `git checkout -b feat/homepage-redesign-staging`
- Copia `design_handoff/prototype/*.jsx` → `src/components/landing/__new/`
- Converte JSX → TSX onde necessário
- Adiciona tokens CSS do handoff em `src/styles.css` (só adicionar, não substituir)
- `bun run build` tem que passar localmente
- **NÃO MERGEAR** — branch fica como referência viva

Saída: branch com componentes novos isolados, prod intacta.

---

## Onda 2 — Schema de IA (Supabase, só DB)

**Duração:** 15min · **Risco:** baixo

Migration nova (idempotente, padrão DO $$ EXCEPTION):

- `ai_generations` (image_url, style, prompt, model, cost_cents, user_id, status)
- `ai_styles` (slug, name, prompt_template, palette, budget_min, budget_max)
- `ai_diagnostics` (analysis_id, ambiente_valido, tipo, scores jsonb)
- Popular `affiliate_products` (já existe) com 30-50 produtos curados

Aplicar via SQL Editor: https://supabase.com/dashboard/project/icwgkbvwehkjmkuiecuj/sql/new

Frontend não toca em nada. Sem deploy de código.

---

## Onda 3 — Backend IA (edge functions atrás de feature flag)

**Duração:** 1h · **Risco:** baixo

Cria 5 edge functions, todas gated por `ENABLE_NEW_IA_FLOW=false`:

| Função | Papel |
|---|---|
| `validate-image` | Rejeita objeto isolado, valida 3+ elementos funcionais |
| `analyze-environment` | Diagnóstico estruturado em JSON |
| `generate-prompt` | Análise + estilo → prompt visual |
| `generate-image` | Chama OpenAI gpt-image-1 OU Replicate FLUX |
| `match-products` | Liga elementos gerados → `affiliate_products` |

Deploy: `bunx supabase functions deploy <name>` (já validado em sessões anteriores).

Configurar secrets em Supabase dashboard:
- `OPENAI_API_KEY`
- `REPLICATE_API_TOKEN`
- `ENABLE_NEW_IA_FLOW=false` (env var, não secret)

---

## Onda 4 — Nova homepage atrás de feature flag

**Duração:** 2h · **Risco:** médio

- Renomeia componentes atuais: `Hero.tsx` → `Hero.legacy.tsx`, etc
- Plug componentes de `__new/` em `src/routes/index.tsx`
- Feature flag por query string: `?new=1` mostra nova; padrão mostra legacy
- Antes de mergear: `@pre-deploy-regression captura baseline`
- Merge via GitHub UI (não automatizar)
- Aguarda Render deploy
- Testa `?new=1` em prod antes do flip

---

## Onda 5 — Flip da feature flag

**Duração:** 10min · **Risco:** alto (visível pra todos)

- Liga `ENABLE_NEW_IA_FLOW=true` no Render (env var)
- Monitora eventos no admin:
  - `generation_started`
  - `generation_failed`
  - `affiliate_product_clicked`
- Se taxa de erro > 5% em 1h, desliga a flag (revert sem deploy)

---

## Checklist universal por onda

| Etapa | Comando/local |
|---|---|
| Captura baseline | `@pre-deploy-regression` |
| Build local | `bun run build` |
| Smoke dev | `bun dev` → testar fluxo |
| PR + merge | GitHub UI |
| Render deploy | https://dashboard.render.com/web/srv-d80ufggg4nts7390eolg/deploys |
| Smoke prod | `@browserless-runner smoke` |

---

## Erros conhecidos a evitar

| Erro | Mitigação |
|---|---|
| Migration via `db push` (conflito de history) | Sempre SQL Editor com idempotência |
| Branches empilhadas geram merges duplicados | 1 branch = 1 PR = 1 onda |
| Arquivo somindo entre merges | Pós-merge: `grep -l <component> src/` |
| GitHub API timeout | Chrome real, não `gh` CLI |
| Componente substituído sem flag | Sempre feature flag ou `.legacy.tsx` wrapper |
| Imagem de produto isolado vira "setup" | `validate-image` rejeita |

---

## Custos esperados de IA

- OpenAI gpt-image-1: ~$0.04/imagem (alta qualidade, default)
- Replicate FLUX schnell: ~$0.003/imagem (fallback/free tier)
- Gemini 2.5 Flash diagnóstico: ~$0.0001/análise

Free tier suporta 1-3 gerações grátis com FLUX schnell + 1 com gpt-image-1.
Pro R$9,90/mês: ~10-15 gerações com gpt-image-1 + ilimitado FLUX.

---

## Como começar

1. Encerra a sessão atual (contexto está cheio)
2. Abre nova sessão Claude Code (Sonnet 4.6 pra economizar)
3. Cola só o conteúdo de **Onda 1** do plano
4. Não tente rodar múltiplas ondas em uma sessão

Documentos relacionados:
- `docs/strategy-consolidated.md` (estratégia de produto)
- `.claude/skills/homeofficelife-design/audit-prompt.md` (auditoria E2E)
- `.claude/skills/homeofficelife-design/product-rules.md` (regras problema → produto)
- `.claude/skills/homeofficelife-design/mobile-ux.md` (wireframes mobile)
- `.claude/agents/pre-deploy-regression.md` (sub-agente de regressão)
