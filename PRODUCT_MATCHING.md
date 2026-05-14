# Product Matching — arquitetura e regras

Sistema que conecta touchpoints (gerados pela IA + motor de regras) a produtos reais com hyperlinks confiáveis vindos do catálogo do Supabase. **A IA nunca inventa link** — só justifica a recomendação (`reason`).

## Princípio fundamental

**A IA não cria URLs.**

A IA pode:
- detectar problemas (Gemini Vision)
- gerar touchpoints com evidência (motor de regras)
- avaliar qualidade (Claude QA)
- escrever o campo `reason` justificando a recomendação

A IA **não** pode:
- inventar `product_url`
- inventar `affiliate_url`
- adicionar produtos que não estão no catálogo
- substituir o resolver de URL no backend

Links vêm **exclusivamente** de:
1. Tabela `recommended_products` (catálogo curado)
2. `affiliate_url` cadastrado por programa de afiliados
3. Futuro: API/feed de marketplaces parceiros

## Arquitetura

```
[Touchpoint do motor de regras]
       ↓
[productMatchingService.matchProducts()]
       ↓
[Query Supabase: cascata 3-tier]
       ↓ (até 3 produtos por touchpoint)
[Resolver de URL: affiliate_url > product_url]
       ↓
[Anexa ao JSON final da análise]
       ↓
[Frontend renderiza ProductCard]
       ↓ click "Ver produto"
[track-product-click edge function]
       ↓
[Backend valida product_id + resolve URL no servidor]
       ↓
[Insere em product_clicks]
       ↓
[Retorna destination_url pro frontend abrir]
```

## Tabelas Supabase

### `partners` (alias funcional de `partner_stores` da spec)

Catálogo curado de marketplaces/parceiros. 11 seeds: Amazon, Mercado Livre, Magalu, Shopee, Tok&Stok, MadeiraMadeira, Mobly, Leroy Merlin, Kalunga, Cobasi, Petz.

```sql
CREATE TABLE partners (
  id UUID PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,        -- "amazon_br", "tokstok"
  name TEXT NOT NULL,                -- "Amazon", "Tok&Stok"
  category TEXT NOT NULL,            -- "eletronicos_geral", "moveis_decoracao"
  base_url TEXT NOT NULL,
  search_url_template TEXT,          -- com {query} pra fallback de busca
  affiliate_enabled BOOLEAN DEFAULT FALSE,
  affiliate_program TEXT,            -- "lomadee", "awin", "proprio"
  commission_rate NUMERIC(5,2),      -- 0–100 percent
  priority INTEGER DEFAULT 0,        -- desempate de ranking
  active BOOLEAN DEFAULT TRUE,
  notes TEXT
);
```

### `recommended_products`

Catálogo de produtos seedados. 45 seeds atuais (3 por touchpoint × 15 touchpoints).

```sql
CREATE TABLE recommended_products (
  id UUID PRIMARY KEY,
  touchpoint_key TEXT NOT NULL,      -- "luminaria", "cadeira_ergonomica"
  profile_type profile_type NOT NULL DEFAULT 'geral',
  product_name TEXT NOT NULL,
  partner_id UUID REFERENCES partners(id),
  partner_name TEXT NOT NULL,        -- desnormalizado pra performance
  product_url TEXT,                  -- URL pública (busca no parceiro)
  affiliate_url TEXT,                -- URL com tracking de afiliação
  image_url TEXT,
  price NUMERIC(10,2),
  price_range TEXT,                  -- "R$ 80 a R$ 250"
  category TEXT,
  commercial_category TEXT,          -- pra match fallback (3º nível da cascata)
  tags TEXT[],
  priority INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  CONSTRAINT product_has_url CHECK (
    product_url IS NOT NULL OR affiliate_url IS NOT NULL
  )
);
```

**Constraint crítica:** sem ao menos uma URL, o produto não pode ser inserido. Garante que matching nunca retorna produto sem link.

### `product_clicks`

Registro de cliques **antes** do redirect. Insert via service_role da edge function — frontend não escreve direto.

```sql
CREATE TABLE product_clicks (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  analysis_id UUID REFERENCES analyses,
  touchpoint_id UUID REFERENCES touchpoints,
  product_id UUID NOT NULL REFERENCES recommended_products,
  partner_id UUID REFERENCES partners,
  partner_name TEXT,
  destination_url TEXT NOT NULL,     -- resolvida no backend (anti open-redirect)
  source TEXT NOT NULL DEFAULT 'analysis_result',
  ua TEXT,
  clicked_at TIMESTAMPTZ DEFAULT now()
);
```

### `product_impressions`

Registro de "qual produto foi mostrado" — pra calcular CTR (clicks / impressions).

```sql
CREATE TABLE product_impressions (
  id UUID PRIMARY KEY,
  user_id UUID, analysis_id UUID, touchpoint_id UUID,
  product_id UUID NOT NULL REFERENCES recommended_products,
  partner_id UUID, partner_name TEXT,
  source TEXT DEFAULT 'analysis_result',
  shown_at TIMESTAMPTZ DEFAULT now()
);
```

