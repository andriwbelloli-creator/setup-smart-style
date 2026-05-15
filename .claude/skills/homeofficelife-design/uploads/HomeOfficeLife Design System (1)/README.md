# HomeOfficeLife Design System

> AI-powered home office gallery, diagnosis & marketplace for Brazil.
> Domain: **homeofficelife.com.br** · Language: **PT-BR**.

This design system is a working kit for designing inside the **HomeOfficeLife** product surface — its landing pages, app screens, marketing decks, slides, and prototypes. Everything here is derived from the production codebase.

---

## What is HomeOfficeLife?

HomeOfficeLife (the wordmark uses `homeoffice` + lighter-weight `life`) is a Brazilian platform that helps remote workers **set up, evaluate, and improve their home office**. It composes a few products into one experience:

| Surface | What it does |
|---|---|
| **Diagnóstico IA** | User uploads a photo of their setup → AI returns a 0–10 score plus tips on ergonomics, lighting, organization. Free tier = 3 lifetime analyses. |
| **Galeria** | Curated wall of real home-office photos from the BR community (filterable by Dev, Designer, Minimalista, Gamer, Creator, Apê pequeno, MacBook). |
| **Marketplace** | Peer-to-peer used-gear listings (monitor, cadeira, mesa) — 0% taxa, proposals direct between buyer & seller. |
| **Kits** | Curated "shopping lists" linking to Amazon BR / Mercado Livre / Kabum (affiliate). |
| **Premium** | R$ 9,90/mês — unlimited AI analyses, prioritised buy-list, 1:1 Enterprise consultoria. |
| **Comunidade · Blog · Orçamentos** | Supporting surfaces. |

The brand is warm, practical, and Brazilian-first. Not "tech for tech's sake" — it's tech *to make your apê work*.

## Sources used to build this system

- **GitHub:** `andriwbelloli-creator/setup-smart-style` @ `main`
  → <https://github.com/andriwbelloli-creator/setup-smart-style>
  Tanstack Start + React 19 + Tailwind v4 + shadcn/Radix. Files inspected: `src/styles.css`, `src/components/brand/Logo.tsx`, `src/components/landing/*` (Hero, Navbar, CTA, Galeria, AntesDepois, MarketplaceSection, FerramentasSetup, ComoFunciona), `src/components/setup/SetupCard.tsx` + `WatermarkOverlay.tsx`, `src/components/marketplace/ListingCard.tsx`, `src/components/ui/{button,card,badge,input}.tsx`, `public/favicon.svg`, `src/assets/*.webp`.
- **Production site:** homeofficelife.com.br (referenced but not crawled).

The note in the original brief mentioned a `brand-watermark-setups/` subtree — that path doesn't exist on `main`; the WatermarkOverlay component and image-watermark convention are spread across `src/components/setup/` and the seed gallery images instead. We pulled those.

> **Want a deeper system?** The repo carries far more — full route files for diagnóstico, marketplace, premium, dashboards, plus a real shadcn UI primitives library under `src/components/ui/`. Recommend cloning it locally and reading from there for production work.

---

## Content fundamentals

Everything is **Portuguese (BR)** — copy is in *você* form, never *vocês* / *tu*, never English-mixed except for established loan-words (*home office*, *setup*, *kit*, *blog*).

**Voice:** confident, warm, practical. Reads like a Brazilian friend who knows their stuff. Direct verbs ("Avalie", "Descubra", "Compre"), specific numbers ("3 análises gratuitas", "em 30 segundos", "12k+ setups", "R$ 9,90/mês"), and zero corporate hedging.

**Casing:** sentence case for headlines (`Descubra a nota do seu setup`), Title Case avoided except in product names (`Diagnóstico IA`, `Premium`). Eyebrows are ALL CAPS with letter-spacing (`IA BRASILEIRA · DIAGNÓSTICO EM 30 SEGUNDOS`). Buttons are sentence-case imperative.

**Emoji:** sparingly. Coral sparkle ✨ for AI moments, 🔥 for trending. Not on every block.

