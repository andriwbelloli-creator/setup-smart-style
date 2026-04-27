import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-hero text-primary-foreground shadow-elegant">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-display text-lg font-bold tracking-tight">Setup Lab</span>
            <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">br</span>
          </div>
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          <a href="#analise" className="text-sm font-medium text-muted-foreground transition-smooth hover:text-foreground">Análise IA</a>
          <a href="#galeria" className="text-sm font-medium text-muted-foreground transition-smooth hover:text-foreground">Galeria</a>
          <a href="#orcamento" className="text-sm font-medium text-muted-foreground transition-smooth hover:text-foreground">Por orçamento</a>
          <a href="#antes-depois" className="text-sm font-medium text-muted-foreground transition-smooth hover:text-foreground">Antes & Depois</a>
        </nav>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="hidden sm:inline-flex">Entrar</Button>
          <Button size="sm" className="bg-gradient-hero shadow-elegant transition-smooth hover:shadow-glow">
            Avaliar meu setup
          </Button>
        </div>
      </div>
    </header>
  );
}
