# Upload em lote de setups

Use esta pasta pra adicionar novos setups com fotos próprias (curadas, sem
risco de "foto de casa" do Unsplash).

## Como usar

1. **Joga os JPGs/PNGs aqui** (qualquer nome):
   ```
   scripts/uploads/meu-dev-setup.jpg
   scripts/uploads/gamer-rgb.jpg
   scripts/uploads/foto-3.png
   ```

2. **Roda o script vazio** pra gerar o template de metadados:
   ```bash
   bun --env-file=.env.local run scripts/bulk-upload-setups.ts
   ```
   Ele detecta as imagens e cria `scripts/uploads/setups.json` com placeholders.

3. **Edita o `setups.json`** preenchendo título, descrição, slug, produtos, etc.

4. **Roda de novo** — ele faz upload das imagens pro Storage do Supabase e
   cria os setups no banco:
   ```bash
   bun --env-file=.env.local run scripts/bulk-upload-setups.ts
   ```

   Idempotente: se um slug já existe no banco, pula. Imagens são upsert
   (sobrescreve se mesmo path).

## Formato do setups.json

```json
[
  {
    "image": "meu-dev-setup.jpg",
    "slug": "meu-dev-setup",
    "title": "Meu setup dev",
    "description": "Setup focado em código + docs lado a lado.",
    "ownerEmail": "dev@deskly.test",
    "career": "dev",
    "budget_brl": 5000,
    "city": "São Paulo, SP",
    "styles": ["dev", "minimalista"],
    "ai_score": 8.5,
    "products": [
      {
        "category": "Monitor",
        "name": "LG Ultrawide 34\"",
        "brand": "LG",
        "price_brl": 2800,
        "store": "kabum",
        "x": 50,
        "y": 35,
        "position": 1
      }
    ]
  }
]
```

### Campos obrigatórios
- `image` — nome do arquivo na pasta uploads/
- `slug` — único, kebab-case
- `title`, `description`
- `ownerEmail` — precisa ser um email já cadastrado (use um dos `*@deskly.test` do seed, ou seu próprio)

### Campos opcionais (têm default)
- `career` — default `"outro"`
- `budget_brl` — default `0`
- `city` — default `"Brasil"`
- `styles` — default `[]`
- `ai_score` — default `8.0`
- `products` — default `[]`

### `store` permitidos
`amazon_br`, `mercado_livre`, `kabum`, `magalu`, `pichau`, `outro`

### `affiliate_url` automático
Se você não preencher `affiliate_url` em cada produto, o script gera uma URL
de busca decorada (Amazon/ML/Kabum/Magalu/Pichau).
