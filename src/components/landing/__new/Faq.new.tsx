// HomeOfficeLife · FAQ — accordion
/* eslint-disable */
import React, { useState } from 'react'
import { Button, Card, Pill, Watermark, Logo, I, useNav, useToast } from './_primitives'

const FAQS = [
  {
    q: "Minha foto fica armazenada? Vocês publicam sem autorização?",
    a: "Não. Suas fotos são usadas apenas para gerar a sua análise e ficam privadas por padrão. Você decide se quer publicar na galeria pública ou não. A qualquer momento você pode apagar do seu histórico.",
  },
  {
    q: "Preciso pagar para testar?",
    a: "Não. O plano gratuito permite testar a transformação visual e ver uma versão resumida do diagnóstico, sem cartão. Você só paga se quiser desbloquear mais gerações, lista de produtos completa e relatório.",
  },
  {
    q: "A IA gera realmente o meu ambiente ou só usa fotos genéricas?",
    a: "A IA usa a SUA foto como ponto de partida. Ela identifica o layout, janelas, paredes e mobiliário existentes, e gera versões decoradas preservando a estrutura real do seu espaço. As imagens são referências visuais, não projetos arquitetônicos finais.",
  },
  {
    q: "Funciona com home office no quarto, na sala ou só em cômodos dedicados?",
    a: "Funciona em qualquer espaço de trabalho: quarto, sala, canto, escritório dedicado, varanda fechada. Inclusive temos estilos específicos para cada situação como 'Home office na sala' e 'Sem comprar nada'.",
  },
  {
    q: "Os produtos recomendados são do Brasil?",
    a: "Sim. Todas as recomendações são de produtos disponíveis em lojas brasileiras (Amazon BR, Mercado Livre, Magalu, Casas Bahia) com preços em reais. Sempre damos opções por faixa de orçamento.",
  },
  {
    q: "Posso fazer várias versões do mesmo espaço?",
    a: "Sim. No plano grátis você gera algumas versões. No Premium (R$ 4,90/mês) são ilimitadas e você pode salvar, comparar, refinar e exportar quantas quiser.",
  },
  {
    q: "E se eu não gostar do resultado?",
    a: "Você pode gerar uma nova versão a qualquer momento, mudar o estilo, orçamento ou objetivo. A IA aprende com seu feedback. Premium tem 7 dias de teste sem compromisso.",
  },
  {
    q: "Vale a pena se meu orçamento for de R$ 0?",
    a: "Sim — temos um estilo específico 'Sem comprar nada' que mostra como melhorar seu espaço só com reorganização, aproveitando o que você já tem.",
  },
];

const Faq = () => {
  const [open, setOpen] = useState<number>(0);
  return (
    <section className="py-16 md:py-20">
      <div className="mx-auto max-w-[820px] px-6">
        <div className="mb-12 text-center">
          <Pill tone="eyebrow" className="mb-4 !text-[10px]"><I.Sparkles size={11}/> Dúvidas frequentes</Pill>
          <h2 style={{ fontFamily: "var(--font-display)" }}
              className="text-[28px] sm:text-[40px] font-bold leading-tight tracking-[-0.025em] text-[var(--foreground)]">
            Tudo o que você precisa saber
          </h2>
          <p className="mt-3 text-[var(--muted-foreground)]">
            Se não respondemos sua dúvida aqui, escreva pra gente.
          </p>
        </div>

        <div className="space-y-3">
          {FAQS.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={i}
                   className="overflow-hidden rounded-[20px] border border-[var(--border)] bg-[var(--card)] transition-all duration-300"
                   style={{
                     boxShadow: isOpen ? "var(--shadow-elegant)" : "var(--shadow-soft)",
                   }}>
                <button
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition-colors hover:bg-[var(--secondary)]/40"
                  style={{ background: "none", border: "none", cursor: "pointer", font: "inherit" }}>
                  <span style={{ fontFamily: "var(--font-display)" }} className="text-[16px] font-semibold leading-snug text-[var(--foreground)]">
                    {f.q}
                  </span>
                  <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[var(--primary)]/10 text-[var(--primary)] transition-transform duration-300"
                        style={{ transform: isOpen ? "rotate(45deg)" : "rotate(0deg)" }}>
                    <I.Plus size={16}/>
                  </span>
                </button>
                <div className="overflow-hidden transition-[max-height,padding] duration-400 ease-in-out"
                     style={{
                       maxHeight: isOpen ? 320 : 0,
                       padding: isOpen ? "0 24px 22px 24px" : "0 24px",
                     }}>
                  <p className="text-[14px] leading-[1.65] text-[var(--muted-foreground)]">
                    {f.a}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-10 rounded-[24px] border border-[var(--border)] bg-[var(--cream)] p-6 text-center">
          <p className="text-sm text-[var(--muted-foreground)]">Ainda com dúvidas?</p>
          <a href="mailto:ola@homeofficelife.com.br" className="mt-1 inline-block font-bold text-[var(--primary)] underline-offset-4 hover:underline">
            ola@homeofficelife.com.br
          </a>
        </div>
      </div>
    </section>
  );
};

export default Faq;