**Punctuation tics:**
- En-dashes for spacing thoughts: `Anunciar é grátis — sem taxa, sem pegadinha.`
- Mid-dots between metadata: `Designer · São Paulo, SP`
- BRL formatting: `R$ 2.799`, `R$ 9,90/mês` (Brazilian decimal/thousands)
- 4.9★ uses the unicode star, never a substitute

**Concrete examples (lifted from production):**
- H1: "Descubra a **nota do seu setup** e como melhorá-lo com IA."
- Eyebrow: "⚡ IA brasileira · Diagnóstico em 30 segundos"
- Subhead: "Envie a foto do seu home office e receba **nota de ergonomia, iluminação, organização** + dicas com produtos reais do Brasil."
- Tip: "3 análises gratuitas — sem cartão, sem pegadinha."
- Empty state: "Seja o primeiro a anunciar. Mesa, monitor ou cadeira parada? Coloque a venda."
- Newsletter: "3 setups + 1 dica de upgrade, toda semana. Curadoria editorial. Sem spam. Cancela em 1 clique."

**Don'ts:**
- Don't English-mix unnecessarily ("Insights" / "Score" → use *Análise* / *Nota*).
- Don't soften the value prop ("uma plataforma que talvez possa ajudar você a melhorar…") — be specific.
- Don't use stock SaaS phrases ("Empower your remote journey").

---

## Visual foundations

### Vibe in one line
Warm cream + deep teal + wood, with a single hot coral spark where the AI does its thing.

### Color
- **Primary** — deep teal (`oklch(0.42 0.07 195)` / favicon hex `#0E3D3F`). Used for h-mark, primary buttons, hero gradient, focus ring.
- **Accent / Coral** — `oklch(0.72 0.18 35)` / `#F36458`. The "sparkle" — used **only** for AI moments, premium CTAs, trending badges. Not a decoration; it signals product magic.
- **Wood** — `oklch(0.62 0.09 55)` / `#B5854A`. Appears in imagery (real wood desks) and in supporting stats / badges.
- **Cream** — `oklch(0.98 0.012 85)` / `#FBF8F1`. Page background — never pure white.
- **Ink** — `oklch(0.18 0.025 200)` — text foreground, has a faint teal undertone (NOT pure black).
- **Semantics** — Success (`tea green` 155°), Warning (warm amber 75°), Info (calm blue 220°), Destructive (red 27°). All tuned to harmonise with the warm palette — no neon greens.

### Type
- **Display** → `Space Grotesk` weights 400 / 500 / 600 / 700. `letter-spacing: -0.025em` on headlines, `line-height: 1.1`.
- **Body / UI** → `DM Sans` (variable, opsz 9..40). `font-feature-settings: "ss01", "cv11"`.
- **Mono** → system mono — used only in code blocks / hex labels.
- Scale is **major third (1.25×)** — h1 ≈ 49–61px (clamped responsive), h6 = 20px, body = 16px, small = 13/14px.
- All headlines `font-weight: 700`. No serif.

### Spacing & layout
- **4-px base**, Tailwind-style numeric scale (`space-1` = 4 … `space-20` = 80).
- **Section rhythm** — `py-14 md:py-20` (56→80px) between landing sections; `py-20 md:py-28` for headline sections.
- **Container** — `container mx-auto px-4 md:px-6` (≈ 1280 max width, 16–24px gutter).
- **Reading width** — `container-prose` caps at 65ch for blog / long-form.

### Corners
Generous. Base `--radius: 1rem`. Cards use `rounded-2xl` / `rounded-3xl` (20–28px). Buttons `rounded-md` (14px) at default size, `rounded-full` for pills, chips and CTA buttons. Inputs at 14px. **No sharp corners** anywhere in the system — even watermark chips are rounded.

### Shadows
Four named shadows, layered for purpose:
- `--shadow-soft` → default card shadow, barely-there.
- `--shadow-elegant` → hover state on cards / hero CTA / sticky elements.
- `--shadow-glow` → primary button hover, drag-over state on upload zone.
- `--shadow-coral` → premium / "AI magic" CTAs.

All shadows use **teal-tinted ink** (`oklch(0.18 0.025 200 / α)` or `oklch(0.32 0.06 195 / α)`), not pure black — preserves warmth.

