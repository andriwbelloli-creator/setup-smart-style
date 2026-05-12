import { Outlet, Link, createRootRoute, HeadContent, Scripts, useRouterState } from "@tanstack/react-router";
import { QueryClientProvider } from "@tanstack/react-query";

import appCss from "../styles.css?url";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/hooks/use-auth";
import { CookieBanner } from "@/components/CookieBanner";
import { HoneypotLink } from "@/components/HoneypotLink";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ExitIntentModal } from "@/components/ExitIntentModal";
import { queryClient } from "@/lib/query-client";
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
      { name: "description", content: "Plataforma brasileira para montar, avaliar e melhorar seu home office com IA, produtos reais (Amazon BR, Mercado Livre, Kabum, Magalu) e inspiração da comunidade." },
      { property: "og:title", content: "HomeOfficeLife — Avalie seu home office com IA" },
      { property: "og:description", content: "Envie a foto do seu setup e receba nota de IA + sugestões de upgrades com preço de Brasil." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://homeofficelife.com.br" },
      { property: "og:image", content: "https://homeofficelife.com.br/og-image.jpg" },
      { property: "og:locale", content: "pt_BR" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "HomeOfficeLife — Avalie seu home office com IA" },
      { name: "twitter:description", content: "Envie a foto do seu setup e receba nota de IA + sugestões de upgrades com preço de Brasil." },
      { name: "twitter:image", content: "https://homeofficelife.com.br/og-image.jpg" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
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
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <CanonicalTag />
          <Outlet />
          <Toaster />
          <CookieBanner />
          <HoneypotLink />
          <ExitIntentModal />
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
