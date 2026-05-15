# HomeOfficeLife — Mobile First UX/UI

> Referência obrigatória para qualquer tela mobile. A versão mobile é a PRINCIPAL experiência
> da plataforma — não uma adaptação reduzida do desktop.

---

## Princípios mobile

1. **Upload em poucos toques** — a ação principal é enviar foto pelo celular
2. **Resultado escaneável** — cards curtos, ícones, hierarquia clara, pouco texto
3. **CTAs grandes e visíveis** — botão principal sempre acessível
4. **Scroll natural** — cards empilhados, carrosseis horizontais, filtros em chips
5. **Confiança imediata** — selos de privacidade antes do upload

---

## Navegação mobile — menu inferior fixo

```
[ Início ]  [ Galeria ]  [ ★ ANALISAR ★ ]  [ Wishlist ]  [ Perfil ]
```

- O botão **"Analisar"** deve ter destaque visual no centro (maior, cor primária, ícone câmera)
- 5 itens máximo no bottom nav
- Sem hamburger menu escondido — tudo acessível direto

---

## Hero mobile

```
┌─────────────────────────┐
│  homeoffice.life        │
├─────────────────────────┤
│                         │
│  Melhore seu            │
│  home office com IA     │
│                         │
│  Envie uma foto e       │
│  receba nota + dicas.   │
│                         │
│  ┌───────────────────┐  │
│  │ 📷 Analisar meu   │  │
│  │    setup grátis    │  │
│  └───────────────────┘  │
│                         │
│  Ver exemplos →         │
│                         │
│  ✓ Sem cartão           │
│  ✓ Fotos privadas       │
│  ✓ Resultado em 30s     │
│                         │
│  ┌──────────────────┐   │
│  │  [mockup análise] │   │
│  │   Nota: 8.3/10   │   │
│  └──────────────────┘   │
│                         │
│  12k+ setups · 4.9★     │
└─────────────────────────┘
```

- Headline: max 6 palavras
- CTA: 100% width, 56px altura, gradient-hero
- Selos: row horizontal abaixo do CTA
- Mockup: card pequeno com nota + barras

---

## Upload mobile

```
┌─────────────────────────┐
│  Envie a foto do seu    │
│  home office            │
│                         │
│  ┌───────────────────┐  │
│  │                   │  │
│  │   📷              │  │
│  │   Tirar foto      │  │
│  │   ou escolher     │  │
│  │                   │  │
│  └───────────────────┘  │
│                         │
│  JPG, PNG, WebP · 10MB  │
│                         │
│  ✓ Foto não publicada   │
│  ✓ Você controla        │
│  ✓ Sem cartão           │
└─────────────────────────┘
```

- Botão de upload: 100% width, 200px altura, drop zone com ícone câmera grande
- Trust signals: abaixo do upload, sempre visíveis
- 2 toques máximo: abrir câmera/galeria → confirmar

---

## Loading IA mobile

```
┌─────────────────────────┐
│                         │
│      ✨ (animado)       │
│                         │
│  Analisando seu setup…  │
│                         │
│  ████████░░░░  65%      │
│                         │
│  ✓ Ergonomia            │
│  ✓ Iluminação           │
│  → Organização...       │
│  ○ Cabos                │
│  ○ Estética             │
│                         │
└─────────────────────────┘
```

- Centralizado, sem scroll
- Progress bar animada
- Checklist de etapas
- Mensagens alternando: "Analisando ergonomia..." → "Verificando iluminação..."

---

## Resultado da análise mobile