### Borders & cards
Cards: `1px solid var(--border)` + `--shadow-soft` + `var(--card)` (pure white). On featured: `border-primary/40 ring-2 ring-primary/20`. Dashed borders only for **drop zones** and **empty states** (`border-2 border-dashed`).

### Backgrounds
- Page-level → solid cream (`--background`), no full-bleed photos behind copy.
- Hero & accent sections → `bg-gradient-mesh` (three soft radial blooms — teal at 20/20, coral at 80/0, wood at 80/100) layered over cream. Subtle, not loud.
- Imagery is **real photographs of home offices** — warm interiors with wood, plants, deep teal walls. The watermark `HOMEOFFICELIFE.COM.BR` is burned into the top-left of every gallery image (mix-blend-mode `difference` so it adapts to background).
- No hand-drawn illustrations. No abstract SaaS shapes. No emoji cards.

### Gradients (3 named tokens — use only these)
- `--gradient-hero` (135°, deep teal → mid teal → teal-cyan) — hero CTAs, premium card backplate.
- `--gradient-warm` (135°, coral → wood) — used **as text mask** on accent words ("setup dos sonhos", "apartamentos brasileiros"), never as a full background.
- `--gradient-mesh` — three radial blooms; section backgrounds only.

### Animation
- **Easing** → `--ease-smooth` = `cubic-bezier(0.22, 1, 0.36, 1)` — slow start, snappy out. Default duration `300ms`.
- **Animations defined** → `float` (6s vertical bob), `fade-up` (0.8s entry from below), `shimmer` (skeleton loaders).
- **Reduced motion** → fully respected. `prefers-reduced-motion: reduce` cuts all animations to 0.01ms.
- **Hover lift** is the signature: `hover:-translate-y-1 hover:shadow-elegant` on every card.
- No bounces, no spring physics, no parallax.

### Hover & press states
- **Buttons (default)** → `hover:bg-primary/90` (mild darken).
- **Hero gradient button** → `hover:shadow-glow hover:scale-[1.02]`.
- **Coral / premium** → `hover:scale-105`.
- **Cards** → `-translate-y-1 shadow-elegant`.
- **Ghost / link** → underline appears on hover, no fill change.
- **Press** → opacity drop only — no shrink.
- **Focus visible** → `outline: 2px solid var(--ring); outline-offset: 2px` — universal, applied via `*:focus-visible`.

### Transparency & blur
Used carefully, three places:
1. **Sticky navbar** — `bg-background/85 backdrop-blur-xl border-b border-border/40`.
2. **Image overlays** (drop-zones, mobile drawer scrim) — `bg-foreground/55 backdrop-blur-[2px]`.
3. **Glass pills floating over photos** — `bg-card/95 backdrop-blur` for scores, prices, condition tags.

Never used for chrome decoration. Never frosted-glass cards on plain bg.

### Layout rules
- Nav stays sticky, 64px tall, full-bleed but content centred via container.
- Hero is **always** a 1.1 / 1 split on desktop (copy left, photo right), stacked on mobile.
- Gallery is **2 columns on desktop, horizontal-scroll on mobile** — never 3-up dense.
- Marketplace previews are 3-up on desktop, scroll on mobile.
- CTA islands sit in `bg-gradient-hero` cards with `rounded-[2rem]` and `shadow-elegant`.

---

## Iconography

Single source: **Lucide React** (`lucide-react`, v0.575). Stroke `2`, rounded line caps & joins, default 16–24px depending on context.

- **No icon font, no inline custom SVG library, no emoji-as-icon**. Real SVGs only.
- Icons inherit color via `stroke="currentColor"` — they tint with text automatically.
- Common icons in the product: `Upload`, `Zap` (AI), `Star`, `Search`, `ShoppingBag`, `Heart`, `Bookmark`, `Camera`, `Send`, `ArrowRight`, `Plus`, `X`, `MapPin`, `Crown` (premium), `Tag`, `Flame` (trending), `Check`, `Sparkles`, `ArrowLeftRight` (compare), `MessageCircle`.
- Sizes: `size-3` (12) micro labels, `size-4` (16) inline, `size-5` (20) buttons, `size-6` (24) feature cards, `size-10` (40) hero illustrations.
- **Brand sparkle** in the logo is **not** a Lucide star — it's a custom 4-point diamond drawn in `Logo.tsx`. Don't substitute.

