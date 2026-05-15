// HomeOfficeLife · Galeria — 2-col setup grid with chip filters
/* eslint-disable */

const SETUPS = [
  { img: "../../assets/setup-minimal.webp", title: "Apê branco minimalista", author: "Ana Pereira", role: "Designer", city: "São Paulo, SP", styles: ["Minimalista", "MacBook"], score: 9.1, budget: 4200, likes: 312, saves: 89 },
  { img: "../../assets/setup-creator.webp", title: "Cantinho do criador",     author: "João Lima",   role: "Streamer", city: "Curitiba, PR", styles: ["Creator", "Streaming"], score: 8.4, budget: 7890, likes: 188, saves: 56 },
  { img: "../../assets/setup-gamer.webp",   title: "Setup gamer compacto",    author: "Lucas Reis",  role: "Dev",      city: "Belo Horizonte, MG", styles: ["Gamer", "Dev"], score: 8.7, budget: 6500, likes: 244, saves: 71 },
  { img: "../../assets/setup-compact.webp", title: "Apê pequeno funcional",   author: "Carla Souza", role: "PM",       city: "Rio de Janeiro, RJ", styles: ["Apê pequeno"], score: 7.9, budget: 2400, likes: 132, saves: 41 },
];

const FILTROS = ["Todos", "Dev", "Designer", "Minimalista", "Gamer", "Creator", "Apê pequeno", "MacBook"];

const Galeria = ({ onOpenSetup }) => {
  const [active, setActive] = useState("Todos");
  const [liked, setLiked] = useState({});
  const visible = active === "Todos" ? SETUPS : SETUPS.filter(s => s.styles.includes(active));

  return (
    <section id="galeria" className="py-14">
      <div className="mx-auto max-w-[1200px] px-6">
        <div className="flex flex-col items-end justify-between gap-4 md:flex-row">
          <div className="max-w-xl">
            <Pill tone="accent" className="mb-3 !text-[10px]">Comunidade BR</Pill>
            <h2 style={{ fontFamily: "var(--font-display)" }}
                className="text-[32px] sm:text-[40px] font-bold leading-tight tracking-[-0.025em] text-[var(--foreground)]">
              Inspiração de{" "}
              <span style={{ color: "var(--brand-coral-500)" }}>apartamentos brasileiros</span>
            </h2>
          </div>
          <p className="max-w-md text-sm text-[var(--muted-foreground)]">
            Setups reais de devs, designers e criadores em apês de verdade.
          </p>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {FILTROS.map((f) => (
            <button key={f} onClick={() => setActive(f)}
                    className={
                      "rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors duration-300 " +
                      (active === f
                        ? "bg-[var(--foreground)] text-[var(--background)]"
                        : "border border-[var(--border)] bg-[var(--card)] text-[var(--muted-foreground)] hover:border-[var(--foreground)] hover:text-[var(--foreground)]")
                    }>
              {f}
            </button>
          ))}
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          {visible.map((s, i) => (
            <SetupCard key={s.title} s={s} liked={!!liked[i]} onLike={() => setLiked({ ...liked, [i]: !liked[i] })}
                       onOpen={() => onOpenSetup?.(s)} featured={i === 0}/>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Button variant="default" className="!rounded-full !bg-[var(--foreground)] !px-6">
            Ver galeria completa <Icon.ArrowRight size={14}/>
          </Button>
        </div>
      </div>
    </section>
  );
};

const SetupCard = ({ s, liked, onLike, onOpen, featured }) => (
  <Card hover onClick={onOpen} className={"overflow-hidden " + (featured ? "!border-[var(--primary)]/40 !ring-2 !ring-[var(--primary)]/20" : "")}>
    <div className="relative aspect-[4/3] overflow-hidden">
      <img src={s.img} alt={s.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"/>
      <Watermark/>
      <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
        {s.styles.slice(0, 2).map(t => <Pill key={t} tone="glass">{t}</Pill>)}
      </div>
      <div className="absolute right-3 top-3">
        <Pill tone="overlay"><Icon.Star size={11}/> {s.score}</Pill>
      </div>
      <div className="absolute bottom-3 right-3">
        <Pill tone="glass">R$ {s.budget.toLocaleString("pt-BR")}</Pill>
      </div>
    </div>
    <div className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 style={{ fontFamily: "var(--font-display)" }} className="text-lg font-semibold leading-tight text-[var(--foreground)]">{s.title}</h3>
          <div className="mt-1 truncate text-sm text-[var(--muted-foreground)]">{s.author} · {s.role}</div>
        </div>
        <div className="flex flex-col items-end gap-1 text-xs text-[var(--muted-foreground)]">
          <button onClick={(e) => { e.stopPropagation(); onLike?.(); }}
                  className={"flex items-center gap-1 transition-colors " + (liked ? "text-[var(--brand-coral-500)]" : "hover:text-[var(--brand-coral-500)]")}>
            <Icon.Heart size={13} className={liked ? "[&_path]:fill-current" : ""}/> {s.likes + (liked ? 1 : 0)}
          </button>
          <div className="flex items-center gap-1"><Icon.Bookmark size={13}/> {s.saves}</div>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
        <Icon.MapPin size={11}/> {s.city}
      </div>
      {featured && (
        <Button variant="hero" className="mt-4 w-full !h-11">
          Ver setup completo <Icon.ArrowRight size={14}/>
        </Button>
      )}
    </div>
  </Card>
);

window.Galeria = Galeria;
