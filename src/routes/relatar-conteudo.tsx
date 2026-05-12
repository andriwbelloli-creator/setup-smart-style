import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/CTA";
import { ShieldAlert, FileText, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/relatar-conteudo")({
  head: () => ({
    meta: [
      { title: "Relatar conteúdo · Deskly" },
      { name: "description", content: "Procedimento de notificação e remoção (notice & takedown) para reclamar de conteúdo que viole direitos autorais, imagem ou marca no Deskly." },
      { name: "robots", content: "index,follow" },
    ],
  }),
  component: RelatarConteudo,
});

function RelatarConteudo() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto max-w-3xl px-4 py-12 md:px-6 md:py-16">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-coral/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-coral-foreground">
          <ShieldAlert className="h-3 w-3" /> Notice & Takedown
        </div>
        <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
          Relatar conteúdo
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Encontrou um setup, comentário ou produto na Deskly que viola seus
          direitos (autorais, imagem, marca) ou a lei? Aqui você notifica e
          analisamos em até 5 dias úteis.
        </p>

        <div className="mt-10 space-y-6">
          <section className="rounded-3xl border border-border bg-card p-6 shadow-soft">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <h2 className="font-display text-lg font-bold">Como notificar</h2>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Envie um e-mail para{" "}
              <a href="mailto:juridico@deskly.life" className="font-semibold text-primary hover:underline">
                juridico@deskly.life
              </a>{" "}
              com o seguinte:
            </p>
            <ol className="ml-6 mt-3 list-decimal space-y-2 text-sm">
              <li><strong>Identificação:</strong> seu nome completo, CPF/CNPJ, e-mail e telefone.</li>
              <li><strong>Representação:</strong> se você representa o titular do direito, anexe procuração ou prova de mandato.</li>
              <li><strong>URL específica:</strong> link direto do conteúdo questionado (ex: <code className="rounded bg-secondary px-1">https://deskly.life/setup/...</code>).</li>
              <li><strong>Fundamento legal:</strong> qual lei foi violada (ex: Lei 9.610/98 — direitos autorais, Lei 9.279/96 — marca, art. 20 CC — direito de imagem).</li>
              <li><strong>Evidência do direito:</strong> certificado de registro, foto original (com EXIF), contrato, etc.</li>
              <li><strong>Declaração de boa-fé:</strong> a frase: <em>"Declaro, sob as penas da lei, que as informações aqui prestadas são verdadeiras e que sou o titular do direito alegado ou seu representante legal."</em></li>
            </ol>
          </section>

          <section className="rounded-3xl border border-border bg-card p-6 shadow-soft">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-primary" />
              <h2 className="font-display text-lg font-bold">O que acontece depois</h2>
            </div>
            <ol className="ml-6 mt-3 list-decimal space-y-2 text-sm text-muted-foreground">
              <li>Recebemos sua notificação e enviamos confirmação em 24h úteis.</li>
              <li>Avaliamos a reclamação em até <strong>5 dias úteis</strong>.</li>
              <li>
                Se a reclamação for considerada procedente, removemos o
                conteúdo e notificamos o usuário responsável (que tem direito
                a apresentar contranotificação).
              </li>
              <li>
                Se a reclamação for considerada improcedente, respondemos com
                a justificativa.
              </li>
              <li>
                Em casos de urgência (conteúdo manifestamente ilícito, dano
                iminente), agimos em até 24h.
              </li>
            </ol>
          </section>

          <section className="rounded-3xl border-l-4 border-coral bg-coral/10 p-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-coral" />
              <h2 className="font-display text-base font-bold">Aviso sobre notificações abusivas</h2>
            </div>
            <p className="mt-2 text-sm text-foreground">
              Conforme art. 19 da Lei nº 12.965/2014 (Marco Civil da Internet) e jurisprudência do STJ,
              notificações falsas, fraudulentas ou manifestamente improcedentes podem resultar em
              responsabilização civil do notificante por danos materiais e morais ao usuário afetado e ao Deskly.
            </p>
            <p className="mt-2 text-sm text-foreground">
              Antes de notificar, certifique-se de que você é o titular do direito e que o uso questionado realmente caracteriza violação (uso fair use, paródia, citação acadêmica, crítica e exercício regular de direito não são violações).
            </p>
          </section>

          <section className="rounded-3xl border border-border bg-card p-6 shadow-soft">
            <h2 className="font-display text-lg font-bold">Outros canais</h2>
            <ul className="mt-3 space-y-2 text-sm">
              <li><strong>Privacidade / LGPD / DPO:</strong> <a href="mailto:privacidade@deskly.life" className="text-primary hover:underline">privacidade@deskly.life</a></li>
              <li><strong>Suporte geral:</strong> <a href="mailto:contato@deskly.life" className="text-primary hover:underline">contato@deskly.life</a></li>
              <li><strong>Comercial / B2B:</strong> <a href="mailto:contato@deskly.life" className="text-primary hover:underline">contato@deskly.life</a></li>
            </ul>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
