import { Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Sparkles, LogOut, User, Crown } from "lucide-react";
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

export function Navbar() {
  const { user, signOut } = useAuth();
  const { isAdmin } = useIsAdmin();
  const navigate = useNavigate();
  const handleSignOut = async () => {
    await signOut();
    toast.success("Você saiu da conta.");
    navigate({ to: "/" });
  };
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
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
        <nav className="hidden items-center gap-8 md:flex">
          <Link to="/galeria" className={linkBase} activeProps={{ className: "text-foreground" }}>Galeria</Link>
          <Link to="/orcamento" className={linkBase} activeProps={{ className: "text-foreground" }}>Orçamentos</Link>
          <Link to="/diagnostico" className={linkBase} activeProps={{ className: "text-foreground" }}>Diagnóstico IA</Link>
          <Link to="/comunidade" className={linkBase} activeProps={{ className: "text-foreground" }}>Comunidade</Link>
          <Link to="/premium" className="text-sm font-semibold text-primary transition-smooth hover:text-primary/80">Premium</Link>
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
              <Button asChild size="sm" className="bg-gradient-hero shadow-elegant transition-smooth hover:shadow-glow">
                <Link to="/diagnostico">Avaliar meu setup</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
