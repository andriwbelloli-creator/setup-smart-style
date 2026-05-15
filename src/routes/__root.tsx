import { Outlet, Link, createRootRoute, HeadContent, Scripts, useRouterState } from "@tanstack/react-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { lazy, Suspense } from "react";

import appCss from "../styles.css?url";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/hooks/use-auth";
import { HoneypotLink } from "@/components/HoneypotLink";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { MetaPixel } from "@/components/MetaPixel";
import { PWAInstall } from "@/components/PWAInstall";
import { queryClient } from "@/lib/query-client";

// Componentes não-críticos pra paint inicial: lazy + Suspense vazio
// pra não bloquear o LCP. Cada um vira chunk próprio.
const CookieBanner    = lazy(() => import("@/components/CookieBanner").then((m) => ({ default: m.CookieBanner })));
const ExitIntentModal = lazy(() => import("@/components/ExitIntentModal").then((m) => ({ default: m.ExitIntentModal })));
const FeedbackWidget  = lazy(() => import("@/components/FeedbackWidget").then((m) => ({ default: m.FeedbackWidget })));
const NPSWidget       = lazy(() => import("@/components/NPSWidget").then((m) => ({ default: m.NPSWidget })));
const OnboardingTour  = lazy(() => import("@/components/OnboardingTour").then((m) => ({ default: m.OnboardingTour })));
import { useHeatmapTracking } from "@/hooks/use-heatmap-tracking";
import "@fontsource/space-grotesk/400.css";
import "@fontsource/space-grotesk/500.css";
import "@fontsource/space-grotesk/600.css";
import "@fontsource/space-grotesk/700.css";
import "@fontsource/dm-sans/400.css";
import "@fontsource/dm-sans/500.css";
import "@fontsource/dm-sans/600.css";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "HomeOfficeLife — Avalie seu home office com IA" },
      { name: "description", content: "Plataforma brasileira para montar, avaliar e melhorar seu home office com IA, loja de usados, kits curados e inspiração da comunidade." },
      { property: "og:title", content: "HomeOfficeLife — Avalie seu home office com IA" },
      { property: "og:description", content: "Envie a foto do seu setup e receba nota de IA + sugestões de upgrades com preço de Brasil." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://homeofficelife.com.br" },
      { property: "og:site_name", content: "HomeOfficeLife" },
      { property: "og:image", content: "https://homeofficelife.com.br/og-image-v2.png" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "HomeOfficeLife — diagnóstico de home office com IA, nota geral 8.3/10 e 6 critérios avaliados" },
      { property: "og:image:type", content: "image/png" },
      { property: "og:locale", content: "pt_BR" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "HomeOfficeLife — Avalie seu home office com IA" },
      { name: "twitter:description", content: "Envie a foto do seu setup e receba nota de IA + sugestões de upgrades com preço de Brasil." },
      { name: "twitter:image", content: "https://homeofficelife.com.br/og-image-v2.png" },
      { name: "twitter:image:alt", content: "Plataforma HomeOfficeLife — diagnóstico de home office por IA com nota e upgrades" },
      // PWA / mobile install metadata
      { name: "theme-color", content: "#0d6e6e" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "default" },
      { name: "apple-mobile-web-app-title", content: "HomeOfficeLife" },
      { name: "mobile-web-app-capable", content: "yes" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "apple-touch-icon", href: "/icons/icon-180.png" },
      { rel: "manifest", href: "/manifest.json" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function CanonicalTag() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  // Canonical sem query params (UTMs, ?ref=) pra evitar conteúdo duplicado.
  const href = `https://homeofficelife.com.br${path === "/" ? "" : path}`;
  return <link rel="canonical" href={href} />;
}

function RootComponent() {
  // Heatmap tracking: click + scroll depth. Hook é no-op se cookie consent
  // ainda não foi aceito (LGPD).
  useHeatmapTracking();

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          {/* Skip-to-content — WCAG 2.4.1 (Bypass Blocks). Aparece só com Tab. */}
          <a href="#main-content" className="skip-to-content">
            Pular para o conteúdo
          </a>
          <CanonicalTag />
          <MetaPixel />
          <PWAInstall />
          <Outlet />
          <Toaster />
          <HoneypotLink />
          <Suspense fallback={null}>
            <CookieBanner />
            <ExitIntentModal />
            <FeedbackWidget />
            <NPSWidget />
            <OnboardingTour />
          </Suspense>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
