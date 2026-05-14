# QA Loop — Browserless + Playwright + IA

Ciclo de QA contínuo e controlado pro HomeOffice.life. Combina:

- **Browserless** — navegador headless remoto via WebSocket
- **Playwright** — orquestra navegação e asserções
- **Gemini Vision** *(opcional)* — avalia screenshots
- **Claude Sonnet** *(opcional)* — avalia qualidade dos touchpoints
- **Claude Code (você)** — recebe `qa-result.json` e corrige

## Princípios

1. **Loop controlado.** Máximo `QA_MAX_RETRIES=3` tentativas por rodada.
2. **Não cega.** Sempre gera `qa-result.json` com checks + erros + screenshots.
3. **Prioriza severidade.** Corrige critical → high → medium → low.
4. **Não refatora pra resolver bug pontual.** Não toca em fluxo que passou.
5. **Hooks de IA isolados.** Gemini/Claude rodam sob demanda, não automático.

## Setup

### 1. Token Browserless
Cria conta em https://account.browserless.io → copia o API Token (plano free dá ~1k req/mês).

### 2. Variáveis de ambiente
Adiciona ao `.env.local` (não commitar):

```env
BROWSERLESS_TOKEN=seu_token
APP_BASE_URL=https://homeofficelife.com.br
QA_MAX_RETRIES=3
# Opcional — se o fluxo exigir login
TEST_USER_EMAIL=
TEST_USER_PASSWORD=
# Opcional — pra hooks de IA rodarem
GEMINI_API_KEY=...
ANTHROPIC_API_KEY=...
```

### 3. Rodar
```bash
bun run test:browserless
```

## Arquivos gerados

| Path | Conteúdo |
|------|----------|
| `tests/artifacts/qa-result.json` | Schema completo: status, erros, checks, screenshots |
| `tests/artifacts/homeoffice-analysis-result.png` | Screenshot final desktop |
| `tests/artifacts/mobile-result.png` | Screenshot final mobile |
| `tests/artifacts/error-state.png` | Screenshot no momento da falha (só se falhou) |

## Schema do `qa-result.json`

```json
{
  "status": "passed | failed",
  "timestamp": "ISO 8601",
  "attempt": 1,
  "max_attempts": 3,
  "app_base_url": "https://homeofficelife.com.br",
  "errors": [
    {
      "step": "score_visible",
      "message": "Score geral não aparece",
      "screenshot": "tests/artifacts/error-state.png",
      "severity": "critical | high | medium | low",
      "suggested_owner": "browserless | gemini_vision | claude_quality | claude_code | supabase"
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
    "desktop_layout_ok": true,
    "mobile_layout_ok": true
  },
  "screenshots": { "desktop_result": "...", "mobile_result": "...", "error_state": "..." },
  "summary": "✅ 16/16 checks passaram. Sem erros."
}
```

## Severidades

| Nível | Critério | Owner típico |
|-------|----------|--------------|
| **critical** | App não abre, upload falha, análise não retorna, edge function 500, tela quebra | `claude_code`, `supabase` |
| **high** | Score/touchpoints faltam, produto recomendado sem botão, tracking falha | `claude_quality`, `supabase`, `claude_code` |
| **medium** | Layout misaligned, texto cortado, mobile espaçamento, loading confuso | `gemini_vision`, `claude_quality` |
| **low** | Copy refinement, espaçamento leve, ordem de cards | `claude_quality`, `gemini_vision` |

## Quem corrige o quê (owner suggestion)

- **`browserless`** — selectors mudaram, timing issue, drop zone diferente.
  → Ajusta `uploadTestImage` ou seletores no test file.
- **`gemini_vision`** — algo visual quebrado mas funcional. Roda `lib/gemini-vision.ts` sobre o screenshot e devolve sugestões.
  → Aplica os fixes via Claude Code.
- **`claude_quality`** — touchpoint inventado, prioridade fraca, copy ruim, recomendação comercial forçada. Roda `lib/claude-quality.ts` sobre o JSON da análise.
  → Ajusta rules engine em `supabase/functions/_shared/touchpoint-rules.ts`.
- **`claude_code`** — bug puro de código (TypeScript, lógica, integração).
  → Eu corrijo o arquivo afetado.
- **`supabase`** — RLS, migration, edge function, env var.
  → Ajusta migration ou edge function + redeploy.

## Regras de correção (ordem obrigatória)