## productMatchingService

Localização: `supabase/functions/_shared/product-matching.ts`

### Entrada

```typescript
{
  touchpoint_key: "luminaria",
  profile_type: "psicologo",
  commercial_category?: "iluminacao",  // pra fallback
  budget_range?: "R$ 80 a R$ 250",
  priority?: "high"
}
```

### Cascata 3-tier

1. `touchpoint_key + profile_type` — match exato
2. `touchpoint_key + 'geral'` — fallback de perfil
3. `commercial_category` — fallback temático

Em cada nível, busca produtos ativos com pelo menos uma URL, ordena, dedupe, até preencher 3 slots.

### Ordenação

```
priority DESC          → produto curado com prioridade manual primeiro
↓ (desempate)
tem affiliate_url      → priorizar quem dá comissão
↓ (desempate)
partner.priority DESC  → parceiro estratégico primeiro
↓ (desempate)
price ASC              → mais barato primeiro
```

### Resolver de URL

```typescript
function resolveUrl(p: ProductRow) {
  if (p.affiliate_url) return { url: p.affiliate_url, is_affiliate: true };
  if (p.product_url)   return { url: p.product_url,   is_affiliate: false };
  return null; // produto sem URL = não retornado
}
```

### Saída

```typescript
{
  id: "uuid",
  product_name: "Luminária articulada LED",
  partner_name: "Amazon",
  price: null,
  price_range: "R$ 80 a R$ 200",
  image_url: "",
  url: "https://...",                  // resolvida (affiliate > product)
  is_affiliate: true,
  reason: "Indicada pra melhorar..."   // opcional, gerada pela IA
}
```

## normalizeTouchpointKey

Função utilitária pra mapear labels PT-BR → keys canônicos:

```typescript
normalizeTouchpointKey("Luminária")            → "luminaria"
normalizeTouchpointKey("Organização de cabos") → "organizador_cabos"
normalizeTouchpointKey("Papel de parede")      → "papel_de_parede"
normalizeTouchpointKey("Suporte de notebook")  → "suporte_notebook"
normalizeTouchpointKey("Webcam e microfone")   → "webcam_microfone"
normalizeTouchpointKey("Cadeira ergonômica")   → "cadeira_ergonomica"
normalizeTouchpointKey("Mesa regulável")       → "mesa_regulavel"
```

Aliases conhecidos em `ALIASES` map. Fallback genérico: normaliza acentos, troca espaço por `_`.

## track-product-click edge function

Localização: `supabase/functions/track-product-click/index.ts`

### Fluxo seguro

1. Frontend envia `{ product_id, analysis_id?, touchpoint_id?, source? }`
2. Backend busca produto: `SELECT product_url, affiliate_url, active FROM recommended_products WHERE id = $1`
3. Valida `active = TRUE` (senão retorna 410 Gone)
4. Resolve `destination_url` no backend: `affiliate_url ?? product_url`
5. Insere em `product_clicks` (fire-and-forget)
6. Retorna `{ destination_url }` pro frontend abrir

### Anti open-redirect

**Frontend NUNCA envia `destination_url`.** Se o body do request contiver esse campo, ele é ignorado. A URL real é resolvida no backend a partir do `product_id` validado contra o DB.

```typescript
// ❌ NUNCA FAZER no frontend:
window.location.href = userInputUrl;

// ✅ SEMPRE assim:
const { destination_url } = await supabase.functions.invoke("track-product-click", {
  body: { product_id, analysis_id, touchpoint_id }
});
window.open(destination_url, "_blank", "noopener,noreferrer");
```

## Frontend — ProductCard

`src/routes/diagnostico.resultado.$id.tsx` renderiza `<ProductCard>` dentro de cada `<TouchpointCard>` quando `recommended_products.length > 0`.

### Comportamento do click

1. `window.open("", "_blank")` **antes** do await (escapa popup blocker)
2. `supabase.functions.invoke("track-product-click", { body: { product_id, analysis_id, touchpoint_id } })`
3. Recebe `{ destination_url }`
4. Atribui `win.location.href = destination_url`
5. Em caso de erro de tracking: usa `product.url` original do payload (já validado pelo backend ao gerar a análise) — não usa URL do client

### Render condicional

- Se `recommended_products` vazio → seção não aparece (UX limpa, não fica vazia)
- Se `is_affiliate=true` → badge "afiliado" pro user saber
- Se `reason` existe → renderiza em itálico abaixo do nome/preço
- Se `image_url` existe → renderiza thumbnail 40×40

## Tracking de impressions

Frontend dispara `product_impressions` insert quando o `ProductCard` aparece no viewport pela primeira vez. Usa `IntersectionObserver` pra detectar quando entra em tela.

