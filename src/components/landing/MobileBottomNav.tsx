import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Images, Camera, Bookmark, User } from "lucide-react";

// Bottom nav fixa pra mobile, conforme mobile-ux.md do skill.
// Não aparece em desktop (lg+) — lá o Navbar do topo já cobre tudo.
//
// 5 itens com "Analisar" central destacado (maior, coral, ícone câmera).
//
// Importante: rotas autenticadas (perfil/favoritos) levam pra /auth se
// usuário deslogado — o próprio route guard cuida. Aqui só renderiza o link.
type Item = {
  to: string;
  label: string;
  icon: typeof Home;
  featured?: boolean;
};

const ITEMS: Item[] = [
  { to: "/", label: "Início", icon: Home },
  { to: "/galeria", label: "Galeria", icon: Images },
  { to: "/diagnostico", label: "Analisar", icon: Camera, featured: true },
  { to: "/favoritos", label: "Salvos", icon: Bookmark },
  { to: "/perfil", label: "Perfil", icon: User },
];

export function MobileBottomNav() {
  const path = useRouterState({ select: (s) => s.location.pathname });

  return (
    <>
      {/* Spacer pra não esconder conteúdo embaixo do nav fixo */}
      <div className="h-20 lg:hidden" aria-hidden="true" />

      <nav
        className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden"
        aria-label="Navegação principal mobile"
      >
        <ul className="grid grid-cols-5 items-end">
          {ITEMS.map((item) => {
            const active = path === item.to || (item.to !== "/" && path.startsWith(item.to));
            const Icon = item.icon;

            if (item.featured) {
              // Botão central destacado — círculo coral elevado.
              return (
                <li key={item.to} className="flex items-center justify-center">
                  <Link
                    to={item.to}
                    aria-label={item.label}
                    className="relative flex h-16 w-16 -translate-y-6 items-center justify-center rounded-full bg-gradient-hero text-primary-foreground shadow-elegant transition-smooth active:scale-95"
                  >
                    <Icon className="h-7 w-7" aria-hidden="true" />
                    <span className="sr-only">{item.label}</span>
                  </Link>
                </li>
              );
            }

            return (
              <li key={item.to}>
                <Link
                  to={item.to}
                  aria-current={active ? "page" : undefined}
                  className={`flex h-16 flex-col items-center justify-center gap-1 text-[10px] font-semibold transition-smooth ${
                    active ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  <Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 2} aria-hidden="true" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
