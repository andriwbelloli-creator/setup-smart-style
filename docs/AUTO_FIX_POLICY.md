# Auto-Fix Policy

Política de autocorreção pelo Claude Code no QA Loop do HomeOffice.life.

## Filosofia

**Velocidade controlada, não autonomia cega.** Permitir Claude Code corrigir bugs óbvios e isolados, mas **nunca** mudanças que afetem segurança, dados, arquitetura ou monetização.

## ✅ Correções permitidas automaticamente

Marcadas com `auto_fix_allowed: true` no catálogo de erros (`tests/browserless/lib/severity.ts`):

### Frontend isolado
- Erro de renderização React (undefined access, null check faltando)
- Tipo TypeScript divergente
- Fallback ausente em loading state
- Parsing de JSON com try/catch ausente
- Validação de campo opcional
- Normalização de touchpoint_key
- Copy de erro amigável
- Responsividade simples (Tailwind class fix)

### Browserless / testes
- Seletor mudou (drop zone, file input, botão)
- Timing issue (timeout pequeno demais)
- Asserção desatualizada por mudança não funcional

### Product Matching (no service, não no banco)
- Ordenação de produtos incorreta
- Filter `.eq('active', true)` ausente
- Resolver de URL não prioriza `affiliate_url`
- Schema de retorno divergente

### CSS / Visual
- Espaçamento/grid quebrado
- Texto truncado (overflow CSS)
- Mobile layout breakpoints
- Hierarquia tipográfica

## ❌ Correções BLOQUEADAS (exigem revisão humana)

Marcadas com `auto_fix_allowed: false`:

### Segurança
- Login / autenticação
- Políticas RLS no Supabase
- Permitir `destination_url` arbitrária do frontend
- Permitir IA gerar hyperlinks
- Validações de segurança (CSRF, XSS, input sanitization)
- API keys / env vars

### Arquitetura
- Apagar / renomear tabelas
- Schema migrations destrutivas
- Mudança em lógica de cobrança / comissão
- Mudança em rules engine central
- Refatoração ampla

### Dados
- Operações que podem perder dados (DELETE, DROP, TRUNCATE)
- Migração de dados existentes
- Backfill em produção

### Cobertura
- Remover testes pra fazer passar
- Reduzir threshold de QA pra passar
- Desativar tracking / analytics
- Skip de check obrigatório

## Limites operacionais (anti-loop)

| Limite | Valor | Implementação |
|--------|-------|---------------|
| Tentativas por erro | 3 | `QA_MAX_RETRIES`, tracking por `error_id` |
| Fixes por rodada | 5 | Hardcoded em `auto-fix-runner.ts` |
| Mudanças no mesmo arquivo | 3 por run | Tracking interno |
| Tempo total de loop | 30 min | Soft limit do orchestrator |

## Risk level mapping

Cada fix recebe um `risk_level` no `auto-fix-report.json`:

| Risk | Tipo | Auto-aplica? |
|------|------|--------------|
| **low** | CSS isolado, copy, log, fallback render | ✅ sem revisão |
| **medium** | Lógica isolada (resolver, normalizer, filter) | ⚠️ revisar diff |
| **high** | Múltiplos arquivos, lógica central, mudança de schema | ❌ revisar com humano |

Mesmo `auto_fix_allowed: true` pode ter `risk_level: high` se o fix ficar invasivo. Nesses casos, vai pra `skipped_fixes` com `requires_human_review: true`.

## Workflow de aplicação

```
1. qa:smoke gera qa-result.json com errors[]
2. qa:auto-fix lê os errors:
   a. Para cada error com auto_fix_allowed: true:
      - Identifica arquivos relacionados (via step + category)
      - Calcula risk_level
      - Se risk_level === "low" e ≤5 fixes nesta rodada: aplica
      - Senão: vai pra skipped_fixes
3. Após aplicar todos os fixes seguros:
   - Roda qa:smoke novamente
   - Compara errors[] antes/depois
4. Se erros remanescentes ≤ erros iniciais (sem regressão):
   - Commit com mensagem "auto-fix: <descrição>"
   - Branch separada qa-fix-<run_id>
5. Se introduziu erros critical:
   - Rollback (git reset --hard antes-do-fix)
   - Marca status: "failed", final_recommendation: "Rollback executado"
```

## Rollback

Quando um fix introduz regressão critical:

```bash
# auto-fix-runner.ts faz internamente:
git diff --name-only HEAD~1 > .qa-changed-files
git checkout HEAD~1 -- $(cat .qa-changed-files)
rm .qa-changed-files
```

Documenta no `auto-fix-report.json`:
```json
{
  "status": "failed",
  "fixes_applied": [],
  "rollback_executed": true,
  "rollback_reason": "Fix de score_missing introduziu app_not_opened (regressão critical)",
  "final_recommendation": "Revisar manualmente. Auto-fix indicou: <arquivo:linha>"
}
```

## Documentação de bloqueios

Quando um erro persiste após 3 tentativas:

1. Append no `tests/artifacts/qa-history.json` com flag `blocked: true`
2. Adiciona seção em `docs/QA_LOOP.md` "Bloqueios conhecidos":
   ```markdown
   ### [run_id] — score_missing persistente
   - **Erro:** Score não aparece em /diagnostico/resultado
   - **Tentativas:** 3 (todas falharam)
   - **Hipótese:** Edge function retornando overall_score: null mesmo quando análise completa
   - **Próximo passo:** investigar logs do Supabase pra ver o JSON cru do Gemini
   - **Owner sugerido:** supabase
   ```
3. Cria issue no GitHub via `gh issue create` (futuro)

## Critérios de pronto pra produção

Antes de mergear o auto-fix:

- [ ] `qa:smoke` passa
- [ ] `qa:mobile` passa
- [ ] Nenhum check passou pra `false` que estava `true` antes (sem regressão)
- [ ] `auto-fix-report.json` tem `status: fixed` ou `partially_fixed`
- [ ] Diff revisado por humano se `risk_level >= medium`
- [ ] Commit em branch separada `qa-fix-<run_id>`
- [ ] PR aberto pra revisão humana antes do merge em `main`

## Anti-patterns

Coisas que **NÃO** queremos no auto-fix:

❌ Skip de teste pra fazer passar
```typescript
// it.skip("score visible", ...)  // NUNCA
```

❌ Asserção pra always-true pra mascarar bug
```typescript
expect(score).toBeDefined();
// vira:
expect(true).toBe(true);  // NUNCA
```

❌ Try/catch swallowing
```typescript
try { ... } catch { /* ignore */ }  // permitido só em fire-and-forget
```

❌ Hardcode pra contornar
```typescript
const score = data.overall_score ?? 8.5;  // NUNCA — mascara o bug real
const score = data.overall_score;          // ✅ deixar undefined e arrumar a causa
```

❌ Disable de validação
```typescript
const url = product.affiliate_url;  // sem fallback nem check
// → deveria validar antes de usar
```

## Versionamento da política

Esta política é parte do código. Mudanças requerem:
1. PR explicando o porquê
2. Atualização do `auto_fix_allowed` no catálogo `severity.ts`
3. Versão da política bumped neste arquivo

**Versão atual:** 1.0 (2026-05-14)