### To use in HTML artifacts
Either copy individual SVG paths from `lucide.dev/icons/<name>`, or load the runtime tag at the top of the page:

```html
<script src="https://unpkg.com/lucide@0.575.0/dist/umd/lucide.min.js"></script>
<i data-lucide="zap"></i>
<script>lucide.createIcons();</script>
```

---

## Index — what's in this folder

| Path | What |
|---|---|
| `README.md` | This file. |
| `SKILL.md` | Skill manifest — read if invoked via the design skill. |
| `colors_and_type.css` | Single source of truth — drop-in `<link>` for any HTML artifact. |
| `assets/` | Logo (PNG + favicon SVG), OG image, app icons, sample setup photographs (hero, before/after, minimal/creator/gamer/compact), Logo.tsx reference. |
| `preview/` | Design-system tab cards (HTML, registered as assets). Use as reference for component recipes. |
| `ui_kits/homeofficelife/` | High-fidelity recreation of the landing page + key screens with reusable JSX components. Open `index.html` to interact. |

---

## Redesign brief (reference copy)

The product owner provided a detailed redesign document. Key additions from that brief:

**Expanded scoring categories** (10 axes vs. current 4):
Ergonomia, Iluminação, Organização, Gestão de cabos, Estética, Produtividade, Conforto, Profissionalismo em vídeo, Aproveitamento de espaço, Custo-benefício.

**Updated pricing (validation phase):**
- Gratuito: R$ 0 (3 análises)
- Premium: R$ 4,90/mês ("Preço especial de lançamento")
- Pro: R$ 9,90/mês
- Strategy: start cheap, validate conversions, raise later. Badge: "Preço especial de lançamento."

**Level badges for setup scores:**
Básico → Bom → Otimizado → Profissional → Setup dos sonhos

**Professional categories** (beyond dev/designer/gamer):
Médicos, Psicólogos, Advogados, Professores, Autônomos, Consultores, Criadores de conteúdo, Estudantes, Executivos.

**Budget-tier improvement suggestions:**
Até R$ 50 · Até R$ 100 · Até R$ 300 · Até R$ 700 · Setup completo.

**Kit templates:**
Kit Home Office Básico, Kit Psicólogo Online, Kit Professor Online, Kit Dev Produtivo, Kit Designer Criativo, Kit Criador de Conteúdo, Kit Gamer Clean, Kit Minimalista, Kit Premium Executivo, Kit Apartamento Pequeno, Kit Reuniões Online.

**Key conversion copy:**
- "Analisar meu setup grátis"
- "Ver meu plano de ação"
- "Desbloquear análise completa"
- "Montar um setup parecido"
- "Melhorar meu setup por R$ 4,90"
- "Com até R$ 100 você já consegue melhorar sua postura."

**Trust signals for a new site:**
"Suas fotos são usadas apenas para gerar a análise." / "Você decide se quer publicar seu setup na comunidade." / "Cancele quando quiser." / "Sem cartão no plano gratuito."

> The full brief is stored in the project history. Use these directives when generating copy, screens, or decks for the HomeOfficeLife brand.

---

## Caveats & substitutions

- **Fonts** → DM Sans + Space Grotesk loaded from Google Fonts CDN. The product ships them via `@fontsource/*` packages — swap to those for production. **No font substitution needed**; both are the originals on Google Fonts.
- **Icons** → Lucide is what the product uses; we link/inline Lucide paths directly. No substitutions.
- **Imagery** → 6 real setup photos were imported. The watermark in those is burned in, not overlay-rendered.
- **Brand watermark setups subtree** mentioned in brief did not exist on `main`. We sourced the watermark convention from `WatermarkOverlay.tsx` and used the existing seed gallery photos.
- **Lovable/AI provenance** — repo has `.lovable/` + `lovable.dev` config; brand was AI-assisted but the visual decisions are coherent and we honoured them as-given.
