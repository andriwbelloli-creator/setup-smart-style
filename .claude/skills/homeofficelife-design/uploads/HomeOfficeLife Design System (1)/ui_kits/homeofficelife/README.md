# UI Kit: HomeOfficeLife Landing Page

Interactive recreation of the homeoffice.life landing page and core surfaces.

## Files

| File | What |
|---|---|
| `index.html` | Full interactive landing — Navbar, Hero (with AI upload), Diagnostic result, Gallery, Marketplace, Premium CTA, Footer |
| `components.jsx` | Shared primitives: Logo, Button, Card, Pill, Watermark, Icon set (Lucide inline SVGs) |
| `Navbar.jsx` | Sticky blurred navbar with mobile drawer |
| `Hero.jsx` | Hero section with drag-drop upload, floating product tag, AI score badge |
| `AnaliseIA.jsx` | AI diagnostic flow — loading animation → score axes → tips → product picks |
| `Galeria.jsx` | Community gallery with chip filters + setup cards |
| `Loja.jsx` | Marketplace section — listing cards + badges |
| `PremiumCTA.jsx` | Premium upsell island + newsletter footer |

## Interactive features

- **Click "Mandar foto"** → triggers the AI analysis flow below the hero
- **Click "Entrar"** → simulates a logged-in user (shows avatar + Postar setup)
- **Filter chips** in the gallery are functional
- **Like buttons** toggle on setup cards
- **Mobile hamburger** opens a slide drawer

## How to reuse

Each `.jsx` file exports its component to `window`. Import `components.jsx` first (it provides `Logo`, `Button`, `Card`, `Pill`, `Watermark`, `Icon`), then import the feature files. All depend on `colors_and_type.css` being available at `../../colors_and_type.css` relative to the kit root.
