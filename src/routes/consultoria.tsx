import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/CTA";
import { Button } from "@/components/ui/button";
import {
  Phone,
  FileText,
  Hammer,
  Check,
  Clock,
  MessageCircle,
  Sparkles,
} from "lucide-react";

type Service = {
  slug: string;
  title: string;
  tagline: string;
  price: number;
  icon: typeof Phone;
  duration: string;
  features: string[];
  highlight?: boolean;
  /** Stripe Payment Link OU mailto. Pode trocar depois pelo URL real. */
  ctaUrl: string;
  ctaLabel: string;
};

const CONTACT_EMAIL = "contato@homeofficelife.com.br";

// Stripe Payment Links (Test mode atualmente — quando migrar pra prod,
// criar 3 links equivalentes em dashboard.stripe.com/payment-links
// e trocar aqui).
const STRIPE_LINKS = {
  chamada30: "https://buy.stripe.com/test_5kQ8wQ5Ch2ii8W440N0Ny02",
  analise: "https://buy.stripe.com/test_fZu28s4yd0aa4FOapb0Ny01",
  completo: "https://buy.stripe.com/test_eVq5kEc0F0aaa081SF0Ny00",
};

const SERVICES: Service[] = [
  {
    slug: "chamada-30min",
    title: "Chamada rápida",
    tagline: "Tira-dúvidas direto no ponto",
    price: 99,
    icon: Phone,
    duration: "30 min · Google Meet",
    features: [
      "Análise rápida do seu setup atual",
      "3 ações práticas pra subir ergonomia/iluminação",
      "Recomendações de 5-8 produtos sob medida",
      "Resumo escrito enviado por email",
    ],
    ctaUrl: STRIPE_LINKS.chamada30,
    ctaLabel: "Reservar agora · R$ 99",
  },
  {
    slug: "analise-pdf",
    title: "Análise + plano PDF",
    tagline: "Mais profundo, fica documentado",
    price: 199,
    icon: FileText,
    duration: "Entrega em até 3 dias úteis",
    features: [
      "Você manda fotos e contexto (apê, trabalho, orçamento)",
      "Análise técnica com nota detalhada por critério",
      "Plano de upgrade priorizado por R$/impacto",
      "Lista de compras pronta com link de cada produto",
      "PDF white-label pra você guardar/imprimir",
    ],
    highlight: true,
    ctaUrl: STRIPE_LINKS.analise,
    ctaLabel: "Comprar agora · R$ 199",
  },
  {
    slug: "setup-completo",
    title: "Setup completo",
    tagline: "Eu monto, você só recebe e usa",
    price: 599,
    icon: Hammer,
    duration: "Entrega em até 7 dias",
    features: [
      "Briefing 1:1 sobre espaço, trabalho e estética desejada",
      "Moodboard com referências visuais",
      "Lista final com 12-20 produtos + onde comprar",
      "Planta com posicionamento (luminária, mesa, monitor)",
      "Roteiro de montagem em ordem (não chega tudo de uma vez)",
      "Suporte por WhatsApp durante a montagem",
    ],
    ctaUrl: STRIPE_LINKS.completo,
    ctaLabel: "Contratar agora · R$ 599",
  },
];

export const Route = createFileRoute("/consultoria")({
  head: () => ({
    meta: [
      { title: "Consultoria 1:1 · HomeOfficeLife" },
      { name: "description", content: "Consultoria personalizada de home office: chamada 30min (R$ 99), análise + PDF (R$ 199) ou setup completo (R$ 599). Pela equipe HomeOfficeLife." },
      { property: "og:title", content: "Consultoria 1:1 de Home Office · HomeOfficeLife" },
      { property: "og:description", content: "Especialista BR analisa seu setup e monta plano de upgrade sob medida. A partir de R$ 99." },
    ],
  }),
  component: Consultoria,
});

function Consultoria() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-12 md:px-6 md:py-16">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
            <MessageCircle className="h-3 w-3" /> Consultoria 1:1
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
            Seu setup, pelas mãos de quem entende
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            A IA é boa pra triagem rápida. Quando é pra investir R$ 3k+, vale
            ter um humano olhando junto. Escolha o pacote do seu momento.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-6xl gap-6 md:grid-cols-3">
          {SERVICES.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.slug}
                className={`relative flex flex-col rounded-3xl border-2 bg-card p-7 shadow-soft transition-smooth ${
                  s.highlight ? "border-primary ring-2 ring-primary/20 md:scale-105" : "border-border"
                }`}
              >
                {s.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
                    Mais escolhido
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-hero text-primary-foreground shadow-elegant">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h2 className="font-display text-xl font-bold">{s.title}</h2>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{s.tagline}</p>

                <div className="mt-5">
                  <span className="font-display text-4xl font-bold">R$ {s.price}</span>
                  <span className="ml-1 text-sm text-muted-foreground">pagamento único</span>
                </div>
                <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" /> {s.duration}
                </div>

                <ul className="mt-6 flex-1 space-y-2.5 text-sm">
                  {s.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  asChild
                  className={`mt-7 w-full ${s.highlight ? "bg-gradient-hero shadow-elegant" : ""}`}
                  variant={s.highlight ? "default" : "outline"}
                >
                  <a href={s.ctaUrl} target="_blank" rel="noopener noreferrer">
                    {s.ctaLabel} →
                  </a>
                </Button>
              </div>
            );
          })}
        </div>

        <div className="mx-auto mt-16 max-w-3xl rounded-3xl border border-border bg-card p-8 shadow-soft">
          <h2 className="font-display text-xl font-bold">Perguntas frequentes</h2>
          <div className="mt-5 space-y-5 text-sm">
            <div>
              <div className="font-semibold">Como pago?</div>
              <p className="mt-1 text-muted-foreground">
                Pelo Stripe (cartão) ou PIX (pagamento manual via email). Comprovante chega por email automaticamente.
              </p>
            </div>
            <div>
              <div className="font-semibold">E se eu não gostar?</div>
              <p className="mt-1 text-muted-foreground">
                Garantia de satisfação de 7 dias. Se você sentir que não ajudou, devolvo 100%.
              </p>
            </div>
            <div>
              <div className="font-semibold">Posso pagar parcelado?</div>
              <p className="mt-1 text-muted-foreground">
                Sim — o checkout do Stripe oferece parcelamento em até 12x sem juros pra valores acima de R$ 100.
              </p>
            </div>
            <div>
              <div className="font-semibold">Vocês compram os produtos pra mim?</div>
              <p className="mt-1 text-muted-foreground">
                Não — entregamos a lista exata com links das lojas BR. Você compra direto da Amazon, Mercado Livre, Kabum, etc. Assim você fica com nota fiscal e garantia direta.
              </p>
            </div>
            <div>
              <div className="font-semibold">Pra empresas?</div>
              <p className="mt-1 text-muted-foreground">
                Sim. Atendemos RH/People Ops com pacotes de análise de funcionários remotos (R$ 8/colaborador/mês). Manda email pra <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary hover:underline">{CONTACT_EMAIL}</a>.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-16 text-center">
          <Sparkles className="mx-auto h-8 w-8 text-primary" />
          <h2 className="mt-3 font-display text-2xl font-bold">
            Não quer pagar ainda?
          </h2>
          <p className="mt-2 text-muted-foreground">
            A análise de IA é grátis (3 análises lifetime) e já te dá 80% das respostas.
          </p>
          <Link to="/diagnostico" className="mt-5 inline-flex rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-background shadow-elegant transition-smooth hover:opacity-90">
            Testar diagnóstico grátis →
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
