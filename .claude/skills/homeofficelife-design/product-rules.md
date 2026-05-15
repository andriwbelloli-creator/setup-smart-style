# HomeOfficeLife — Regras de Produto e Recomendação

> Documento de referência para IA, designers e devs. Define a lógica de recomendação de produtos,
> touchpoints na jornada, e regras de validação. **OBRIGATÓRIO** ler antes de criar qualquer interface
> que envolva diagnóstico, produtos, kits ou galeria.

---

## 1. Regra de ouro: problema → produto

Toda recomendação de produto **deve** estar conectada a um problema real detectado pela IA.
Nunca recomendar produtos aleatórios ou genéricos.

**Correto:** "Monitor baixo" → Suporte para monitor, braço articulado
**Errado:** "Monitor baixo" → Cadeira gamer, quadro decorativo

---

## 2. Mapa problema → produtos recomendados

### Ergonomia
| Problema | Produtos corretos |
|---|---|
| Monitor/notebook baixo | Suporte p/ monitor, suporte p/ notebook, braço articulado |
| Cadeira inadequada | Cadeira ergonômica, almofada lombar |
| Falta apoio pés | Apoio para os pés |
| Postura ruim | Teclado externo, mouse externo, suporte notebook |
| Mesa inadequada | Mesa ajustável, mousepad ergonômico |

### Iluminação
| Problema | Produtos corretos |
|---|---|
| Ambiente escuro | Luminária de mesa, painel LED, lâmpada branca neutra |
| Sombra no rosto / contra-luz | Ring light discreto, luminária articulada |
| Reflexo na tela | Cortina translúcida, reposicionar iluminação |
| Pouca luz p/ vídeo | Ring light, painel LED, abajur com luz difusa |

### Organização de cabos
| Problema | Produtos corretos |
|---|---|
| Cabos aparentes/soltos | Organizador de cabos, canaleta, velcro p/ cabos |
| Filtro de linha visível | Caixa organizadora de fios, suporte sob mesa |
| Carregadores bagunçados | Hub USB, presilhas adesivas, passa-cabos |

### Produtividade
| Problema | Produtos corretos |
|---|---|
| Tela pequena | Monitor externo, suporte p/ monitor |
| Falta periféricos | Teclado, mouse, hub USB, dock station |
| Pouco espaço | Organizador de mesa, prateleira, gaveteiro |
| Setup improvisado | Mousepad grande, suporte celular |

### Profissionalismo em vídeo
| Problema | Produtos corretos |
|---|---|
| Câmera mal posicionada | Webcam, suporte p/ notebook |
| Iluminação ruim | Ring light, luminária |
| Fundo poluído | Painel neutro, organizador de mesa |
| Áudio ruim | Microfone USB, headset |

### Conforto
| Problema | Produtos corretos |
|---|---|
| Cadeira desconfortável | Cadeira ergonômica, almofada lombar |
| Falta apoio | Apoio p/ pés, suporte p/ braço |
| Espaço apertado | Mesa maior, organizador vertical |
| Cansativo p/ horas longas | Mouse ergonômico, teclado confortável, luminária suave |

### Estética e ambiente
| Problema | Produtos corretos |
|---|---|
| Mesa poluída | Organizador de mesa, gaveteiro |
| Cabos aparentes | Canaleta, organizador de cabos |
| Baixa harmonia visual | Mousepad grande, suporte monitor, prateleira |

---

## 3. Produtos sempre válidos (funcionais, replicáveis, fáceis de encontrar no BR)

- Suporte para notebook / monitor / braço articulado
- Cadeira ergonômica · Almofada lombar · Apoio para pés
- Mesa / mesa ajustável
- Luminária de mesa · Ring light · Painel LED
- Teclado · Mouse · Mousepad grande
- Organizador de cabos · Canaleta · Velcro · Caixa de fios
- Hub USB · Dock station · Adaptador HDMI/USB-C
- Webcam · Microfone USB · Headset
- Prateleira · Gaveteiro · Organizador de mesa
- Filtro de linha · Régua de tomadas
- Base refrigerada · Suporte celular

## 4. Produtos PROIBIDOS de recomendar

