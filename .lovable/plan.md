
# Plano: Deskly 100% funcional

Manter exatamente o layout, cores, tipografia e componentes visuais que já existem. Trocar apenas a "alma" por trás: dados reais, login real, IA real, persistência real.

> Se você quis mesmo trocar o projeto para "Cuidadores Connect", me responda "trocar projeto" e eu refaço o plano. Caso contrário, sigo com Deskly.

---

## 1. Backend: ativar Lovable Cloud

Ativar Lovable Cloud (Supabase gerenciado) para ter:
- Postgres com RLS
- Auth nativo (email/senha + Google)
- Storage de imagens (setups, antes/depois, avatares)
- Server functions com `createServerFn`

## 2. Modelo de dados (Postgres + RLS)

```text
profiles            id (uuid, FK auth.users), username, display_name, avatar_url, bio, role (dev/design/pm/creator), created_at
user_roles          user_id, role (admin|moderator|user)   -- separado, com has_role()
setups              id, owner_id, slug, title, description, style, role, budget_brl, cover_url, status (draft|published), likes_count, created_at
setup_images       id, setup_id, url, position, is_before, is_after
setup_products      id, setup_id, x, y, category, name, brand, price_brl, affiliate_url, store (amazon|ml|kabum|magalu)
product_alternatives id, product_id, name, price_brl, affiliate_url, store
likes               user_id, setup_id, created_at        (PK composta)
saves               user_id, setup_id, created_at        (PK composta)
comments            id, setup_id, author_id, body, created_at
ai_analyses         id, setup_id (nullable), owner_id, image_url, scores jsonb, tips jsonb, created_at
```

RLS:
- `setups`: leitura pública para `status='published'`; escrita só pelo `owner_id`.
- `likes`/`saves`/`comments`: leitura pública; escrita só `auth.uid() = user_id`.
- `profiles`: leitura pública; update só do dono.
- `user_roles`: checada via função `has_role(uid, role)` `SECURITY DEFINER`.

Triggers:
- `handle_new_user()`: cria profile automático no signup.
- `setups.likes_count` atualizado por trigger nas inserts/deletes de `likes`.

## 3. Autenticação

- Páginas novas: `/auth` (login + signup em tabs) e `/reset-password`.
- Email/senha + Google.
- `useAuth()` hook com `onAuthStateChange` montado **antes** de `getSession`.
- `Navbar` ganha estado: deslogado mostra "Entrar"; logado mostra avatar + menu (Meu perfil, Meus setups, Salvos, Sair).
- Rotas protegidas: `/postar`, `/perfil`, `/meus-setups`. Redirecionam para `/auth` se não logado.

## 4. Migrar features de localStorage para banco

- `use-saved.tsx`: passa a ler/gravar em `likes` e `saves` via server functions; mantém a mesma API para os componentes (não quebra layout).
- Otimismo: atualização imediata no UI + rollback em erro.
- Contadores reais nos cards (likes_count do banco).

## 5. `/postar` — submissão real

- Upload de até 6 imagens para Storage (`setups/{user_id}/{setup_id}/...`).
- Form com título, descrição, estilo, role, orçamento, capa.
- Editor de **hotspots de produto**: clicar na imagem cria um marcador (x,y%), abre modal para nome, categoria, preço, link de afiliado, loja, alternativa mais barata.
- Salva como `draft` ou `published`.

## 6. `/galeria` — dados reais

- Lista paginada de `setups` published, com filtros (estilo, role, faixa de orçamento, busca).
- Server function `listSetups({ filters, cursor })` com paginação cursor-based.
- Skeletons enquanto carrega; empty state quando nada bate.

## 7. `/setup/$slug` — dados reais

- Carrega setup + imagens + hotspots + alternativas via server function.
- Like/Save persistem no banco.
- Comentários reais (lista + form, requer login).
- Compartilhar via Web Share API (já existe).
- Botão "Editar" só para o `owner_id`.

## 8. `/diagnostico` — IA real (Lovable AI Gateway)

- Upload da imagem para Storage.
- Server function `analyzeSetup({ imageUrl })` chama Lovable AI Gateway com modelo de visão (Gemini 2.5 Flash, grátis durante o período promocional).
- Prompt estruturado pede JSON: `{ scores: {ergonomics, lighting, organization, cables, posture, aesthetics}, tips: [{category, severity, text}] }`.
- Salva em `ai_analyses`. Se logado, oferece "Anexar a um setup meu".
- Mantém exatamente o visual atual da seção de scores.

## 9. `/comunidade` — funcional

- Feed de últimos setups + últimos comentários (joins simples).
- Leaderboard: top usuários por soma de likes nos últimos 30d.
- Threads de discussão: tabela `discussions` (id, author_id, title, body, created_at) + `discussion_replies`. Mantém o visual atual.

## 10. `/orcamento` — dinâmico

- Tiers (Essencial / Equilibrado / Premium) deixam de ser hardcoded. Vêm de uma view que agrega produtos por categoria respeitando o teto de cada tier.
- Botão "Ver setups nessa faixa" leva para `/galeria?budget=...`.

## 11. Perfil e meus setups

- `/perfil/$username` público: bio, setups publicados, likes recebidos.
- `/meus-setups` (privado): lista drafts + published, ações editar/despublicar/excluir.

## 12. Qualidade

- Toaster (`sonner`) em todas operações de escrita (sucesso/erro).
- Estados de loading e erro em todas as queries.
- `errorComponent` e `notFoundComponent` em todas as rotas com loader.
- Validação Zod em todos os inputs de server functions.

---

## Detalhes técnicos

- **Stack**: TanStack Start + `createServerFn` (não Edge Functions). Auth via `requireSupabaseAuth` middleware. Admin client só para triggers de manutenção.
- **Storage**: bucket `setups` público para leitura, escrita só autenticado no próprio prefixo `{user_id}/`.
- **AI**: Lovable AI Gateway, modelo `google/gemini-2.5-flash` (visão, free tier ativo).
- **Paginação**: cursor por `created_at + id`.
- **Roles de admin**: tabela `user_roles` separada + função `has_role()` `SECURITY DEFINER` (nunca no profile).
- **Layout intocado**: nenhum componente em `src/components/landing/` muda visualmente. Mudam só fonte de dados, handlers e estados.

## Ordem de implementação

1. Ativar Lovable Cloud + migrations (schema + RLS + triggers).
2. Auth (`/auth`, `/reset-password`, hook, navbar).
3. Server functions de setups/likes/saves + migrar `use-saved`.
4. `/postar` com upload e hotspots.
5. `/galeria` e `/setup/$slug` com dados reais.
6. `/diagnostico` com IA real.
7. `/comunidade` (feed + threads + leaderboard).
8. `/orcamento` dinâmico.
9. `/perfil` e `/meus-setups`.
10. Polish: erros, loading, toasts, seed inicial de dados demo.

Aprovando, eu já começo pela ativação do Cloud e pelas migrations.
