import { Check, Wallet } from "lucide-react";
import { Link } from "@tanstack/react-router";

const orcamentos = [
  {
    nome: "Essencial",
    valor: "R$ 1.500",
    desc: "Pra começar bem sem quebrar a poupança",
    cor: "bg-cream",
    items: [
      "Monitor 24\" Full HD — R$ 699",
      "Cadeira ergonômica básica — R$ 450",
      "Suporte de notebook — R$ 89",
      "Teclado + mouse sem fio — R$ 180",
      "Luminária de mesa LED — R$ 82",
    ],
  },
  {
    nome: "Equilibrado",
    valor: "R$ 3.000",
    desc: "O sweet spot pra quem trabalha 8h/dia",
    cor: "bg-gradient-hero text-primary-foreground",
    destaque: true,
    items: [
      "Monitor 27\" QHD IPS — R$ 1.299",
      "Cadeira DT3 / ThunderX3 — R$ 980",
      "Suporte articulado VESA — R$ 220",
      "Teclado mecânico + mouse — R$ 350",
      "Iluminação ambiente + bias — R$ 150",
    ],
  },
  {
    nome: "Premium",
    valor: "R$ 7.500+",
    desc: "Pra quem leva o home office a sério",
    cor: "bg-card",
    items: [
      "Ultrawide 34\" curvo LG — R$ 2.799",
      "Cadeira Herman Miller / Flexform — R$ 3.200",
      "Mesa com elevação — R$ 1.800",
      "Teclado Keychron + mouse MX — R$ 850",
      "Setup de luz Philips Hue — R$ 600",
    ],
  },
];

export function Orcamento() {
  return (
    <section id="orcamento" className="bg-cream py-14 md:py-20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-coral/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-coral-foreground">
            <Wallet className="h-3 w-3" /> Setup por orçamento
          </div>
          <h2 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
            Diga seu bolso. <span className="text-coral">A gente monta.</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Listas de compras prontas com produtos disponíveis em Amazon BR, Mercado Livre, Kabum e Magalu.
          </p>
        </div>

        <div className="mt-16 grid gap-6 lg:grid-cols-3">
          {orcamentos.map((o) => (
            <div
              key={o.nome}
              className={`relative rounded-3xl p-8 shadow-soft transition-smooth hover:-translate-y-1 hover:shadow-elegant ${o.cor} ${
                o.destaque ? "ring-2 ring-accent shadow-elegant lg:scale-105" : ""
              }`}
            >
              {o.destaque && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent px-4 py-1 text-xs font-bold uppercase tracking-wider text-accent-foreground">
                  Mais popular
                </div>
              )}
              <h3 className="font-display text-2xl font-bold">{o.nome}</h3>
              <div className="mt-2 font-display text-4xl font-bold">{o.valor}</div>
              <p className={`mt-2 text-sm ${o.destaque ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                {o.desc}
              </p>
              <ul className="mt-6 space-y-3">
                {o.items.map((it) => (
                  <li key={it} className="flex items-start gap-3 text-sm">
                    <Check className={`mt-0.5 h-4 w-4 flex-shrink-0 ${o.destaque ? "text-accent" : "text-primary"}`} />
                    <span>{it}</span>
                  </li>
                ))}
              </ul>
              <Link
                to="/orcamento"
                className={`mt-8 inline-flex w-full items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition-smooth ${
                  o.destaque
                    ? "bg-accent text-accent-foreground hover:opacity-90"
                    : "bg-foreground text-background hover:opacity-90"
                }`}
              >
                Ver lista completa
              </Link>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          <span>Parceiros de preço</span>
          <span className="text-foreground">Amazon BR</span>
          <span className="text-foreground">Mercado Livre</span>
          <span className="text-foreground">Kabum</span>
          <span className="text-foreground">Magalu</span>
          <span className="text-foreground">Pichau</span>
        </div>
      </div>
    </section>
  );
}
