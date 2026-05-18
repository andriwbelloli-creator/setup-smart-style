// HomeOfficeLife · Loja (marketplace)
/* eslint-disable */
import React, { useState } from 'react'
import { Button, Card, Pill, Watermark, Logo, I, useNav, useToast } from './_primitives'

const LISTINGS = [
  { id:"1", img:"/__new/setup-after.webp",   title:"Cadeira Herman Miller Aeron seminova", category:"Cadeira",  condition:"Seminovo",  price:"R$ 4.500", city:"São Paulo, SP" },
  { id:"2", img:"/__new/hero-setup.webp",    title:'Monitor LG 34WP65C Ultrawide 34"',    category:"Monitor",  condition:"Novo c/ NF", price:"R$ 2.799", city:"Curitiba, PR" },
  { id:"3", img:"/__new/setup-compact.webp", title:"Mesa de madeira maciça 140×70",        category:"Mesa",     condition:"Usado",      price:"R$ 890",   city:"Belo Horizonte, MG" },
  { id:"4", img:"/__new/setup-minimal.webp", title:"Teclado mecânico Keychron K2 v2",      category:"Teclado",  condition:"Seminovo",   price:"R$ 580",   city:"Rio de Janeiro, RJ" },
  { id:"5", img:"/__new/setup-gamer.webp",   title:"Monitor Gamer 165Hz 27\" curvo",       category:"Monitor",  condition:"Seminovo",   price:"R$ 1.350", city:"Brasília, DF" },
  { id:"6", img:"/__new/setup-creator.webp", title:"Webcam Logitech C920 HD Pro",          category:"Webcam",   condition:"Usado",      price:"R$ 280",   city:"Campinas, SP" },
  { id:"7", img:"/__new/setup-before.webp",  title:"Mouse Logitech MX Master 3",           category:"Mouse",    condition:"Seminovo",   price:"R$ 420",   city:"Florianópolis, SC" },
  { id:"8", img:"/__new/setup-after.webp",   title:"Braço articulado monitor VESA",         category:"Suporte",  condition:"Novo c/ NF", price:"R$ 189",   city:"Porto Alegre, RS" },
];

const Loja = () => {
  const [filter, setFilter] = useState("Todos");
  const toast = useToast();
  const cats = ["Todos", ...new Set(LISTINGS.map(l => l.category))];
  const visible = filter === "Todos" ? LISTINGS : LISTINGS.filter(l => l.category === filter);

  return (
    <section id="marketplace" className="border-y border-[var(--border)] py-14"
             style={{ background:"linear-gradient(135deg, color-mix(in oklch, var(--secondary) 40%, var(--background)), var(--background), color-mix(in oklch, var(--secondary) 30%, var(--background)))" }}>
      <div className="mx-auto max-w-[1200px] px-6">
        <div className="mb-8 flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
          <div>
            <Pill tone="eyebrow" className="mb-3 !text-[10px]"><I.Shopping size={11}/> Loja · Novidade</Pill>
            <h2 style={{ fontFamily:"var(--font-display)" }} className="text-[28px] sm:text-[34px] font-bold leading-tight tracking-[-0.025em] text-[var(--foreground)]">
              Compre e venda <span style={{ backgroundImage:"var(--gradient-warm)", WebkitBackgroundClip:"text", backgroundClip:"text", color:"transparent" }}>home office</span> entre pessoas
            </h2>
            <p className="mt-2 max-w-xl text-sm text-[var(--muted-foreground)]">Monitor, cadeira, teclado, mesa — direto com quem usou. Sem taxa.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--card)] px-2.5 py-1 text-[11px] font-semibold">
                <I.Wallet size={12} className="text-[var(--primary)]"/> 0% taxa
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--card)] px-2.5 py-1 text-[11px] font-semibold">
                <I.Recycle size={12} className="text-[var(--accent)]"/> Reutiliza
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--card)] px-2.5 py-1 text-[11px] font-semibold">
                <I.Send size={12}/> Propostas diretas
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="default" className="!h-10" onClick={() => toast.show("Anúncio criado com sucesso!")}>
              <I.Plus size={14}/> Anunciar grátis
            </Button>
            <Button variant="hero" size="default" className="!h-10 !px-4" onClick={() => toast.show("Buscando produtos…")}>
              <I.Search size={14}/> Explorar
            </Button>
          </div>
        </div>

        {/* Category filter */}
        <div className="mb-6 flex flex-wrap gap-2">
          {cats.map(c => (
            <button key={c} onClick={() => setFilter(c)}
                    className={"rounded-full px-3 py-1.5 text-xs font-medium transition-colors duration-300 " +
                      (filter === c ? "bg-[var(--foreground)] text-[var(--background)]" : "border border-[var(--border)] bg-[var(--card)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]")}>
              {c}
            </button>
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {visible.map(l => (
            <Card key={l.id} hover className="!rounded-2xl overflow-hidden" onClick={() => toast.show(l.title + " — " + l.price)}>
              <div className="relative aspect-square overflow-hidden bg-[var(--muted)]">
                <img src={l.img} alt={l.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"/>
                <Pill tone="glass" className="absolute left-2 top-2 !px-2 !py-0.5 !text-[10px]"><I.Star size={9}/> {l.condition}</Pill>
                <span className="absolute bottom-2 right-2 rounded-full bg-[var(--brand-ink-900)]/90 px-2.5 py-0.5 text-xs font-bold text-white backdrop-blur">{l.price}</span>
              </div>
              <div className="p-3">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">{l.category}</div>
                <h3 className="mt-0.5 line-clamp-2 text-[13px] font-semibold leading-tight text-[var(--foreground)]" style={{ fontFamily:"var(--font-display)" }}>{l.title}</h3>
                <div className="mt-1.5 flex items-center gap-1 text-[11px] text-[var(--muted-foreground)]"><I.MapPin size={10}/> {l.city}</div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Loja;
