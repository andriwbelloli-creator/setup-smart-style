// HomeOfficeLife · Galeria with carousel tabs
/* eslint-disable */
import React, { useState, useEffect, useRef } from 'react'
import { Button, Card, Pill, Watermark, Logo, I, useNav, useToast } from './_primitives'

const SETUPS = [
  { id:1,  img:"/__new/hero-setup.webp",    title:"Dev teal com mesa cavalete",    author:"Rafael Costa",    role:"Dev Full Stack",       city:"São Paulo, SP",      cats:["Dev","Minimalista"],     score:9.5, budget:5200, likes:412, saves:128, level:"Profissional" },
  { id:2,  img:"/__new/setup-after.webp",   title:"Setup criativo com plantas",    author:"Mariana Alves",   role:"Designer",             city:"Porto Alegre, RS",   cats:["Designer","Creator"],   score:9.2, budget:6800, likes:356, saves:94,  level:"Profissional" },
  { id:3,  img:"/__new/setup-minimal.webp", title:"Apê branco vista de cima",      author:"Ana Pereira",     role:"UX Designer",          city:"São Paulo, SP",      cats:["Minimalista","MacBook"], score:9.0, budget:4200, likes:312, saves:89,  level:"Otimizado" },
  { id:4,  img:"/__new/setup-compact.webp", title:"Cantinho compacto com plantas", author:"Carla Souza",     role:"PM",                   city:"Rio de Janeiro, RJ", cats:["Apê pequeno"],          score:8.5, budget:2400, likes:188, saves:56,  level:"Bom" },
  { id:5,  img:"/__new/setup-gamer.webp",   title:"Dual monitor RGB gamer",        author:"Lucas Reis",      role:"Dev Backend",          city:"Belo Horizonte, MG", cats:["Gamer","Dev"],          score:8.3, budget:8500, likes:244, saves:71,  level:"Otimizado" },
  { id:6,  img:"/__new/setup-creator.webp", title:"Estúdio creator ring light",    author:"Juliana Martins", role:"Criadora de conteúdo", city:"Curitiba, PR",       cats:["Creator"],              score:8.8, budget:3900, likes:289, saves:82,  level:"Otimizado" },
  { id:7,  img:"/__new/setup-before.webp",  title:"Setup clean mesa branca",       author:"Pedro Oliveira",  role:"Dev Frontend",         city:"Florianópolis, SC",  cats:["Dev","Minimalista"],     score:7.8, budget:3100, likes:156, saves:43,  level:"Bom" },
  { id:8,  img:"/__new/hero-setup.webp",    title:"Wood desk parede teal",         author:"Thiago Mendes",   role:"Tech Lead",            city:"Campinas, SP",       cats:["Dev"],                  score:9.1, budget:5800, likes:378, saves:102, level:"Profissional" },
  { id:9,  img:"/__new/setup-after.webp",   title:"Workspace designer premium",    author:"Camila Ferreira", role:"Designer",             city:"Recife, PE",         cats:["Designer"],             score:8.9, budget:7200, likes:267, saves:78,  level:"Otimizado" },
  { id:10, img:"/__new/setup-minimal.webp", title:"iMac setup minimalista",        author:"Fernanda Lima",   role:"Psicóloga",            city:"Brasília, DF",       cats:["Minimalista","MacBook","Apê pequeno"], score:8.7, budget:4800, likes:201, saves:63, level:"Otimizado" },
];

const TABS = ["Todos","Dev","Designer","Minimalista","Gamer","Creator","Apê pequeno","MacBook"];

const LEVELS: Record<string, { bg: string; fg: string }> = {
  "Básico":           { bg:"oklch(0.45 0.02 200/0.12)", fg:"var(--muted-foreground)" },
  "Bom":              { bg:"oklch(0.55 0.12 220/0.12)", fg:"var(--info)" },
  "Otimizado":        { bg:"oklch(0.42 0.07 195/0.12)", fg:"var(--primary)" },
  "Profissional":     { bg:"oklch(0.72 0.18 35/0.12)",  fg:"var(--brand-coral-500)" },
  "Setup dos sonhos": { bg:"oklch(0.72 0.18 35/0.18)",  fg:"var(--brand-coral-500)" },
};

interface SetupCardProps {
  s: typeof SETUPS[number];
  liked: boolean;
  onLike?: (id: number) => void;
  featured?: boolean;
}

