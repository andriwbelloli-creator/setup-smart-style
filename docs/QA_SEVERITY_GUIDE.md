# Guia de Severidade — QA

Como classificar erros no `qa-result.json`. Cada severidade implica um SLA implícito e nível de auto-fix.

## Critical 🚨

**Bloqueia o produto.** Usuário não consegue completar a jornada principal. Quebra monetização ou segurança.

| Sintoma | Categoria | Owner típico |
|---------|-----------|--------------|
| App não abre / 5xx na home | frontend | claude_code |
| Login impede todo o fluxo | security | **humano** |
| Upload de imagem falha | frontend | browserless / claude_code |
| Análise não inicia após upload | frontend / backend | claude_code |
| Análise nunca retorna (timeout) | backend | supabase |
| Edge function 500 | backend | supabase |
| Tela de resultado quebra (JSX error) | frontend | claude_code |
| **IA inventou hyperlink** | security | **humano** |
| Frontend força destination_url | security | **humano** |
| API key exposta no bundle | security | **humano** |
| Erro impede monetização | varia | claude_code / supabase |

**SLA:** correção em < 1h. Auto-fix permitido só pra problemas frontend isolados. Segurança sempre humana.

## High ⚠️

**Degrada feature significativamente.** Usuário consegue completar parte do fluxo, mas perde valor.

| Sintoma | Categoria | Owner típico |
|---------|-----------|--------------|
| Score geral não aparece | frontend | claude_code |
| Scores por categoria ausentes | frontend | claude_code |
| Touchpoints não aparecem | ai | claude_quality |
| Touchpoint sem evidência visual | ai | claude_quality |
| Touchpoint sem problema/impacto/recomendação | ai | claude_quality |
| Produtos esperados não aparecem | product_matching | supabase |
| Botão "Ver produto" não funciona | frontend | claude_code |
| Tracking de clique falha | tracking | supabase |
| `affiliate_url` não prioritizada | product_matching | claude_code |
| Produto inativo aparece | product_matching | claude_code |
| Mobile quebra fluxo principal | frontend | claude_code |

**SLA:** correção em < 24h. Auto-fix permitido pra fixes isolados de frontend / lógica de resolver.

## Medium 🟡

**UX afetada mas usável.** Usuário completa o fluxo, mas experiência fica pior que ideal.

| Sintoma | Categoria | Owner típico |
|---------|-----------|--------------|
| Layout desalinhado | visual | gemini_vision |
| Texto cortado / truncado | visual | gemini_vision |
| Loading confuso | content | claude_quality |
| CTA pouco claro | content | claude_quality |
| Cards densos demais | visual | gemini_vision |
| Hierarquia visual ruim | visual | gemini_vision |
| Mobile com espaçamento ruim | visual | gemini_vision |
| Produto sem `reason` | content | claude_quality |
| Touchpoint com `confidence` incoerente | ai | claude_quality |

**SLA:** correção em < 1 semana. Auto-fix livre pra CSS isolado e copy refinement.

## Low 🟢

**Cosmético.** Não afeta funcionalidade. Polish.

| Sintoma | Categoria | Owner típico |
|---------|-----------|--------------|
| Copy pouco refinada | content | claude_quality |
| Espaçamento leve | visual | gemini_vision |
| Ordem dos cards | content | claude_quality |
| Microajustes visuais | visual | gemini_vision |
| Melhoria estética sem impacto funcional | visual | gemini_vision |

**SLA:** quando der. Auto-fix livre.

## Owner mapping — quem corrige o quê

### `claude_code`
Bug puro de código: TypeScript, lógica, integração, render React, edge function (lógica), CSS.
- **Recebe:** `qa-result.json`, screenshot, log_excerpt
- **Faz:** edita arquivo afetado, roda teste, commita

### `supabase`
RLS, migration, edge function (env / deploy / quota), tracking persistence.
- **Recebe:** error com category `backend`, `tracking`, `product_matching`
- **Faz:** humano revisa via Supabase dashboard ou SQL editor

