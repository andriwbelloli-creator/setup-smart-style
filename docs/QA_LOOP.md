# QA Loop — sistema autônomo + autocorreção

Sistema de QA contínuo com autocorreção limitada para o **HomeOffice.life**. Combina:

- **Browserless + Playwright** — executa fluxo real em navegador remoto
- **Gemini Vision** *(opt-in)* — avalia screenshots
- **Claude Sonnet 4.6** *(opt-in)* — avalia qualidade dos touchpoints
- **Claude Code** *(sessão Claude separada)* — corrige bugs seguros

> **Princípio:** automatizar o máximo possível com rastreabilidade e prevenção de regressões. **Nunca** correções infinitas, inseguras ou sem evidência.

## Modos de execução

| Comando | Quando | O que faz |
|---------|--------|-----------|
| `npm run qa:smoke` | A cada deploy / desenvolvimento ativo | Valida app abre, upload, análise inicia, score aparece, screenshot |
| `npm run qa:full` | Diário (cron 08:00 UTC) | Smoke + mobile + Product Matching + tracking |
| `npm run qa:mobile` | Sob demanda / quando tocar layout | Só fluxo mobile (iPhone 14 Pro) |
| `npm run qa:products` | Quando mexer no Product Matching | Valida links, affiliate prioritário, tracking, anti open-redirect |
| `npm run qa:regression` | Semanal (cron domingo 03:00 UTC) | Roda os 30 setups de `tests/fixtures/reference-setups.json` |
| `npm run qa:auto-fix` | Após qa:full ou qa:regression | Lê qa-result.json e gera auto-fix-report.json com plano de correção |
| `npm run qa:all` | CI/CD completo | smoke + mobile + products em sequência |

## Setup

### 1. Token Browserless
https://account.browserless.io → copia o token (free dá 1k req/mês — suficiente pra rodar smoke 4×/h durante o dia).

### 2. .env.local
```env
BROWSERLESS_TOKEN=
APP_BASE_URL=https://homeofficelife.com.br
QA_MAX_RETRIES=3
QA_AUTO_FIX_ENABLED=true
QA_ALLOW_SAFE_FIXES_ONLY=true
QA_RUN_MODE=smoke
# Opcionais
TEST_USER_EMAIL=
TEST_USER_PASSWORD=
GEMINI_API_KEY=    # pra qa:auto-fix usar Gemini visual review
ANTHROPIC_API_KEY= # pra qa:auto-fix usar Claude quality review
```

### 3. Rodar
```bash
bun install
bun run qa:smoke
```

## Schema de `qa-result.json`

Cada run gera 1 arquivo. Schema completo:

```json
{
  "status": "passed | failed",
  "timestamp": "ISO8601",
  "run_id": "run_<timestamp>_<random>",
  "mode": "smoke | full | regression | post_deploy",
  "attempt": 1,
  "max_attempts": 3,
  "app_base_url": "...",
  "errors": [
    {
      "id": "abc123def456",
      "step": "score_visible",
      "message": "Score geral não aparece",
      "severity": "critical | high | medium | low",
      "category": "frontend | backend | supabase | ai | product_matching | tracking | visual | content | security | performance",
      "screenshot": "tests/artifacts/error-state.png",
      "log_excerpt": "Console error: Cannot read property 'overall_score' of undefined",
      "probable_cause": "Resposta da edge function chegou sem campo overall_score",
      "suggested_owner": "browserless | gemini_vision | claude_quality | claude_code | supabase",
      "auto_fix_allowed": true,
      "auto_fix_reason": "Render de score é fix isolado"
    }
  ],
  "checks": {
    "app_opened": true,
    "login_worked": true,
    "upload_worked": true,
    "analysis_started": true,
    "loading_visible": true,
    "analysis_returned": true,
    "score_visible": true,
    "category_scores_visible": true,
    "touchpoints_visible": true,
    "touchpoints_have_visual_evidence": true,
    "touchpoints_have_problem_impact_recommendation": true,
    "products_visible_when_available": true,
    "product_buttons_visible": true,
    "product_click_tracking_worked": true,
    "affiliate_links_from_supabase": true,
    "no_ai_generated_links": true,
    "desktop_layout_ok": true,
    "mobile_layout_ok": true,
    "error_state_ok": true
  },
  "screenshots": {
    "desktop_result": "tests/artifacts/homeoffice-analysis-result.png",
    "mobile_result": "tests/artifacts/mobile-result.png",
    "error_state": "tests/artifacts/error-state.png"
  },
  "summary": "✅ 19/19 checks passaram."
}
```

## Schema de `auto-fix-report.json`

Gerado por `npm run qa:auto-fix` após análise de `qa-result.json`:

