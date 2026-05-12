# Hierarquia de Z-Index — HomeOfficeLife

Documento de referência. Ao adicionar elemento sobreposto novo,
consulte esta tabela e siga a faixa correta. Se precisar de um nível
intermediário, prefira valores múltiplos de 10 (z-25, z-35...).

| Z-Index | Uso | Exemplos |
|---------|-----|----------|
| `-z-10`  | Decorativos atrás de conteúdo | Blur blobs em Hero (Hero.tsx:107) |
| `z-10`   | UI overlay em mídia (in-flow) | WatermarkOverlay, hotspots ★ no SetupCard, badge trending |
| `z-20`   | Ações flutuantes em cards | Botão delete admin (SetupCard.tsx) |
| `z-30`   | Popovers contextuais inline | Share menu no setup detail, ShareButton popover |
| **z-40** | **Sticky chrome** | **Navbar (sticky top-0)** |
| `z-40` (bottom) | Painel produto flutuante | Floating product panel em setup detail |
| `z-50`   | Overlays globais (acima de tudo) | Mobile drawer da Navbar, CookieBanner, modais, toasts |

## Convenções

- **Mobile drawer da Navbar é z-50**: precisa cobrir o próprio Navbar
  sticky (z-40). Se a navbar for z-50, o drawer não conseguiria cobrir.
- **Modais de paywall** (limitReached em AnaliseIA, etc) usam z-50.
  Toast (sonner) também z-50, mas é o último a montar — geralmente
  fica por cima dos modais por ordem do DOM.
- **Sticky aside** (filtros em /galeria, sidebar em /orcamento) não
  precisa de z-index — `position: sticky` cria stacking context próprio.

## Regras de adição

1. Antes de adicionar um z-index novo: lê esse arquivo, encontra a faixa.
2. Não usa números arbitrários (ex: z-45, z-99) — fica fora do sistema.
3. Se precisa de algo "acima de modal mas abaixo de toast": redesign
   antes de inventar z-60.