Implementação em `src/routes/diagnostico.resultado.$id.tsx`:
1. Cada `<ProductCard>` registra ref no IntersectionObserver
2. Ao primeiro intersect com >50% visível, dispara `supabase.from("product_impressions").insert(...)`
3. Marca `impressionTracked.current = true` pra não duplicar
4. Análise via SQL: `clicks_count / impressions_count = CTR por produto`

## Adicionando produtos reais (FIXME afiliados)

Hoje os 45 seeds têm `product_url` placeholder (busca no parceiro) e `affiliate_url = NULL`. Pra trocar por links de afiliação reais:

### Via SQL Editor

```sql
UPDATE recommended_products
SET affiliate_url = 'https://amzn.to/SEU_AFFILIATE_TAG/dp/B0XXX'
WHERE product_name = 'Luminária articulada LED para home office'
  AND partner_name = 'Amazon';
```

### Via admin UI (não construído)

Próximo passo: rota `/dashboard/admin/products` que lista produtos e permite editar `product_url`/`affiliate_url` inline. Tabela já tem RLS pro admin.

### Via script de bulk update

`scripts/fix-affiliate-urls.ts` já existe no projeto pra batch updates. Adaptar pra mapear `partner_slug + product_name` → `affiliate_url`.

## Integração com APIs reais de marketplace (roadmap)

Estrutura preparada pra trocar `product_url` placeholder por feeds reais:

### Amazon BR (Product Advertising API)
- Endpoint: `https://webservices.amazon.com.br/paapi5/searchitems`
- Auth: AWS Signature v4
- Função futura: `supabase/functions/amazon-search/index.ts` que retorna produtos reais por keyword
- Cron job atualiza `recommended_products` 1×/dia

### Mercado Livre (API pública)
- Endpoint: `https://api.mercadolibre.com/sites/MLB/search?q={query}`
- Auth: opcional, mas com OAuth ganha vendor info + comissão
- Função futura: `supabase/functions/ml-search/index.ts`

### Awin / Lomadee (redes de afiliação)
- Webhook recebe atualizações de catálogo
- Endpoint: `supabase/functions/affiliate-feed-webhook/index.ts`
- Sincroniza `affiliate_url` periodicamente

### Estratégia híbrida (recomendada)

- **Catálogo curado** (`recommended_products`): produtos premium, alta qualidade, link afiliado próprio. ~30-50 produtos sempre disponíveis.
- **Busca em tempo real** (futuro): pra touchpoints sem match no catálogo, chama API do parceiro com fallback de produtos genéricos.

O `productMatchingService` já tem o slot pra plugar isso: basta adicionar 4º tier na cascata que chama API externa quando os 3 níveis acima falham.

## Critérios de aceite (checklist)

- [x] IA não inventa hyperlinks
- [x] Links vêm exclusivamente do Supabase
- [x] Cada touchpoint pode ter até 3 produtos
- [x] Produtos inativos não aparecem (`active = true` filter)
- [x] Produtos sem `product_url` E sem `affiliate_url` não aparecem (CHECK constraint)
- [x] `affiliate_url` tem prioridade sobre `product_url`
- [x] Clique é registrado antes do redirecionamento
- [x] Backend valida `product_id` e resolve link final
- [x] Frontend não pode forçar `destination_url` arbitrária
- [x] A tela não quebra se não houver produtos
- [x] Código modular (service em `_shared/`, edge function isolada)
- [x] Estrutura permite plugar APIs reais (slot na cascata)
- [x] Preserva fluxos existentes (sem refactor amplo)

## Métricas de sucesso

SQL pra acompanhar performance no dashboard admin:

```sql
-- CTR por produto (últimos 30 dias)
SELECT
  p.product_name,
  p.partner_name,
  COUNT(DISTINCT i.id) AS impressions,
  COUNT(DISTINCT c.id) AS clicks,
  ROUND(100.0 * COUNT(DISTINCT c.id) / NULLIF(COUNT(DISTINCT i.id), 0), 2) AS ctr_pct
FROM recommended_products p
LEFT JOIN product_impressions i ON i.product_id = p.id AND i.shown_at > now() - interval '30 days'
LEFT JOIN product_clicks c ON c.product_id = p.id AND c.clicked_at > now() - interval '30 days'
GROUP BY p.id, p.product_name, p.partner_name
HAVING COUNT(DISTINCT i.id) > 10
ORDER BY ctr_pct DESC NULLS LAST;

-- Receita estimada por parceiro (assumindo conversão 5% após click)
SELECT
  pt.name AS partner,
  COUNT(c.id) AS clicks,
  ROUND(COUNT(c.id) * 0.05 * 50, 2) AS estimated_revenue_brl  -- 50 = AOV médio
FROM product_clicks c
JOIN partners pt ON pt.id = c.partner_id
WHERE c.clicked_at > now() - interval '30 days'
GROUP BY pt.id, pt.name
ORDER BY clicks DESC;
```