```
┌─────────────────────────┐
│ ← Voltar     Salvar 💾  │
├─────────────────────────┤
│                         │
│      72/100             │
│   ┌─ Bom ──────┐       │
│   │ Pode melhorar │     │
│   └─────────────┘       │
│                         │
│  "Seu setup tem boa     │
│   organização, mas pode │
│   melhorar ergonomia    │
│   e iluminação."        │
│                         │
├─ Pontos fortes ─────────┤
│  ✓ Organização          │
│  ✓ Estética             │
│  ✓ Espaço               │
│                         │
├─ Atenção ───────────────┤
│  ⚠ Ergonomia 45/100     │
│  ⚠ Iluminação 48/100    │
│  ⚠ Cabos 52/100         │
│                         │
├─ O que melhorar ────────┤
│  1. Suporte notebook    │
│     Resolve: postura    │
│     ~R$ 70              │
│     [Ver produto]       │
│                         │
│  2. Luminária LED       │
│     Resolve: sombra     │
│     ~R$ 150             │
│     [Ver produto]       │
│                         │
│  3. Organizador cabos   │
│     Resolve: visual     │
│     ~R$ 30              │
│     [Ver produto]       │
│                         │
├─ 🔒 Premium ────────────┤
│  Desbloqueie 10 eixos   │
│  + lista completa       │
│  + relatório PDF        │
│                         │
│  [Desbloquear R$ 4,90]  │
│  Cancele quando quiser  │
│                         │
├─ Upgrade por orçamento ─┤
│  [Até R$50] [Até R$100] │
│  [Até R$300] [Até R$700]│
│                         │
└─────────────────────────┘
│                         │
│  CTA fixo inferior:     │
│  [Salvar meu plano]     │
└─────────────────────────┘
```

- Nota geral: 72px font, centralizada, com level badge
- Resumo IA: max 2 linhas
- Cards empilhados por seção
- Produtos como cards horizontais com preço + CTA
- Paywall: inline, suave, entre seções
- CTA fixo no bottom: "Salvar meu plano" ou "Desbloquear"

---

## Card de produto mobile

```
┌──────────────────────────────┐
│ [img]  Suporte para notebook │
│        Resolve: postura      │
│        ~R$ 70                │
│        [Ver] [Salvar 💾]     │
└──────────────────────────────┘
```

- Horizontal: imagem esquerda (60px quadrado) + info direita
- Preço + problema que resolve + CTA
- Carrossel horizontal quando >3 produtos

---

## Galeria mobile

```
┌─────────────────────────┐
│  Setups da comunidade   │
│                         │
│  [Dev][Designer][Gamer] │
│  [Psicólogo][Apê peq.]→│
│                         │
│  ┌────────────────────┐ │
│  │ [foto setup]       │ │
│  │ ★ 9.2 · Designer   │ │
│  │ R$ 4.200 · SP      │ │
│  │ [Montar parecido]  │ │
│  └────────────────────┘ │
│                         │
│  ┌────────────────────┐ │
│  │ [foto setup]       │ │
│  │ ★ 8.7 · Dev        │ │
│  │ R$ 6.500 · MG      │ │
│  │ [Montar parecido]  │ │
│  └────────────────────┘ │
│                         │
│  [Carregar mais]        │
└─────────────────────────┘
```

- Feed vertical, 1 coluna, cards grandes
- Filtros: chips horizontais com scroll
- Card: imagem 16:11 → nota + categoria + preço + cidade + CTA
- Nunca produto isolado — só setups completos (≥3 elementos)

---

## Pricing mobile

```
┌─────────────────────────┐
│  Planos                 │
│                         │
│  🏷 Preço de lançamento │
│                         │
│  ┌─ Gratuito ─────────┐ │
│  │ R$ 0 · pra sempre  │ │
│  │ 3 análises          │ │
│  │ [Começar grátis]    │ │
│  └────────────────────┘ │
│                         │
│  ┌─ Premium ★ ────────┐ │
│  │ R$ 4,90/mês        │ │
│  │ Mais popular        │ │
│  │ Análises ilimitadas │ │
│  │ Sugestões orçamento │ │
│  │ Comparação setups   │ │
│  │ [Assinar Premium]   │ │
│  └────────────────────┘ │
│                         │
│  ┌─ Pro ──────────────┐ │
│  │ R$ 9,90/mês        │ │
│  │ Relatório PDF       │ │
│  │ Selo Pro            │ │
│  │ [Assinar Pro]       │ │
│  └────────────────────┘ │
│                         │
│  ✓ Cancele quando quiser│
│  ✓ Sem fidelidade       │
└─────────────────────────┘
```