export const SetupCard = ({ s, liked, onLike, featured }: SetupCardProps) => {
  const lc = LEVELS[s.level] || LEVELS["Bom"];
  const toast = useToast();
  return (
    <Card hover className={"overflow-hidden " + (featured ? "!border-[var(--primary)]/40 !ring-2 !ring-[var(--primary)]/20" : "")}>
      <div className="relative aspect-[4/3] overflow-hidden">
        <img src={s.img} alt={s.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"/>
        <Watermark/>
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {s.cats.slice(0,2).map(c => <Pill key={c} tone="glass">{c}</Pill>)}
        </div>
        <div className="absolute right-3 top-3"><Pill tone="overlay"><I.Star size={11}/> {s.score}</Pill></div>
        <div className="absolute bottom-3 left-3">
          <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold backdrop-blur-sm" style={{ background: lc.bg, color: lc.fg }}>
            {s.level === "Setup dos sonhos" && <I.Crown size={11}/>}{s.level}
          </span>
        </div>
        <div className="absolute bottom-3 right-3"><Pill tone="glass">R$ {s.budget.toLocaleString("pt-BR")}</Pill></div>
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 style={{ fontFamily:"var(--font-display)" }} className="text-[16px] font-semibold leading-tight text-[var(--foreground)] truncate">{s.title}</h3>
            <div className="mt-1 truncate text-sm text-[var(--muted-foreground)]">{s.author} · {s.role}</div>
          </div>
          <div className="flex flex-col items-end gap-1 text-xs text-[var(--muted-foreground)] flex-shrink-0">
            <button onClick={(e: React.MouseEvent<HTMLButtonElement>) => { e.stopPropagation(); onLike?.(s.id); }}
                    className={"flex items-center gap-1 transition-colors " + (liked ? "text-[var(--brand-coral-500)]" : "hover:text-[var(--brand-coral-500)]")}
                    style={{ background:"none", border:"none", cursor:"pointer", padding:0, font:"inherit" }}>
              <I.Heart size={13} style={liked ? { fill:"currentColor" } : {}}/> {s.likes + (liked ? 1 : 0)}
            </button>
            <span className="flex items-center gap-1"><I.Bookmark size={13}/> {s.saves}</span>
          </div>
        </div>
        <div className="mt-2 flex items-center gap-1 text-xs text-[var(--muted-foreground)]"><I.MapPin size={11}/> {s.city}</div>
        {featured && (
          <Button variant="hero" className="mt-4 w-full !h-11" onClick={() => toast.show("Abrindo setup completo…")}>
            Ver setup completo <I.ArrowRight size={14}/>
          </Button>
        )}
      </div>
    </Card>
  );
};

const Galeria = () => {
  const [tab, setTab] = useState("Todos");
  const [likes, setLikes] = useState<Record<number, boolean>>({});
  const scrollRef = useRef<HTMLDivElement>(null);
  const { go } = useNav();
  const toast = useToast();

  const filtered = tab === "Todos" ? SETUPS : SETUPS.filter(s => s.cats.includes(tab));
  const toggleLike = (id: number) => setLikes(p => ({ ...p, [id]: !p[id] }));

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
  }, [tab]);

  return (
    <section id="galeria" className="py-14">
      <div className="mx-auto max-w-[1200px] px-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
          <div className="max-w-xl">
            <Pill tone="accent" className="mb-3 !text-[10px]"><I.Users size={12}/> Comunidade BR</Pill>
            <h2 style={{ fontFamily:"var(--font-display)" }} className="text-[28px] sm:text-[36px] font-bold leading-tight tracking-[-0.025em] text-[var(--foreground)]">
              Inspiração de <span style={{ color:"var(--brand-coral-500)" }}>apartamentos brasileiros</span>
            </h2>
          </div>
          <p className="max-w-md text-sm text-[var(--muted-foreground)]">Setups reais de devs, designers e criadores em apês de verdade.</p>
        </div>

        {/* Tabs */}
        <div className="mt-6 flex flex-wrap gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth:"none" }}>
          {TABS.map(f => (
            <button key={f} onClick={() => setTab(f)}
                    className={"rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors duration-300 whitespace-nowrap flex-shrink-0 " +
                      (tab === f ? "bg-[var(--foreground)] text-[var(--background)]" : "border border-[var(--border)] bg-[var(--card)] text-[var(--muted-foreground)] hover:border-[var(--foreground)] hover:text-[var(--foreground)]")}>
              {f} {f !== "Todos" && <span className="ml-1 opacity-60">{SETUPS.filter(s => s.cats.includes(f)).length}</span>}
            </button>
          ))}
        </div>

        {/* Cards grid / carousel */}
        <div ref={scrollRef} className="mt-6 grid gap-5 md:grid-cols-2">
          {filtered.map((s, i) => (
            <SetupCard key={s.id} s={s} liked={!!likes[s.id]} onLike={toggleLike} featured={i === 0}/>
          ))}
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-5 text-sm text-[var(--muted-foreground)]">
            <span className="flex items-center gap-1"><I.Camera size={14} className="text-[var(--primary)]"/> <strong className="text-[var(--foreground)]">12k+</strong> setups</span>
            <span className="w-px h-4 bg-[var(--border)]"/>
            <span className="flex items-center gap-1"><I.Users size={14} className="text-[var(--primary)]"/> <strong className="text-[var(--foreground)]">3.4k</strong> membros</span>
          </div>
          <div className="flex gap-3">
            <Button variant="default" className="!rounded-full !bg-[var(--foreground)] !px-6" onClick={() => toast.show("Galeria completa em breve!")}>
              Ver galeria completa <I.ArrowRight size={14}/>
            </Button>
            <Button variant="hero" className="!rounded-full !px-6" onClick={() => go("diagnostico")}>
              <I.Sparkles size={14}/> Avaliar meu setup
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Galeria;
