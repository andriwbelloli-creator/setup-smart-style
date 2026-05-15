## Design System — HomeOfficeLife

Sempre use o skill em `.claude/skills/homeofficelife-design/` para qualquer tarefa de UI, design ou front-end.

### Antes de criar qualquer interface:
1. Leia o `README.md` do skill (contexto do produto, tom de voz, visual foundations)
2. Use os tokens de `colors_and_type.css` (cores, tipografia, espaçamento, sombras, gradientes)
3. Copie assets de `assets/` (logo, fotos, ícones)
4. Referência os componentes em `preview/` e `ui_kits/` como base visual

### Regras visuais obrigatórias:
- Background: cream (#FBF8F1), nunca branco puro
- Primary: deep teal (oklch 0.42 0.07 195)
- Accent: coral (#F36458) — só para IA e momentos premium
- Títulos: Space Grotesk 700, letter-spacing -0.025em
- Corpo: DM Sans 400/500/600/700
- Ícones: Lucide (stroke 2, currentColor)
- Cards: rounded-3xl, border 1px, shadow-soft, hover:-translate-y-1
- Corners generosos: base 1rem, nunca cantos retos
- Sombras com tinta teal, nunca preto puro
- Dark mode: ativar com class="dark" no html/body

### Tom de voz (PT-BR):
- Direto, brasileiro, forma "você"
- Verbos imperativos: "Avalie", "Descubra", "Melhore"
- Números concretos: "3 análises grátis", "em 30 segundos", "R$ 4,90/mês"
- Sem jargão SaaS em inglês
- Emoji só: ✨ (IA) e 🔥 (trending)

### Pricing:
- Gratuito R$ 0 | Premium R$ 4,90/mês | Pro R$ 9,90/mês
- Badge: "Preço especial de lançamento"

### Validação de setups — OBRIGATÓRIO:
- Nunca usar imagens de um único objeto isolado como "setup"
- Todo setup deve ter pelo menos 3 elementos funcionais combinados
- Exemplo válido: mesa + cadeira + notebook + iluminação
- Exemplo inválido: só uma cadeira, só um monitor, só um teclado
- Aplicar em galeria, cards, exemplos, kits, hero, categorias

### Não fazer:
- Não usar gradientes azul-roxo
- Não usar emoji como ícone
- Não usar cards com borda-esquerda colorida
- Não inventar SVGs — usar Lucide ou placeholders
- Não usar cinza frio — neutrals têm subtom teal
- Não usar imagens de produto isolado como setup

### Recomendação de produtos — OBRIGATÓRIO:
- SEMPRE ler `product-rules.md` do skill antes de criar interfaces de diagnóstico, produtos, kits ou galeria
- Todo produto recomendado deve estar conectado a um problema real da IA (ex: "monitor baixo" → suporte)
- Nunca recomendar produtos aleatórios, decorativos, raros ou difíceis de encontrar no Brasil
- Seguir o mapa de touchpoints: antes da análise = foco em diagnóstico, NÃO vender; resultado = produtos contextuais; pós-resultado = conversão
- Produtos válidos: suportes, cadeiras, luminária, teclado, mouse, organizador cabos, webcam, mic, mesa, hub USB
- Produtos proibidos: quadros, bonecos, colecionáveis, decoração artesanal, peças vintage, plantas específicas
