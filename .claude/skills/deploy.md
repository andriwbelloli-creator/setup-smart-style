---
name: deploy
description: Commita pending changes, dá push na feat branch, faz deploy das edge functions que mudaram e abre o link de PR pra mergear em main.
---

# /deploy — pipeline de deploy do Deskly/HomeOfficeLife

Quando o usuário invocar essa skill, executa a sequência abaixo. **Não pergunte nada** — só execute. Reporte falhas curtas, sucesso ainda mais curto.

## Sequência

1. **`git status -sb`** — confirmar branch atual e mudanças.

2. **Verificar branch**:
   - Se estiver em `main`: parar, dizer "estou em main, switch pra uma feat antes".
   - Se estiver limpa (nada a commitar) E não há commits novos vs origin: pular pro passo 6 (deploy de edge functions se houver mudanças pendentes que não foram pushed... na real se nada a deploy também, só reportar "nada pra deployar" e sair).
   - Caso normal: seguir.

3. **Staged + commit** (não usar `--no-verify`):
   - `git add` apenas arquivos modificados/criados sob `src/`, `supabase/`, `public/`, `scripts/`, `.github/`, `package.json`, root config files. NUNCA stage `.env*` (mesmo `.env.example` requer confirmação).
   - Inspecionar `git diff --cached` resumido pra montar a mensagem.
   - Mensagem de commit no formato Conventional Commits (em português curto):
     - `feat(scope): …` pra nova feature
     - `fix(scope): …` pra bugfix
     - `chore(scope): …` pra config / refactor sem impacto
     - `docs(scope): …` pra docs
   - Body de 1-3 linhas em pt-BR explicando o "porquê", não o "o quê". Sem listar arquivos.
   - Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
   - Usar HEREDOC pra preservar quebra de linha:
   ```
   git commit -m "$(cat <<'EOF'
   feat(scope): título curto

   Body opcional explicando porquê. 1-3 linhas. Em pt-BR.

   Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
   EOF
   )"
   ```

4. **Push** na branch atual:
   - `git push origin $(git branch --show-current)` — se a branch é nova, adicionar `-u`.

5. **Deploy de edge functions** (se aplicável):
   - Listar functions que mudaram no último commit: `git diff --name-only HEAD~1 HEAD | grep '^supabase/functions/' | awk -F/ '{print $3}' | sort -u`
   - Pra cada uma:
     ```
     export PATH="$HOME/.bun/bin:$PATH"
     export SUPABASE_ACCESS_TOKEN=$(grep '^SUPABASE_ACCESS_TOKEN' .env.local | cut -d= -f2- | tr -d '"')
     bunx supabase functions deploy <nome> --project-ref icwgkbvwehkjmkuiecuj
     ```
   - Falha em uma function não bloqueia as outras — reportar quais foram OK e quais falharam.

6. **Migrations** (se aplicável):
   - Listar migrations novas: `git diff --name-only HEAD~1 HEAD | grep 'supabase/migrations/'`
   - NÃO aplicar automaticamente (classifier bloqueia DB write). Reportar quais existem e mostrar o link do SQL Editor:
     ```
     https://supabase.com/dashboard/project/icwgkbvwehkjmkuiecuj/sql/new
     ```
   - Se a migration for trivialmente idempotente (DROP IF EXISTS + CREATE, ADD COLUMN IF NOT EXISTS), tentar aplicar via Management API — se classifier bloquear, cair pro link manual.

7. **Criar PR e auto-merge pra main**:
   - Usar `gh` CLI (binário em `$HOME/.local/bin/gh`, já autenticado).
   - Verificar se já existe PR aberto pra branch: `gh pr view --json number,state,url 2>/dev/null`
     - Se existe e está OPEN: pular criação, ir direto pro merge.
     - Senão: criar com `gh pr create --base main --head <branch> --title "<msg do último commit>" --body "<resumo gerado>"`
   - Auto-merge com squash (espera CI passar se houver):
     ```
     gh pr merge --auto --squash --delete-branch
     ```
   - Se `--auto` falhar (sem branch protection ou sem checks), cair pro merge imediato: `gh pr merge --squash --delete-branch`
   - Imprimir URL do PR + status final.
   - Se classifier bloquear `gh pr merge` em main, fallback é só imprimir o link de PR.

## Restrições

- **Nunca push direto na main**. Classifier bloqueia, é regra dura.
- **Nunca commitar secrets**. Antes de stage, fazer `grep -E "(sk_live_|sk_test_|whsec_|re_[A-Za-z0-9_]+)" <files>` — se achar, parar e alertar.
- **Nunca usar `git commit --no-verify`** ou `--no-gpg-sign`.
- **Nunca fazer `git reset --hard` ou destrutivo** sem confirmação explícita.

## Output format

Resposta final curta, formato:

```
✅ commit <hash> · push <branch>
✅ deployed: detect-touchpoints, suggest-listing
⏳ migration pendente: 20260513_nome.sql → SQL Editor
✅ PR #<n> merged (squash, branch deletada): https://github.com/andriwbelloli-creator/setup-smart-style/pull/<n>
```

Se merge falhou ou foi enfileirado (auto-merge aguardando CI), substituir última linha por:
```
⏳ PR #<n> auto-merge habilitado (aguardando checks): https://github.com/.../pull/<n>
```

Sem prosa adicional, sem perguntar próximos passos. Usuário invoca `/deploy` justamente pra evitar precisar confirmar cada etapa.
