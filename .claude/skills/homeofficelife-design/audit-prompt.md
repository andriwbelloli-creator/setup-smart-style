# Auditoria End-to-End — HomeOfficeLife

> Prompt para Claude Code. Use junto com o skill `homeofficelife-design`.
> Leia o `product-rules.md` antes de começar.

---

## PROBLEMAS CRÍTICOS (implementar primeiro)

### 1. Inconsistência nos eixos de avaliação
- `AnaliseIA.jsx` usa 4 eixos (Ergonomia, Iluminação, Organização, Estética)
- `DiagnosticoCompleto.jsx` usa 10 eixos
- **Ação:** Padronizar para 10 eixos em TODOS os contextos de diagnóstico:
  Ergonomia, Iluminação, Organização, Gestão de cabos, Estética, Produtividade, Conforto, Profissionalismo em vídeo, Aproveitamento de espaço, Custo-benefício
- No resultado rápido (gratuito) mostrar os 4 piores com paywall nos outros 6

### 2. Falta seção "Como funciona" na home
- Hoje: Hero → AnaliseIA → Galeria → Loja → CTA
- **Ação:** Adicionar entre Hero e AnaliseIA:
  - 3 passos: "Envie uma foto" → "IA analisa em 30s" → "Receba plano de ação"
  - Ícones: Upload, Sparkles, Check
  - Visual: cards numerados (1, 2, 3) com ícone teal e texto curto

### 3. Falta FAQ
- **Ação:** Adicionar seção FAQ antes do CTA Premium na home com 5-6 perguntas:
  - "É grátis mesmo?" → "Sim, 3 análises sem cartão."
  - "Minhas fotos são publicadas?" → "Não. Só com sua autorização."
  - "Como a IA analisa?" → "Avaliamos ergonomia, iluminação, organização..."
  - "Posso cancelar?" → "Sim, a qualquer momento."
  - "Funciona no celular?" → "Sim, envie direto da câmera."
  - "Quanto custa?" → "Gratuito pra começar. Premium a partir de R$ 4,90/mês."

### 4. Trust signals no Hero
- **Ação:** Adicionar abaixo do CTA secundário:
  - Row com 3 chips: "✓ Sem cartão" · "✓ Fotos privadas" · "✓ Resultado em 30s"
  - Estilo: ícone check verde + texto small muted

### 5. Remover setup-creator.webp dos assets
- **Ação:** Excluir `assets/setup-creator.webp` — é equipamento isolado (tripé + ring light), viola regra de setup válido
- Atualizar qualquer referência restante

---

## PROBLEMAS IMPORTANTES (implementar depois dos críticos)

### 6. Navbar incompleta
- **Ação:** Adicionar "Categorias" ao array MAIN_LINKS no Navbar.jsx
- No mobile drawer, mostrar todos os links incluindo Pricing

### 7. Cards de setup sem CTA "Montar parecido"
- **Ação:** Adicionar botão outline "Montar parecido" nos cards de setup da galeria
- Touchpoint de conversão: leva pra lista de produtos do setup

### 8. Marketplace desconectado do diagnóstico
- **Ação:** Adicionar seção condicional no topo da Loja:
  "Produtos que melhorariam seu setup" (se o usuário já fez diagnóstico)
  Filtrar por problema detectado → produtos relevantes

### 9. Antes/Depois slider ausente na home
- **Ação:** Adicionar seção entre Galeria e Loja:
  - Slider com `setup-before.webp` e `setup-after.webp`
  - Controle de arrastar horizontal
  - Labels "ANTES" / "DEPOIS"
  - Stats: X setups na galeria · Y investimento médio
  - CTA: "Compartilhar minha transformação"

### 10. Galeria grid desequilibrada
- **Ação:** Usar 4 cards (par) ao invés de 5 na home, ou adicionar 1 setup extra
- Grid ímpar quebra visual em 2 colunas

### 11. Filtros vazios sem feedback
- **Ação:** Quando filtro retorna 0 resultados, mostrar empty state:
  "Nenhum setup nessa categoria ainda. Que tal postar o seu?"

---

## MELHORIAS VISUAIS (polimento)

### 12. Kits sem imagem
- **Ação:** Substituir a barra de cor no topo dos cards de kit por um ícone relevante:
  Kit básico = ícone mesa, Kit videochamadas = ícone câmera, etc.
  Usar ícones Lucide, não fotos

### 13. Loading IA com mais personalidade
- **Ação:** No AnaliseIA.jsx, adicionar mensagens que mudam durante o loading:
  "Analisando ergonomia..." → "Verificando iluminação..." → "Montando plano de ação..."
  Usar array com setInterval de 1.5s entre cada

### 14. Score ring no DiagnosticoCompleto
- **Ação:** Adicionar ring circular com nota geral (tipo conic-gradient) no topo
  Junto com o level badge (Básico → Setup dos sonhos)

### 15. Hover states mais ricos nos cards
- **Ação:** Adicionar ao hover dos setup cards:
  - Overlay sutil com "Ver setup" + ArrowRight
  - Scale da imagem 1.05 (já existe em alguns, padronizar)

---

## ORDEM DE IMPLEMENTAÇÃO

```
Prioridade 1 (conversão imediata):
  [1] Padronizar 10 eixos
  [2] Seção "Como funciona"
  [3] FAQ
  [4] Trust signals no hero
  [5] Remover setup-creator.webp

Prioridade 2 (engajamento):
  [6] Navbar completa
  [7] CTA "Montar parecido" nos cards
  [8] Marketplace contextual
  [9] Slider antes/depois

Prioridade 3 (polimento):
  [10] Grid par na galeria
  [11] Empty state nos filtros
  [12] Ícones nos kits
  [13] Loading messages
  [14] Score ring
  [15] Hover states
```

---

## REGRAS AO IMPLEMENTAR

- Sempre seguir `colors_and_type.css` — cream bg, teal primary, coral só pra IA
- Ícones: Lucide stroke 2 — nunca emoji, nunca SVG custom
- Copy: PT-BR, forma "você", verbos imperativos, números concretos
- Cards: rounded-3xl, border 1px, shadow-soft, hover:-translate-y-1
- Produtos: sempre ligados a problema real (ver `product-rules.md`)
- Setups: mínimo 3 elementos funcionais (ver regra de validação)
- Mobile first: botões grandes, CTA visível, scroll fluido
