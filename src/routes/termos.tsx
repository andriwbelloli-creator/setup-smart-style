import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/CTA";

export const Route = createFileRoute("/termos")({
  head: () => ({
    meta: [
      { title: "Termos de Uso · Deskly" },
      { name: "robots", content: "index,follow" },
    ],
  }),
  component: Termos,
});

function Termos() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto max-w-3xl px-4 py-12 md:px-6 md:py-20">
        <h1 className="font-display text-4xl font-bold tracking-tight">Termos de Uso</h1>
        <p className="mt-2 text-sm text-muted-foreground">Última atualização: 10 de maio de 2026</p>

        <div className="prose mt-8 max-w-none space-y-6 text-sm leading-relaxed text-foreground">
          <section>
            <h2 className="font-display text-xl font-bold">1. Aceitação</h2>
            <p>Ao acessar o site <strong>deskly.life</strong> ("Deskly", "Plataforma") você concorda com estes Termos de Uso. Se não concordar, não utilize a Plataforma.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold">2. Sobre o Deskly</h2>
            <p>O Deskly é uma plataforma brasileira de inspiração, análise por IA e recomendação de produtos para home office. Os usuários podem publicar setups, comentar, e usar a análise de IA para receber sugestões.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold">3. Cadastro</h2>
            <p>Você precisa ter no mínimo 16 anos para usar o Deskly. Você é responsável por manter a confidencialidade da sua senha e por todas as atividades em sua conta.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold">4. Conteúdo do Usuário</h2>
            <p>Ao publicar setups, fotos ou comentários, você nos concede licença não exclusiva, gratuita e mundial para hospedar, exibir e distribuir esse conteúdo no Deskly. Você garante que tem os direitos sobre o conteúdo publicado.</p>
            <p>Reservamo-nos o direito de remover conteúdo que viole estes Termos, leis brasileiras ou direitos de terceiros.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold">5. Recomendações e Afiliados</h2>
            <p>O Deskly participa de programas de afiliados (Amazon Associates, Mercado Livre, Kabum, Magalu, entre outros). Os links de produtos podem gerar comissão para o Deskly quando há conversão. <strong>Isso não altera o preço para você.</strong></p>
            <p>As recomendações são editoriais ou baseadas em IA. Não somos responsáveis por experiências de compra, entregas ou produtos vendidos por terceiros.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold">6. Análise por IA</h2>
            <p>A análise de IA é uma ferramenta orientativa, não substitui consulta profissional de ergonomia, design ou saúde. As notas e sugestões são geradas por modelos automatizados e podem conter imprecisões.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold">7. Planos Pagos</h2>
            <p>Assinaturas Premium e Pro são cobradas mensalmente via Stripe. Você pode cancelar a qualquer momento — o acesso continua até o fim do período já pago. Não há reembolso proporcional para cancelamentos no meio do ciclo.</p>
            <p>Oferecemos garantia de 7 dias: se você cancelar nos primeiros 7 dias da primeira assinatura, devolvemos integralmente.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold">8. Conduta Proibida</h2>
            <ul className="ml-6 list-disc space-y-1">
              <li>Publicar conteúdo ilegal, ofensivo, discriminatório ou enganoso</li>
              <li>Spam, automação ou criação de contas falsas</li>
              <li>Tentar acessar áreas restritas, fazer engenharia reversa ou explorar vulnerabilidades</li>
              <li>Usar a Plataforma para concorrer com o Deskly</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold">9. Disponibilidade</h2>
            <p>Empenhamo-nos em manter o Deskly disponível, mas não garantimos funcionamento ininterrupto. Podemos suspender ou encerrar a Plataforma com aviso prévio razoável.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold">10. Limitação de Responsabilidade</h2>
            <p>Na máxima extensão permitida em lei, o Deskly e seus operadores não são responsáveis por danos indiretos, lucros cessantes ou perda de dados decorrentes do uso da Plataforma.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold">11. Foro e Lei Aplicável</h2>
            <p>Estes Termos são regidos pelas leis da República Federativa do Brasil. Fica eleito o foro da comarca de domicílio do usuário consumidor para dirimir controvérsias.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold">12. Alterações</h2>
            <p>Podemos atualizar estes Termos. Mudanças relevantes serão comunicadas por e-mail ou aviso na Plataforma com pelo menos 15 dias de antecedência.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold">13. Contato</h2>
            <p>E-mail: <a href="mailto:contato@deskly.life" className="text-primary hover:underline">contato@deskly.life</a></p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