1. **Corrigir critical primeiro.** Bloqueia produto.
2. **Depois high.** Degrada experiência mas usável.
3. **Depois medium.** UX afetada.
4. **Low só se não houver superior.** Cosmetic, baixo retorno.

Após cada correção:
- Re-rode `bun run test:browserless`
- Compare `attempt` no `qa-result.json` (incrementa via `QA_ATTEMPT` env var se quiser)
- Se mesmo erro persistir 3×, **documenta bloqueio** em `QA_LOOP.md` (seção "Bloqueios conhecidos") e escala.

## Evitar regressão

- **Não tocar em check que já passou.** Se `score_visible: true`, não mexe no componente do score.
- **Não refatora amplo.** Bug pontual = fix pontual.
- **Não muda arquitetura.** Se a solução exige refactor estrutural, abrir issue separada.

## Hooks de IA (rodar sob demanda)

### Gemini Vision sobre screenshot
```typescript
import { evaluateScreenshot } from "./lib/gemini-vision";
const visionReport = await evaluateScreenshot("tests/artifacts/homeoffice-analysis-result.png");
// → { visual_score, issues: [{ area, problem, severity, suggested_fix }], summary }
```

### Claude sobre qualidade do diagnóstico
```typescript
import { evaluateAnalysis } from "./lib/claude-quality";
const qualityReport = await evaluateAnalysis(jsonDaAnalise);
// → { quality_score, invalid_touchpoints, weak_touchpoints, strong_touchpoints, recommended_changes }
```

Ambos retornam `null` se as API keys não estiverem configuradas — sem ruído.

## Validação especializada — touchpoints

O teste valida que os 10 touchpoints prioritários, **quando aparecem**, têm a estrutura completa (evidência + problema + impacto + recomendação + prioridade + confiança):

- cortina, planta, luminária, papel de parede, estante
- organizador de cabos, suporte de notebook, monitor
- tapete, webcam/microfone

**Não exige que todos apareçam em uma foto.** Cada touchpoint só deve aparecer se há sinal visual:
- Cortina → janela + (excesso de luz OU reflexo)
- Planta → ambiente frio/vazio
- Luminária → baixa iluminação
- Papel de parede → parede vazia + ambiente sem personalidade
- Estante → fundo vazio + falta de armazenamento
- Cabos → cabos visíveis
- Suporte notebook → notebook + sem suporte + baixa ergonomia
- Monitor → notebook + sem monitor + perfil que se beneficia
- Tapete → problema acústico ou ambiente vazio
- Webcam/mic → perfil com chamadas/aulas + sem áudio/vídeo adequado

Se um touchpoint aparece **sem evidência visual válida**, o erro vai como `touchpoint_no_evidence` (severity: high, owner: claude_quality) — sinal de IA inventando.

## Validação especializada — Product Matching

O fluxo verifica que:
1. Produto vem do Supabase (não inventado pela IA)
2. Sem `product_url` ou `affiliate_url` válido = não aparece
3. Produto inativo (`active=false`) = não aparece
4. Click no botão "Ver produto" chama `track-product-click` no backend
5. Backend resolve URL real (anti open-redirect)
6. Frontend NÃO confia em URL arbitrária

Se algum desses quebra, o erro vai com `severity: high` e owner apropriado (`supabase` pro backend, `claude_code` pro frontend).

## Como adicionar novos testes

Crie outros arquivos `.test.ts` em `tests/browserless/`:

```typescript
// tests/browserless/galeria-flow.test.ts
import { config } from "./browserless.config";
import { writeResult } from "./lib/reporter";
// ... reusa as primitives
```

Adiciona script no `package.json`:
```json
"test:browserless:galeria": "bun run tests/browserless/galeria-flow.test.ts"
```

## CI/CD futuro

Pra rodar em GitHub Actions:

```yaml
# .github/workflows/qa.yml (exemplo, não criado ainda)
name: QA Browserless
on:
  schedule: [{ cron: "0 8 * * *" }]    # 1× por dia 8h UTC
  workflow_dispatch: {}
jobs:
  qa:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bun run test:browserless
        env:
          BROWSERLESS_TOKEN: ${{ secrets.BROWSERLESS_TOKEN }}
          APP_BASE_URL: https://homeofficelife.com.br
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: qa-artifacts
          path: tests/artifacts/
```

## Bloqueios conhecidos

*(Adicionar aqui quando algum erro persistir 3× sem correção possível)*

Nenhum no momento.
