# QA contínuo via Browserless

Teste automatizado do fluxo principal de análise de home office, rodando em
navegador **remoto** via Browserless. Não requer Chrome local — boa pra CI/cron.

## O que valida

O teste `homeoffice-analysis-flow.test.ts` simula um usuário real:

1. Abre `${APP_BASE_URL}/diagnostico` no Browserless remoto
2. Upload da imagem `tests/fixtures/setup-test.jpg`
3. Aguarda análise completar (até 90s — Gemini Vision)
4. Valida na DOM:
   - **Score geral** visível (nota /100 ou /10)
   - **Scores por categoria** (pelo menos 3 das 8)
   - **Touchpoints** (luminária, cortina, planta, estante, etc.)
   - **Estrutura do card** (evidência, problema, impacto, recomendação)
   - **Produtos recomendados** presentes
   - **Botão "Ver produto"** — se existir, clica e checa se chamou
     `track-product-click` OU abriu popup
5. Tira screenshot de sucesso em `tests/artifacts/homeoffice-analysis-result.png`
6. Em caso de falha: screenshot em `tests/artifacts/error-state.png`

## Setup

### 1. Pegar token Browserless

Cria conta em https://account.browserless.io → copia o **API Token**.
Plano free dá ~1k requests/mês, suficiente pra QA diário.

### 2. Variáveis de ambiente

Adiciona no `.env.local` (NÃO commitar):

```env
BROWSERLESS_TOKEN=seu_token_aqui
APP_BASE_URL=https://homeofficelife.com.br
# Opcional — só se o fluxo exigir login no futuro
TEST_USER_EMAIL=
TEST_USER_PASSWORD=
```

Se quiser testar contra preview/staging, troca `APP_BASE_URL` por
`https://gemini-touchpoints.vercel.app` ou Render preview URL.

### 3. Rodar

```bash
bun run test:browserless
```

Ou manualmente:

```bash
BROWSERLESS_TOKEN=xxx APP_BASE_URL=https://homeofficelife.com.br \
  bun run tests/browserless/homeoffice-analysis-flow.test.ts
```

## Output esperado

```
[INFO] connect_browserless: https://homeofficelife.com.br
[OK]   connect_browserless
[OK]   page_loaded: https://homeofficelife.com.br/diagnostico
[OK]   upload_via_dropzone: filechooser opened
[INFO] await_analysis: Esperando resultado aparecer (timeout 90s)
[OK]   analysis_complete: Indicator visível na DOM
[OK]   score_geral_visivel
[OK]   scores_por_categoria: 8/8 categorias presentes
[OK]   touchpoints_visiveis: 4 touchpoints: luminária, planta, cabos, cadeira
[OK]   estrutura_card_touchpoint: 4/4 labels do card visíveis
[OK]   produtos_recomendados_section
[OK]   ver_produto_btn_exists: 3 botões "Ver produto"
[OK]   tracking_ou_redirect: track-product-click chamado
[OK]   screenshot_success: tests/artifacts/homeoffice-analysis-result.png

===== RESUMO QA =====
Passou: 8 / Falhou: 0 / Total: 8
```

Exit code 0 = sucesso. Exit code 1 = falha. Exit code 2 = exception fatal.

## Onde ficam os screenshots

- `tests/artifacts/homeoffice-analysis-result.png` — screenshot da tela final
  quando o teste passa (mostra o resultado da análise)
- `tests/artifacts/error-state.png` — screenshot da tela no momento da falha
  (útil pra debug visual)

A pasta `tests/artifacts/` está no `.gitignore` (ou deveria estar) — não
commita screenshots, apenas o necessário pra reprodução.

## Como interpretar erros

| Erro | Causa provável | Fix |
|------|----------------|-----|
| `connect_browserless` falha | Token inválido ou cota esgotada | Verificar em account.browserless.io |
| `upload_completed: false` | Mudança no UI do input de upload | Inspecionar `/diagnostico` e ajustar seletores em `uploadTestImage()` |
| `analysis_timeout` | Edge function `analyze-setup` fora ou lenta demais | Verificar logs no Supabase dashboard |
| `score_geral_visivel: false` | Texto "nota" + número não encontrado | UI mudou — ajustar regex de detecção |
| `touchpoints_visiveis: 0` | Análise rodou mas não gerou touchpoint algum | Foto de teste muito pobre ou rules engine quebrado |

## Não-objetivos

- Browserless **não gera recomendações** — quem gera é Gemini/Claude
- Browserless **não substitui Vitest unit tests** — esse é E2E remoto
- Não usa dados reais sensíveis — fixture é `og-image.jpg` genérica

## Próximos passos (não implementado)

- Rodar via cron (GitHub Actions) 1x/dia
- Diff visual com Percy/Chromatic
- Suite expandida: galeria, marketplace, signup
- Login flow quando exigir auth
