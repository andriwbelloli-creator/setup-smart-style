## Objetivo

Aprimorar a seção de comentários em `/setup/$slug` com **realtime** (novos comentários aparecem sem refresh) e **paginação** (carregar mais conforme necessário). A postagem e listagem básica já existem — vamos completar o fluxo.

## Estado atual

`src/routes/setup.$slug.tsx` já tem:
- Form de postagem (com auth check)
- Listagem inicial via `supabase.from("comments").select(...)`
- RLS configurada (read public, insert own, update/delete own)

Faltam: realtime, paginação, deletar próprio comentário, contagem total real.

## Mudanças

### 1. Migração SQL — habilitar Realtime na tabela `comments`
```sql
ALTER TABLE public.comments REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.comments;
```

### 2. Novo hook `src/hooks/use-comments.tsx`
Encapsula toda a lógica de comentários para `setup.$slug.tsx` ficar enxuto:
- Estado: `comments`, `total`, `loading`, `hasMore`, `posting`
- `fetch(page)` — usa `.range(from, to)` do Supabase com `count: "exact"` para paginar (10 por página, ordem desc)
- `loadMore()` — incrementa página e concatena resultados
- `post(body)` — insere comentário e devolve com join no autor
- `remove(id)` — deleta (somente do próprio usuário, validado por RLS)
- `subscribe()` — canal Supabase Realtime escutando `INSERT` e `DELETE` na tabela `comments` filtrado por `setup_id`. Para INSERTs vindos de outros usuários, busca o autor via profiles e adiciona ao topo (deduplicando IDs já presentes para evitar conflito com o próprio post otimista). Para DELETEs, remove pelo id.
- Cleanup do canal no unmount

### 3. Atualizar `src/routes/setup.$slug.tsx`
- Trocar lógica inline pelo `useComments(setup.id, fromDb)`
- Botão "Carregar mais comentários" quando `hasMore`
- Mostrar `total` real no cabeçalho ("Comentários (N)")
- Botão de deletar (ícone trash) ao lado de cada comentário próprio
- Indicador "ao vivo" sutil quando subscription ativa
- Avatar do autor (usar `Avatar` shadcn) com fallback nas iniciais
- Limite de 500 chars já existe; adicionar contador visual

### 4. Validação
Validar `body` com zod (trim, min 1, max 500) antes do insert para evitar comentários vazios/longos demais.

## Detalhes técnicos

- **Paginação**: `PAGE_SIZE = 10`. Query: `.select("*, author:profiles!comments_author_id_fkey(...)", { count: "exact" }).eq("setup_id", id).order("created_at", { ascending: false }).range(page*PAGE_SIZE, (page+1)*PAGE_SIZE - 1)`
- **Realtime dedup**: ao receber INSERT via canal, checar se `id` já existe no estado (caso o próprio usuário postou e já recebeu via response do insert). Se existir, ignorar.
- **Realtime author lookup**: o payload do canal contém só os campos da tabela `comments` (sem join). Fazer `supabase.from("profiles").select(...).eq("id", payload.new.author_id).maybeSingle()` antes de inserir no estado.
- **Canal único por setup**: `supabase.channel(`comments:${setupId}`)` com filter `setup_id=eq.${setupId}`.
- **Não roda em SSR**: hook só ativa fetch/subscribe em `useEffect`, nada no loader.

## Arquivos

- `supabase/migrations/<timestamp>_realtime_comments.sql` (novo)
- `src/hooks/use-comments.tsx` (novo)
- `src/routes/setup.$slug.tsx` (refatorar seção de comentários)

## Fora de escopo

- Respostas aninhadas (threads)
- Edição de comentários
- Reações/likes em comentários
- Notificações ao dono do setup