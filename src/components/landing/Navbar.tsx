import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, LogOut, User, Crown, Bookmark, ArrowLeftRight, Menu, X } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useIsAdmin } from "@/hooks/use-is-admin";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

const linkBase = "text-sm font-medium text-muted-foreground transition-smooth hover:text-foreground";

const MAIN_LINKS = [
  { to: "/galeria", label: "Galeria" },
  { to: "/kits", label: "Kits" },
  { to: "/diagnostico", label: "Diagnóstico IA" },
  { to: "/consultoria", label: "Consultoria" },
  { to: "/blog", label: "Blog" },
  { to: "/orcamento", label: "Orçamentos" },
  { to: "/comunidade", label: "Comunidade" },
] as const;

export function Navbar() {
  const { user, signOut } = useAuth();
  const { isAdmin } = useIsAdmin();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Fecha o drawer ao apertar Esc
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMobileOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  // Trava scroll do body quando drawer aberto
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const handleSignOut = async () => {
    await signOut();
    toast.success("Você saiu da conta.");
    setMobileOpen(false);
    navigate({ to: "/" });
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-hero text-primary-foreground shadow-elegant">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-display text-lg font-bold tracking-tight">Deskly</span>
            <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">br · home office</span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 lg:flex xl:gap-8">
          {MAIN_LINKS.slice(0, 4).map((l) => (
            <Link key={l.to} to={l.to} className={linkBase} activeProps={{ className: "text-foreground" }}>
              {l.label}
            </Link>
          ))}
          <Link to="/premium" className="text-sm font-semibold text-primary transition-smooth hover:text-primary/80">
            Premium
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                <Link to="/postar">Postar setup</Link>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline max-w-[120px] truncate">{user.email}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel className="truncate">{user.email}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/perfil">Meu perfil</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/favoritos">
                      <Bookmark className="mr-2 h-4 w-4" /> Favoritos
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/comparar">
                      <ArrowLeftRight className="mr-2 h-4 w-4" /> Comparar setups
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/postar">Postar setup</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/diagnostico">Diagnóstico IA</Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuLabel className="text-xs uppercase tracking-wider text-muted-foreground">Admin</DropdownMenuLabel>
                      <DropdownMenuItem asChild>
                        <Link to="/dashboard/admin">
                          <Crown className="mr-2 h-4 w-4" /> Painel admin
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/dashboard/afiliados">Afiliados</Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" /> Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                <Link to="/auth">Entrar</Link>
              </Button>
              <Button asChild size="sm" className="hidden sm:inline-flex bg-gradient-hero shadow-elegant transition-smooth hover:shadow-glow">
                <Link to="/diagnostico">Avaliar meu setup</Link>
              </Button>
            </>
          )}

          {/* Hamburger — só aparece em <lg */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Abrir menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-foreground/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute right-0 top-0 flex h-full w-[85%] max-w-sm flex-col overflow-y-auto bg-background shadow-elegant">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <span className="font-display text-lg font-bold">Menu</span>
              <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)} aria-label="Fechar menu">
                <X className="h-5 w-5" />
              </Button>
            </div>

            <nav className="flex flex-col p-5">
              {MAIN_LINKS.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-xl px-3 py-3 text-base font-medium text-foreground transition-smooth hover:bg-secondary"
                  activeProps={{ className: "bg-primary/10 text-primary" }}
                >
                  {l.label}
                </Link>
              ))}
              <Link
                to="/premium"
                onClick={() => setMobileOpen(false)}
                className="mt-2 rounded-xl bg-gradient-hero px-3 py-3 text-base font-semibold text-primary-foreground shadow-elegant"
              >
                <Crown className="mr-2 inline h-4 w-4" /> Premium
              </Link>
            </nav>

            {user ? (
              <div className="mt-auto border-t border-border p-5">
                <div className="truncate pb-3 text-xs text-muted-foreground">{user.email}</div>
                <div className="space-y-1">
                  <MobileMenuLink to="/perfil" onClose={() => setMobileOpen(false)}>Meu perfil</MobileMenuLink>
                  <MobileMenuLink to="/favoritos" onClose={() => setMobileOpen(false)}>
                    <Bookmark className="mr-2 h-4 w-4" /> Favoritos
                  </MobileMenuLink>
                  <MobileMenuLink to="/comparar" onClose={() => setMobileOpen(false)}>
                    <ArrowLeftRight className="mr-2 h-4 w-4" /> Comparar setups
                  </MobileMenuLink>
                  <MobileMenuLink to="/postar" onClose={() => setMobileOpen(false)}>Postar setup</MobileMenuLink>
                  {isAdmin && (
                    <>
                      <div className="pt-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Admin</div>
                      <MobileMenuLink to="/dashboard/admin" onClose={() => setMobileOpen(false)}>
                        <Crown className="mr-2 h-4 w-4" /> Painel admin
                      </MobileMenuLink>
                      <MobileMenuLink to="/dashboard/afiliados" onClose={() => setMobileOpen(false)}>Afiliados</MobileMenuLink>
                    </>
                  )}
                </div>
                <button
                  onClick={handleSignOut}
                  className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-destructive hover:underline"
                >
                  <LogOut className="h-4 w-4" /> Sair
                </button>
              </div>
            ) : (
              <div className="mt-auto space-y-2 border-t border-border p-5">
                <Button asChild variant="outline" className="w-full" onClick={() => setMobileOpen(false)}>
                  <Link to="/auth">Entrar</Link>
                </Button>
                <Button asChild className="w-full bg-gradient-hero" onClick={() => setMobileOpen(false)}>
                  <Link to="/diagnostico">Avaliar meu setup</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

function MobileMenuLink({ to, onClose, children }: { to: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      onClick={onClose}
      className="flex items-center rounded-xl px-3 py-2 text-sm font-medium text-foreground transition-smooth hover:bg-secondary"
    >
      {children}
    </Link>
  );
}
