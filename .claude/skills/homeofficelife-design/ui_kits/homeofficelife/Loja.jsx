// HomeOfficeLife · Loja section + listing preview cards
/* eslint-disable */

const LISTINGS = [
  { id: "1", img: "../../assets/setup-after.webp",   title: "Cadeira Herman Miller Aeron seminova", category: "Cadeira", condition: "Seminovo", price: "R$ 4.500", city: "São Paulo, SP" },
  { id: "2", img: "../../assets/hero-setup.webp",    title: "Monitor LG 34WP65C Ultrawide 34\"",    category: "Monitor", condition: "Novo c/ NF", price: "R$ 2.799", city: "Curitiba, PR" },
  { id: "3", img: "../../assets/setup-compact.webp", title: "Mesa de madeira maciça 140×70",         category: "Mesa",    condition: "Usado",      price: "R$ 890",   city: "Belo Horizonte, MG" },
  { id: "4", img: "../../assets/setup-minimal.webp", title: "Teclado mecânico Keychron K2 v2",       category: "Teclado", condition: "Seminovo",   price: "R$ 580",   city: "Rio de Janeiro, RJ" },
];

const Loja = ({ onOpenListing }) => {
  return (
    <section id="marketplace"
             className="border-y border-[var(--border)] py-14"
             style={{ background: "linear-gradient(135deg, color-mix(in oklch, var(--secondary) 40%, var(--background)), var(--background), color-mix(in oklch, var(--secondary) 30%, var(--background)))" }}>
      <div className="mx-auto max-w-[1200px] px-6">
        <div className="mb-8 flex flex-col items-end justify-between gap-4 md:flex-row">
          <div>
            <Pill tone="eyebrow" className="mb-3 !text-[10px]"><Icon.Shopping size={11}/> Loja · Novidade</Pill>
            <h2 style={{ fontFamily: "var(--font-display)" }}
                className="text-[30px] sm:text-[36px] font-bold leading-tight tracking-[-0.025em] text-[var(--foreground)]">
              Compre e venda{" "}
              <span style={{ backgroundImage: "var(--gradient-warm)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
                home office
              </span>{" "}
              entre pessoas
            </h2>
            <p className="mt-2 max-w-xl text-sm text-[var(--muted-foreground)]">
              Monitor, cadeira, teclado, mesa — direto com quem usou. Sem taxa pra anunciar.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--card)] px-2.5 py-1 text-[11px] font-semibold">
                <Icon.Wallet size={12} className="text-[var(--primary)]"/> 0% taxa
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--card)] px-2.5 py-1 text-[11px] font-semibold">
                <Icon.Recycle size={12} className="text-[var(--accent)]"/> Reutiliza
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--card)] px-2.5 py-1 text-[11px] font-semibold">
                <Icon.Shopping size={12}/> Propostas diretas
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="default" className="!h-10">
              <Icon.Plus size={14}/> Anunciar grátis
            </Button>
            <Button variant="hero" size="default" className="!h-10 !px-4">
              <Icon.Search size={14}/> Explorar
            </Button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {LISTINGS.map((l) => <ListingCard key={l.id} l={l} onOpen={() => onOpenListing?.(l)}/>)}
        </div>
      </div>
    </section>
  );
};

const ListingCard = ({ l, onOpen }) => (
  <Card hover onClick={onOpen} className="!rounded-2xl overflow-hidden">
    <div className="relative aspect-square overflow-hidden bg-[var(--muted)]">
      <img src={l.img} alt={l.title} className="h-full w-full object-cover"/>
      <Pill tone="glass" className="absolute left-2 top-2 !px-2 !py-0.5 !text-[10px]">
        <Icon.Star size={9}/> {l.condition}
      </Pill>
      <span className="absolute bottom-2 right-2 rounded-full bg-[var(--brand-ink-900)]/90 px-2.5 py-0.5 text-xs font-bold text-white backdrop-blur">
        {l.price}
      </span>
    </div>
    <div className="p-3">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">{l.category}</div>
      <h3 className="mt-0.5 line-clamp-2 text-[13px] font-semibold leading-tight text-[var(--foreground)]" style={{ fontFamily: "var(--font-display)" }}>
        {l.title}
      </h3>
      <div className="mt-1.5 flex items-center gap-1 text-[11px] text-[var(--muted-foreground)]">
        <Icon.MapPin size={10}/> {l.city}
      </div>
    </div>
  </Card>
);

window.Loja = Loja;