- Quadros/posters muito específicos
- Bonecos, action figures, colecionáveis
- Objetos decorativos únicos/artesanais
- Peças vintage raras
- Plantas muito específicas
- Móveis sob medida complexos
- Produtos raros / sem disponibilidade fácil no BR
- Qualquer item puramente decorativo sem função no setup

---

## 5. Touchpoints na jornada do usuário

### Fase 1 — Antes da análise (foco: DIAGNÓSTICO, não venda)
- Hero homepage → CTA "Analisar meu setup grátis"
- Exemplos visuais de resultado
- Prova social (12k+ setups, 4.9★)
- Trust: "Sem cartão", "Suas fotos são privadas", "3 análises grátis"
- **NÃO vender produtos nessa fase**

### Fase 2 — Resultado da análise (foco: VALOR + RECOMENDAÇÃO CONTEXTUAL)
- Nota geral + notas por categoria
- Problemas encontrados com ícones visuais
- Recomendações priorizadas (o que melhorar primeiro)
- Produtos **ligados ao problema** (não aleatórios)
- Melhorias por orçamento (até R$50 / R$100 / R$300 / R$700)
- CTA: "Salvar plano de ação"
- CTA: "Desbloquear análise completa" (paywall)

### Fase 3 — Pós-resultado (foco: CONVERSÃO)
- "Ver produtos recomendados" → afiliados
- "Adicionar à wishlist"
- "Ver usado no marketplace"
- "Montar setup parecido" → galeria
- "Comparar antes/depois"
- "Desbloquear relatório PDF" → Premium
- CTA Premium: "Melhorar meu setup por R$ 4,90/mês"

### Fase 4 — Galeria da comunidade (foco: INSPIRAÇÃO → AÇÃO)
- Cards de setups **completos** (≥3 elementos)
- Nota + categoria profissional + investimento + cidade
- "Montar parecido" → lista de produtos
- "Ver produtos desse setup"
- "Analisar meu setup" sempre visível

### Fase 5 — Wishlist (foco: REATIVAÇÃO)
- Produtos salvos com prioridade de compra
- Impacto estimado na nota: "Esse suporte pode +12 pontos em ergonomia"
- Alternativas usadas do marketplace
- Alertas de preço

### Fase 6 — Marketplace (foco: COMPRA/VENDA C2C)
- Produtos usados **relacionados ao diagnóstico do usuário**
- Filtros: categoria, condição, preço, localização
- "Produtos com maior impacto no seu setup"
- "Vender meu item" (0% taxa)

### Fase 7 — Kits (foco: SOLUÇÃO COMPLETA)
- Kits por profissão e orçamento
- Apenas produtos funcionais e replicáveis
- Preço total + impacto esperado
- Mix: afiliados (novo) + marketplace (usado)

---

## 6. Paywall suave

**Gratuito mostra:**
- Nota geral
- 3 recomendações principais
- 1 produto recomendado
- Prévia do plano de ação

**Premium desbloqueia:**
- 10 categorias completas
- Recomendações por orçamento
- Lista completa de produtos
- Relatório / comparação / histórico
- Wishlist ilimitada

**CTA:** "Desbloquear análise completa por R$ 4,90/mês"

---

## 7. Pricing (fase de validação)

| Plano | Preço | Posicionamento |
|---|---|---|
| Gratuito | R$ 0 | 3 análises, galeria, wishlist limitada |
| Premium | R$ 4,90/mês | "Mais popular" · badge "Preço de lançamento" |
| Pro | R$ 9,90/mês | Relatório PDF, selo Pro, insights criadores |

- Consultoria 1:1 = add-on separado, nunca inclusa em plano barato
- "Cancele quando quiser · Sem fidelidade"

---

## 8. Regras de validação de setup (recap)

- **Mínimo 3 elementos funcionais** combinados
- Deve mostrar contexto de uso real
- Deve permitir análise de ergonomia/iluminação/organização
- Nunca produto isolado em fundo branco
- Aplicar em: galeria, cards, kits, hero, categorias, exemplos

---

## 9. Trust signals obrigatórios (site novo)

Incluir em touchpoints relevantes:
- "Sem cartão no plano grátis"
- "Você controla suas imagens"
- "Não publicamos sem autorização"
- "Cancele quando quiser"
- "Suas fotos são usadas apenas para gerar a análise"
- "Resultado em poucos segundos"
- FAQ simples
- Exemplos antes/depois
