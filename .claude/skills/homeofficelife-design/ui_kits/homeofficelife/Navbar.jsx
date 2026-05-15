// HomeOfficeLife · Navbar (sticky, blurred, with mobile drawer)
/* eslint-disable */

const Navbar = ({ user, onSignOut, onNav, current }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const LINKS = [
    { id: "diagnostico", label: "Diagnóstico IA" },
    { id: "galeria",     label: "Galeria" },
    { id: "marketplace", label: "Loja" },
    { id: "kits",        label: "Kits" },
  ];

  const linkCls = (id) =>
    "text-sm font-medium transition-colors duration-300 " +
    (current === id ? "text-[var(--foreground)]" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]");

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[var(--border)]/40 bg-[var(--background)]/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-6">
        <a onClick={() => onNav?.("home")} className="cursor-pointer transition-opacity hover:opacity-85">
          <Logo size={26} variant="full" />
        </a>

        <nav className="hidden items-center gap-7 lg:flex">
          {LINKS.map((l) => (
            <a key={l.id} onClick={() => onNav?.(l.id)} className={linkCls(l.id) + " cursor-pointer"}>
              {l.label}
            </a>
          ))}
          <a onClick={() => onNav?.("premium")} className="cursor-pointer text-sm font-semibold text-[var(--primary)] hover:opacity-80">
            Premium
          </a>
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Button variant="ghost" size="sm" className="hidden sm:inline-flex"
                      onClick={() => onNav?.("postar")}>Postar setup</Button>
              <Button variant="outline" size="sm" onClick={onSignOut}>
                <Icon.User size={14}/>
                <span className="hidden max-w-[120px] truncate sm:inline">{user.email}</span>
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => onNav?.("entrar")}>Entrar</Button>
              <Button variant="hero" size="sm" className="hidden sm:inline-flex !h-9 !px-4 !text-sm"
                      onClick={() => onNav?.("diagnostico")}>
                Avaliar meu setup
              </Button>
            </>
          )}
          <Button variant="ghost" size="icon" className="lg:hidden"
                  onClick={() => setMobileOpen(true)} aria-label="Abrir menu">
            <Icon.Menu size={18}/>
          </Button>
        </div>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-[var(--foreground)]/60 backdrop-blur-sm"
               onClick={() => setMobileOpen(false)}/>
          <div className="absolute right-0 top-0 flex h-full w-[85%] max-w-sm flex-col overflow-y-auto bg-[var(--background)] shadow-[var(--shadow-elegant)]">
            <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
              <span className="font-display text-lg font-bold" style={{ fontFamily: "var(--font-display)" }}>Menu</span>
              <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)}><Icon.X size={18}/></Button>
            </div>
            <nav className="flex flex-col gap-1 p-4">
              {LINKS.map((l) => (
                <a key={l.id} onClick={() => { onNav?.(l.id); setMobileOpen(false); }}
                   className="cursor-pointer rounded-xl px-3 py-3 text-base font-medium hover:bg-[var(--secondary)]">
                  {l.label}
                </a>
              ))}
              <a onClick={() => { onNav?.("premium"); setMobileOpen(false); }}
                 className="mt-2 cursor-pointer rounded-xl px-3 py-3 text-base font-semibold text-white shadow-[var(--shadow-elegant)]"
                 style={{ background: "var(--gradient-hero)" }}>
                <Icon.Crown size={16} className="mr-2 inline"/> Premium
              </a>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

window.Navbar = Navbar;