```json
{
  "run_id": "run_xxx",
  "timestamp": "ISO8601",
  "status": "fixed | partially_fixed | failed | skipped",
  "attempts": 0,
  "max_attempts": 3,
  "fixes_applied": [
    {
      "error_id": "abc123",
      "severity": "high",
      "category": "frontend",
      "files_changed": ["src/routes/diagnostico.resultado.$id.tsx"],
      "description": "Adicionado fallback pra overall_score quando undefined",
      "reason": "Render de score é fix isolado (auto_fix_allowed=true)",
      "risk_level": "low",
      "tests_rerun": ["qa:smoke"],
      "result_after_fix": "passed"
    }
  ],
  "skipped_fixes": [
    {
      "error_id": "def456",
      "reason": "auto_fix_allowed=false — exige revisão humana",
      "requires_human_review": true
    }
  ],
  "remaining_errors": [],
  "final_recommendation": "Todos os fixes aplicados com sucesso. Pronto pra deploy."
}
```

## Severidade — guia de bolso

| Nível | Critério | Owner típico | Auto-fix? |
|-------|----------|--------------|-----------|
| **critical** | App não abre, upload falha, análise não retorna, IA inventou link, open redirect | `claude_code` / `supabase` | Maioria **não** (segurança) |
| **high** | Score ausente, touchpoints sem evidência, produto inativo aparece, mobile quebra | varia | Frontend isolado **sim**, IA/RLS **não** |
| **medium** | Layout misalign, texto cortado, loading confuso | `gemini_vision` | **Sim** se for CSS isolado |
| **low** | Copy fraca, polish | `claude_quality` | **Sim** |

Detalhes completos: ver [QA_SEVERITY_GUIDE.md](QA_SEVERITY_GUIDE.md).

## Fluxo de autocorreção

```
1. npm run qa:smoke
2. Browserless executa → qa-result.json gerado
3. Se status=passed → fim
4. Se status=failed:
   a. npm run qa:auto-fix lê qa-result.json
   b. Filtra erros com auto_fix_allowed=true
   c. Ordena por severity (critical > high > medium > low)
   d. Limita a 5 fixes/rodada (anti-loop)
   e. Gera auto-fix-report.json com plano:
      - fixes_applied: o que sugere mudar + arquivo
      - skipped_fixes: o que não pode (com reason)
      - remaining_errors: o que sobrou
5. Sessão Claude Code separada lê auto-fix-report.json
6. Aplica as mudanças sugeridas (não automaticamente — Claude Code revisa)
7. Roda qa:smoke novamente
8. Se passou → registra commit
9. Se falhou e attempt < QA_MAX_RETRIES → volta pro passo 5
10. Se persistir após 3 tentativas → documenta bloqueio em QA_LOOP.md
```

> **Importante:** `qa:auto-fix` **NÃO aplica código** — só gera o plano em `auto-fix-report.json`. A aplicação real do fix exige uma sessão de Claude Code (humano ou automatizado via Agent SDK).

## Anti-loop (segurança)

| Regra | Implementação |
|-------|---------------|
| Max 3 tentativas por erro | `QA_MAX_RETRIES=3` + check do `error_id` repetido |
| Max 5 fixes por rodada | Hardcoded no `auto-fix-runner.ts` |
| Mesmo arquivo max 3× | Tracking interno por run |
| Nunca remover testes pra passar | `auto_fix_allowed=false` pra erros que envolvam tests files |
| Nunca alterar segurança | RLS, auth, env vars: `auto_fix_allowed=false` |
| Rollback se regressão critical | Auto-fix script verifica que critical não foi introduzido |

## Adicionar novo teste

1. Cria `tests/browserless/seu-fluxo.test.ts` reutilizando `runFlow()` de `homeoffice-analysis-flow.test.ts`
2. Adiciona script no `package.json`:
   ```json
   "qa:seu-fluxo": "bun run tests/browserless/seu-fluxo.test.ts"
   ```
3. Adiciona checks novos em `tests/browserless/lib/reporter.ts` (`QAChecks` type)
4. Adiciona regras novas em `tests/browserless/lib/severity.ts` (`ERRORS` map)
5. Atualiza este doc com a nova linha na tabela de modos

## CI/CD (próximo)

Pra rodar automaticamente em GitHub Actions:

```yaml
# .github/workflows/qa-loop.yml
name: QA Loop
on:
  schedule:
    - cron: "0 8 * * *"      # qa:full diário
    - cron: "0 3 * * 0"      # qa:regression semanal (domingo)
  workflow_dispatch:
    inputs:
      mode: { default: "smoke", type: string }
jobs:
  qa:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bun run qa:${{ github.event.inputs.mode || 'smoke' }}
        env:
          BROWSERLESS_TOKEN: ${{ secrets.BROWSERLESS_TOKEN }}
          APP_BASE_URL: https://homeofficelife.com.br
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: qa-${{ github.run_id }}
          path: tests/artifacts/
```

## Bloqueios persistentes

*Adicionar aqui quando um erro persistir 3× sem fix possível.*

Nenhum no momento.
