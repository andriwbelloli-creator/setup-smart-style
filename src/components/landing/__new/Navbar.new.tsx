// HomeOfficeLife · Navbar + Mobile Bottom Nav
/* eslint-disable */
import React, { useState } from 'react'
import { Button, Card, Pill, Watermark, Logo, I, useNav, useToast } from './_primitives'

const NAV_LINKS = [
  { id: "diagnostico", label: "Diagnóstico IA", icon: "Sparkles" },
  { id: "galeria",     label: "Galeria",         icon: "Grid" },
  { id: "marketplace", label: "Loja",            icon: "Shopping" },
  { id: "kits-page",   label: "Kits",            icon: "Package" },
];

const BOTTOM_TABS = [
  { id: "home",       label: "Início",   icon: "Home" },
  { id: "galeria",    label: "Galeria",   icon: "Grid" },
  { id: "upload",     label: "Analisar",  icon: "Camera", primary: true },
  { id: "kits-page",  label: "Kits",      icon: "Package" },
  { id: "pricing",    label: "Planos",    icon: "Crown" },
];

export interface NavbarProps {
  user?: { email: string } | null;
  onSignOut?: () => void;
  onUpload?: () => void;
}

const Navbar = ({ user, onSignOut, onUpload }: NavbarProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { page, go } = useNav();

  return (
    <>
      {/* Top navbar - desktop */}
      <header className="sticky top-0 z-40 w-full border-b border-[var(--border)]/40 bg-[var(--background)]/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-6">
          <a onClick={() => go("home")} className="cursor-pointer transition-opacity hover:opacity-85">
            <Logo size={26} variant="full"/>
          </a>
          <nav className="hidden items-center gap-7 lg:flex">
            {NAV_LINKS.map(l => (
              <a key={l.id} onClick={() => go(l.id)} className={"text-sm font-medium transition-colors duration-300 cursor-pointer " + (page === l.id ? "text-[var(--foreground)]" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]")}>
                {l.label}
              </a>
            ))}
            <a onClick={() => go("pricing")} className="cursor-pointer text-sm font-semibold text-[var(--primary)] hover:opacity-80">Premium</a>
          </nav>
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <Button variant="ghost" size="sm" className="hidden sm:inline-flex" onClick={() => go("home")}>Postar setup</Button>
                <Button variant="outline" size="sm" onClick={onSignOut}>
                  <I.User size={14}/><span className="hidden max-w-[120px] truncate sm:inline">{user.email}</span>
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => go("entrar")}>Entrar</Button>
                <Button variant="hero" size="sm" className="hidden sm:inline-flex !h-9 !px-4 !text-sm" onClick={onUpload}>
                  Avaliar meu setup
                </Button>
              </>
            )}
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Menu">
              <I.Menu size={18}/>
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-[var(--foreground)]/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)}/>
          <div className="absolute right-0 top-0 flex h-full w-[85%] max-w-sm flex-col overflow-y-auto bg-[var(--background)] shadow-[var(--shadow-elegant)]"
               style={{ animation: "slideIn 0.3s ease" }}>
            <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
              <span className="text-lg font-bold" style={{ fontFamily: "var(--font-display)" }}>Menu</span>
              <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)}><I.X size={18}/></Button>
            </div>
            <nav className="flex flex-col gap-1 p-4">
              {NAV_LINKS.map(l => (
                <a key={l.id} onClick={() => { go(l.id); setMobileOpen(false); }}
                   className="cursor-pointer rounded-xl px-3 py-3 text-base font-medium hover:bg-[var(--secondary)] flex items-center gap-3">
                  {React.createElement(I[l.icon], { size: 18, className: "text-[var(--muted-foreground)]" })}
                  {l.label}
                </a>
              ))}
              <a onClick={() => { go("categorias"); setMobileOpen(false); }}
                 className="cursor-pointer rounded-xl px-3 py-3 text-base font-medium hover:bg-[var(--secondary)] flex items-center gap-3">
                <I.Users size={18} className="text-[var(--muted-foreground)]"/> Categorias
              </a>
              <a onClick={() => { go("pricing"); setMobileOpen(false); }}
                 className="mt-2 cursor-pointer rounded-xl px-3 py-3 text-base font-semibold text-white shadow-[var(--shadow-elegant)] flex items-center gap-3"
                 style={{ background: "var(--gradient-hero)" }}>
                <I.Crown size={16}/> Premium
              </a>
            </nav>
          </div>
        </div>
      )}

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--border)] bg-[var(--background)]/95 backdrop-blur-xl lg:hidden"
           style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        <div className="flex items-end justify-around px-2 pt-1 pb-1">
          {BOTTOM_TABS.map(tab => {
            const isActive = tab.id === "upload" ? false : (tab.id === page || (tab.id === "home" && page === "home"));
            const IconComp = I[tab.icon];
            if ((tab as any).primary) {
              return (
                <button key={tab.id} onClick={onUpload}
                        className="flex flex-col items-center gap-0.5 -mt-4"
                        style={{ outline: "none", border: "none", background: "none" }}>
                  <div className="flex h-14 w-14 items-center justify-center rounded-full shadow-[var(--shadow-glow)]"
                       style={{ background: "var(--gradient-hero)" }}>
                    <IconComp size={24} style={{ color: "white" }}/>
                  </div>
                  <span className="text-[10px] font-bold text-[var(--primary)]">{tab.label}</span>
                </button>
              );
            }
            return (
              <button key={tab.id} onClick={() => go(tab.id)}
                      className="flex flex-col items-center gap-0.5 py-1.5 px-2"
                      style={{ outline: "none", border: "none", background: "none", cursor: "pointer" }}>
                <IconComp size={20} style={{ color: isActive ? "var(--primary)" : "var(--muted-foreground)" }}/>
                <span className={"text-[10px] font-medium " + (isActive ? "text-[var(--primary)]" : "text-[var(--muted-foreground)]")}>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};

export default Navbar;
