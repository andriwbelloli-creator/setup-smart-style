import { useState } from "react";
import { ChevronDown } from "lucide-react";

// FAQ enxuto pra responder objeções de cadastro/pagamento ANTES do CTA Premium.
// Trust signals + transparência (LGPD, sem cartão, cancelamento).
const FAQS: { q: string; a: string }[] = [
  {
    q: "É grátis mesmo?",
    a: "Sim. 3 análises de IA sem precisar de cartão de crédito. Depois, R$ 4,90/mês no Premium ou continua usando recursos básicos.",
  },
  {
    q: "Minhas fotos são publicadas?",
    a: "Não. Sua foto é processada pela IA e descartada logo após a análise — não fica em galeria pública. Você decide depois se quer publicar.",
  },
  {
    q: "Como a IA analisa meu ambiente?",
    a: "Avaliamos 6 critérios: ergonomia, iluminação, organização de cabos, organização visual, estética e produtividade. Cada nota vem com sugestão prática.",
  },
  {
    q: "Funciona no celular?",
    a: "Sim. Tira a foto direto da câmera ou faz upload de uma imagem da galeria. Mobile-first.",
  },
  {
    q: "Posso cancelar o Premium quando quiser?",
    a: "Sim, com 1 clique. Sem fidelidade, sem multa, sem ligação. Acesso continua até o fim do ciclo pago.",
  },
  {
    q: "Quanto custa o Premium?",
    a: "R$ 4,90/mês (lançamento) ou R$ 9,90/mês no Pro. Análises ilimitadas, plano de ação detalhado e relatório PDF.",
  },
];

export function FaqSection() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="bg-background py-16 md:py-20">
      <div className="container mx-auto max-w-3xl px-4 md:px-6">
        <div className="mb-10 text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
            Perguntas frequentes
          </div>
          <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
            Tudo que você precisa saber antes de começar
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Direto ao ponto. Sem letra miúda.
          </p>
        </div>

        <ul className="space-y-2">
          {FAQS.map((item, i) => {
            const isOpen = open === i;
            return (
              <li
                key={item.q}
                className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-smooth"
              >
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <span className="font-display text-base font-semibold leading-snug">
                    {item.q}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 flex-shrink-0 text-muted-foreground transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                    aria-hidden="true"
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">
                    {item.a}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