- Cards empilhados, 1 por vez
- Premium com borda destaque + badge "Mais popular"
- Sem tabela comparativa — features inline em cada card
- Trust signals no final

---

## Marketplace mobile

```
┌──────────────────────────────┐
│ [img]  Monitor LG 24"       │
│        Seminovo · R$ 650    │
│        São Paulo, SP        │
│        Resolve: tela peq.   │
│        [Ver] [Salvar]       │
└──────────────────────────────┘
```

- Cards horizontais como produto
- Filtros: categoria, preço, cidade
- Badge de condição (Novo, Seminovo, Usado)
- Conexão com diagnóstico: "Produtos que melhorariam seu setup"

---

## Wishlist mobile

```
┌─────────────────────────┐
│  Minha wishlist (4)     │
│                         │
│  1. Suporte notebook    │
│     +12pts ergonomia    │
│     R$ 70 · [Comprar]   │
│                         │
│  2. Luminária LED       │
│     +15pts iluminação   │
│     R$ 150 · [Comprar]  │
│                         │
│  3. Organizador cabos   │
│     +8pts organização   │
│     R$ 30 · [Comprar]   │
│                         │
│  Total: R$ 250          │
│  Impacto: +35 pontos    │
└─────────────────────────┘
```

- Lista priorizada por impacto na nota
- Preço total + impacto total
- Alternativas usadas do marketplace
- "Comprar este suporte pode melhorar sua ergonomia em até 12 pontos."

---

## Kits mobile

- Cards empilhados com cor no topo
- Nome + "pra quem é" + preço + produtos (lista curta) + CTA
- Carrossel horizontal também funciona (2 cards visíveis)

---

## Componentes mobile obrigatórios

| Componente | Specs |
|---|---|
| Bottom nav | 5 itens, 56px altura, ícone + label, "Analisar" central com destaque |
| CTA fixo | 100% width, 52px, gradient-hero ou primary, sticky bottom |
| Upload zone | 100% width, 200px, ícone câmera 48px, dashed border |
| Card nota | Nota 72px, level badge, resumo 2 linhas |
| Card problema | Ícone warning + label + nota + barra progresso |
| Card produto | Horizontal: thumb 60px + nome + preço + CTA |
| Card setup | Vertical: foto 16:11 + nota + categoria + preço + CTA |
| Card plano | Empilhado: nome + preço + features + CTA |
| Filtro chips | Horizontal scroll, 32px altura, rounded-full |
| Paywall inline | Dashed border, ícone crown, CTA hero |
| Toast | 100% width, bottom, auto-dismiss 4s |
| Skeleton | Shimmer, aspect-ratio match do conteúdo final |
| Empty state | Ícone 48px + título + CTA |

---

## Regras de UX mobile

- **Max 3 linhas de texto** por seção antes de um visual (card, imagem, barra)
- **CTAs: 52px mínimo** de altura, touch target 44px mínimo
- **Filtros: chips horizontais** com scroll, nunca dropdown complexo
- **Carrosséis: 2.5 cards visíveis** (para sugerir scroll)
- **Nunca 2 CTAs concorrendo** na mesma viewport — 1 primário + 1 link
- **Imagens: lazy load** + placeholder skeleton
- **Scroll infinito** na galeria, nunca paginação
- **Bottom sheet** para detalhes, nunca nova página inteira
- **Sem tabelas** — converter em cards empilhados
- **Sem hover states** — usar press/active states ao invés

---

## Prioridade de implementação mobile

| Prioridade | Telas |
|---|---|
| **P1 — MVP** | Hero · Upload · Loading · Resultado · Pricing · Paywall · Trust |
| **P2 — Engajamento** | Galeria · Wishlist · Kits · Afiliados · Categorias |
| **P3 — Marketplace** | Listings · Filtros · Chat · Usados por diagnóstico |
| **P4 — Recorrência** | Antes/depois · Histórico · Ranking · Alertas preço · Selo Pro |