### `claude_quality`
Touchpoint inventado, copy fraca, prioridade ruim, recomendação comercial forçada.
- **Recebe:** JSON da análise (não screenshot)
- **Faz:** chamada à API Claude com prompt de qualidade → `claude-quality-review.json` → humano ajusta rules engine / prompts

### `gemini_vision`
Algo visual quebrado que precisa de "olho humano" (mas vamos usar Gemini Vision em vez do humano).
- **Recebe:** screenshot
- **Faz:** chamada à API Gemini com prompt de QA visual → `gemini-visual-review.json` → humano/Claude Code aplica fixes

### `browserless`
Selector mudou, timing issue, drop zone diferente — bug no próprio teste, não no produto.
- **Recebe:** error com `category: frontend` e step relacionado a interação browserless
- **Faz:** ajusta `uploadTestImage()`, seletores, timeouts no test file

### `humano`
Tudo que envolve segurança, autenticação, política RLS, dados sensíveis, mudança de arquitetura.
- **Recebe:** error com `auto_fix_allowed: false` e categoria `security`
- **Faz:** revisa, decide, aprova ou rejeita

## Categorias

| Categoria | Significa |
|-----------|-----------|
| `frontend` | React, TypeScript, CSS, routing |
| `backend` | Edge function, business logic, integration |
| `supabase` | RLS, migration, storage, auth |
| `ai` | Gemini/Claude output, rules engine, prompts |
| `product_matching` | Catálogo, matching service, ranking |
| `tracking` | impressions, clicks, analytics_events |
| `visual` | Layout, hierarquia, spacing, typography |
| `content` | Copy, tradução, microcopy, loading texts |
| `security` | Auth, RLS, env vars, open redirect, XSS |
| `performance` | LCP, TTI, bundle size, render time |

## Diagramas de decisão

### "É auto-fixable?"
```
auto_fix_allowed === true
  ↓
risk_level <= medium
  ↓
≤ 5 fixes nesta rodada
  ↓
arquivo modificado < 3 vezes neste run
  ↓
✅ Auto-fix
```

### "Quem é o owner?"
```
É de segurança (auth, RLS, redirect, key)?
  → humano (revisar manualmente)

Touchpoint inventado/fraco?
  → claude_quality (re-prompt + rules engine)

Algo visual quebrado (CSS, layout)?
  → gemini_vision (review + suggestion)

Selector/timing no teste?
  → browserless (ajustar test file)

500 / RLS / migration?
  → supabase (humano via dashboard)

Tudo mais?
  → claude_code
```

## Exemplos práticos

### Exemplo 1: erro crítico de segurança
```json
{
  "id": "x7g8h2",
  "severity": "critical",
  "category": "security",
  "step": "no_ai_generated_links",
  "message": "Frontend força destination_url",
  "suggested_owner": "claude_code",
  "auto_fix_allowed": false,
  "auto_fix_reason": "Open redirect é vulnerabilidade — exige revisão humana"
}
```
→ Pra `skipped_fixes`, abre issue, **humano revisa**.

### Exemplo 2: bug isolado de render
```json
{
  "id": "p3k4m9",
  "severity": "high",
  "category": "frontend",
  "step": "score_visible",
  "message": "Score geral não aparece",
  "probable_cause": "Componente acessa data.overall_score que pode ser undefined",
  "suggested_owner": "claude_code",
  "auto_fix_allowed": true,
  "auto_fix_reason": "Render de score é fix isolado"
}
```
→ Auto-fix aplica `data?.overall_score ?? null` check no componente. Roda teste. Commit.

### Exemplo 3: layout mobile
```json
{
  "id": "m9w2k0",
  "severity": "medium",
  "category": "visual",
  "step": "mobile_layout_ok",
  "message": "Mobile layout problema: horizontal overflow",
  "suggested_owner": "gemini_vision",
  "auto_fix_allowed": true,
  "auto_fix_reason": "Mobile layout fix via Tailwind breakpoints é seguro"
}
```
→ Gemini Vision avalia screenshot → suggested_fix descreve qual elemento overflow → claude_code aplica `md:` breakpoint apropriado.
