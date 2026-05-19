// HomeOfficeLife · Premium CTA + Footer
/* eslint-disable */
import React from 'react'
import { Button, Card, Pill, Watermark, Logo, I, useNav, useToast } from './_primitives'

export const PremiumCTA = () => {
  const { go } = useNav();
  return (
    <section className="py-14">
      <div className="mx-auto max-w-[1200px] px-6">
        <div className="relative overflow-hidden rounded-[32px] px-8 py-14 text-center text-white shadow-[var(--shadow-elegant)] md:px-12 md:py-16" style={{ background:"var(--gradient-hero)" }}>
          <div className="absolute inset-0 opacity-40" style={{ background:"var(--gradient-mesh)" }}/>
          <div className="relative mx-auto max-w-2xl">
            <I.Crown size={36} className="mx-auto mb-3 text-[var(--brand-coral-500)]"/>
            <h2 style={{ fontFamily:"var(--font-display)" }} className="text-[26px] sm:text-[34px] font-bold leading-tight tracking-[-0.02em]">
              Faça mais do seu office com Premium
            </h2>
            <p className="mt-3 text-base text-white/85 md:text-lg">
              Análises ilimitadas, plano de ação detalhado e lista de compras priorizada.
              A partir de <strong className="text-[var(--brand-coral-500)]">R$ 4,90/mês</strong>.
            </p>
            <ul className="mx-auto mt-6 max-w-md space-y-1.5 text-left text-sm text-white/85">
              {["Análises ilimitadas (free é 3 lifetime)", "Plano de ação detalhado + lista de compras", "Comparação de setups + histórico de evolução"].map(line => (
                <li key={line} className="flex items-start gap-2">
                  <I.Check size={16} className="mt-0.5 flex-shrink-0 text-[var(--brand-coral-500)]"/><span>{line}</span>
                </li>
              ))}
            </ul>
            <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button onClick={() => go("pricing")}
                      className="inline-flex items-center gap-2 rounded-full bg-[var(--brand-coral-500)] px-7 py-3 text-sm font-bold text-white shadow-[var(--shadow-coral)] transition-transform duration-300 hover:scale-105"
                      style={{ transitionTimingFunction:"cubic-bezier(0.22,1,0.36,1)" }}>
                <I.Crown size={14}/> Assinar Premium
              </button>
              <button onClick={() => go("home")} className="text-sm font-semibold text-white/80 underline-offset-4 hover:text-white hover:underline" style={{ background:"none", border:"none", cursor:"pointer" }}>
                Quero testar grátis primeiro →
              </button>
            </div>
            <p className="mt-3 text-xs text-white/60">Cancele a qualquer momento · Sem fidelidade</p>
          </div>
        </div>
      </div>
    </section>
  );
};

const Footer = () => {
  const { go } = useNav();
  const toast = useToast();
  const links = [
    { label:"Galeria", action:() => go("galeria") },
    { label:"Loja", action:() => go("marketplace") },
    { label:"Kits", action:() => go("kits-page") },
    { label:"Diagnóstico", action:() => go("diagnostico") },
    { label:"Categorias", action:() => go("categorias") },
    { label:"Premium", action:() => go("pricing") },
    { label:"Termos", action:() => toast.show("Termos de uso") },
    { label:"Privacidade", action:() => toast.show("Política de privacidade") },
  ];

  return (
    <footer className="border-t border-[var(--border)] py-12 pb-24 lg:pb-12" style={{ background:"var(--cream)" }}>
      <div className="mx-auto max-w-[1200px] px-6">
        {/* Newsletter */}
        <div className="mb-10 max-w-2xl">
          <Card className="!rounded-2xl p-6">
            <h3 style={{ fontFamily:"var(--font-display)" }} className="text-xl font-bold text-[var(--foreground)]">
              3 setups + 1 dica de upgrade, toda semana.
            </h3>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">Curadoria editorial. Sem spam. Cancela em 1 clique.</p>
            <div className="mt-4 flex gap-2">
              <input className="h-10 flex-1 rounded-md border border-[var(--input)] bg-transparent px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                     placeholder="seu@email.com"/>
              <Button variant="default" className="!h-10" onClick={() => toast.show("Inscrito com sucesso!")}>Quero receber</Button>
            </div>
          </Card>
        </div>

        {/* Trust signals */}
        <div className="mb-8 flex flex-wrap gap-6 text-sm text-[var(--muted-foreground)]">
          {["Sem cartão no plano grátis","Suas fotos são privadas","Cancele quando quiser","Resultado em 30 segundos"].map(t => (
            <span key={t} className="flex items-center gap-1.5"><I.Shield size={14} className="text-[var(--primary)]"/> {t}</span>
          ))}
        </div>

        <div className="flex flex-col items-start justify-between gap-6 border-t border-[var(--border)] pt-8 md:flex-row md:items-center">
          <div>
            <Logo size={20} variant="full"/>
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">Feito no Brasil pra quem trabalha de casa. © 2026</p>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-[var(--muted-foreground)]">
            {links.map(l => <a key={l.label} className="cursor-pointer hover:text-[var(--foreground)] transition-colors" onClick={l.action}>{l.label}</a>)}
          </div>
        </div>
      </div>
    </footer>
  );
};

export { Footer };
export default Footer;
