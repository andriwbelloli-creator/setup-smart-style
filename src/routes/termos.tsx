import { createFileRoute, Link } from "@tanstack/react-router";
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
        <p className="mt-2 text-sm text-muted-foreground">Última atualização: 12 de maio de 2026 · v2026-05-12</p>

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
            <h2 className="font-display text-xl font-bold">4. Conteúdo do Usuário (Licença de Uso)</h2>
            <p>
              Ao publicar uma foto de setup, comentário ou qualquer outro
              conteúdo no Deskly, <strong>você declara ser o autor original da
              imagem ou possuir os direitos necessários para sua divulgação</strong>{" "}
              (incluindo direitos autorais, direito de imagem de pessoas
              retratadas e direitos de marca). Você é o único responsável
              pelo conteúdo que publica.
            </p>
            <p>
              Você concede ao Deskly uma <strong>licença gratuita, não exclusiva,
              global, perpétua (durante o tempo em que o conteúdo permanecer
              publicado) e sublicenciável</strong> para:
            </p>
            <ul className="ml-6 list-disc space-y-1">
              <li>exibir, redimensionar, comprimir e distribuir a imagem dentro da Plataforma e em comunicações da Plataforma (newsletter, redes sociais oficiais);</li>
              <li>gerar previews (Open Graph, Twitter Card) e thumbnails;</li>
              <li>arquivar e fazer backup conforme exigências técnicas e legais;</li>
              <li>indexar metadados (legenda, estilo, produtos marcados) para busca e recomendação.</li>
            </ul>
            <p>
              <strong>Limites desta licença:</strong> não vendemos sua imagem
              isolada como produto, não a usamos em campanhas comerciais
              pagas de terceiros sem autorização adicional, e não a
              utilizamos para treinar modelos de IA de terceiros. A licença
              cessa quando você remove o conteúdo (com prazo de até 30 dias
              para limpeza de caches e backups).
            </p>
            <p>
              Reservamo-nos o direito de remover conteúdo que viole estes
              Termos, leis brasileiras ou direitos de terceiros, sem aviso
              prévio em casos urgentes (conteúdo manifestamente ilícito,
              risco iminente de dano). Procedimento de notificação está em{" "}
              <Link to="/relatar-conteudo" className="text-primary hover:underline">/relatar-conteudo</Link>.
            </p>
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
            <p>É expressamente vedado a qualquer usuário, automatizado ou não:</p>
            <ul className="ml-6 list-disc space-y-1">
              <li>Publicar conteúdo ilegal, ofensivo, discriminatório ou enganoso.</li>
              <li>Spam, automação não autorizada ou criação de contas falsas.</li>
              <li><strong>Extração automatizada de dados (web scraping, crawling, mineração)</strong> de qualquer parte da Plataforma — incluindo setups, fotos, comentários, pontuações de IA, listas de produtos, preços, hotspots e metadados — sem autorização prévia, expressa e por escrito do Deskly. O uso de bots, headless browsers, scripts de coleta em massa ou serviços de terceiros para esse fim viola estes Termos.</li>
              <li><strong>Reprodução do "trade dress" (identidade visual)</strong> do Deskly, incluindo paleta de cores, fontes, layout, ícones, copy, fluxos de UX e diferenciais visuais, em qualquer plataforma concorrente ou correlata, sem autorização escrita.</li>
              <li><strong>Engenharia reversa, descompilação, ofuscação reversa ou tentativa de extrair código-fonte, prompts de IA, lógica de scoring ou estruturas internas</strong> do Deskly.</li>
              <li>Acessar áreas restritas, explorar vulnerabilidades ou contornar mecanismos de autenticação, rate limiting ou monetização.</li>
              <li>Usar a Plataforma, seu conteúdo ou seus dados para treinar modelos de IA de terceiros ou construir serviço concorrente.</li>
              <li>Remover, substituir ou ocultar tags de afiliados em links de saída.</li>
            </ul>
            <p>Violações poderão resultar em bloqueio imediato da conta, ação cível por perdas e danos, e, se aplicável, notificação criminal nos termos do art. 154-A do Código Penal (Lei nº 12.737/2012) e da Lei nº 9.610/1998 (Direitos Autorais).</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold">9. Disponibilidade</h2>
            <p>Empenhamo-nos em manter o Deskly disponível, mas não garantimos funcionamento ininterrupto. Podemos suspender ou encerrar a Plataforma com aviso prévio razoável.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold">10. Limitação de Responsabilidade</h2>
            <p>Na máxima extensão permitida em lei brasileira, e ressalvadas as proteções imperativas do Código de Defesa do Consumidor (Lei nº 8.078/1990):</p>
            <ul className="ml-6 list-disc space-y-1">
              <li>O Deskly e seus operadores <strong>não são responsáveis por danos indiretos, lucros cessantes, perda de oportunidade, dano à imagem ou perda de dados</strong> decorrentes do uso da Plataforma.</li>
              <li>A <strong>responsabilidade total agregada</strong> do Deskly por qualquer reivindicação relacionada à Plataforma fica limitada ao maior valor entre (i) o total efetivamente pago por você ao Deskly nos 12 meses anteriores ao evento que originou a reivindicação, ou (ii) R$ 200,00 (duzentos reais).</li>
              <li>Sugestões geradas por IA, recomendações de produtos e análises de setup são <strong>orientativas e não constituem aconselhamento profissional</strong> (médico, ergonômico, jurídico ou financeiro). Decisões de compra são exclusivas do usuário.</li>
              <li>O Deskly não vende, fabrica, distribui ou estoca os produtos exibidos. As compras são realizadas diretamente nas lojas parceiras (Amazon BR, Mercado Livre, Kabum, Magalu, Pichau etc.), sob os respectivos termos, garantias e políticas de devolução. <strong>Reclamações sobre produtos devem ser direcionadas à loja vendedora.</strong></li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold">11. Indenização (Indemnification)</h2>
            <p>Você concorda em indenizar, defender e manter o Deskly, seus operadores, fornecedores e parceiros isentos de quaisquer reivindicações, perdas, despesas, danos e custos (incluindo honorários advocatícios razoáveis) decorrentes de:</p>
            <ul className="ml-6 list-disc space-y-1">
              <li>violação destes Termos, da política de privacidade ou da lei aplicável por você;</li>
              <li>conteúdo que você publicou que viole direitos de terceiros (imagem, autoral, marca);</li>
              <li>uso não autorizado da sua conta (incluindo por terceiros que tenham obtido sua senha);</li>
              <li>fraude, atividade ilícita ou tentativa de burlar mecanismos de segurança/monetização;</li>
              <li>scraping, mineração ou extração automatizada não autorizada.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold">12. Resolução de Disputas</h2>
            <p>Antes de iniciar qualquer ação judicial, ambas as partes concordam em tentar resolver disputas amigavelmente pelo prazo de 30 dias, mediante notificação escrita ao e-mail <a href="mailto:juridico@deskly.life" className="text-primary hover:underline">juridico@deskly.life</a>.</p>
            <p>Esgotada a tentativa amigável, as partes poderão recorrer ao Poder Judiciário ou, alternativamente, à arbitragem sob as regras da Câmara de Conciliação, Mediação e Arbitragem CIESP/FIESP, à escolha de quem propor a ação primeiro. <strong>Cláusula sem prejuízo às garantias do Código de Defesa do Consumidor.</strong></p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold">13. Notificação e Remoção de Conteúdo (Notice & Takedown)</h2>
            <p>Se você acredita que algum conteúdo na Plataforma viola seus direitos (autorais, imagem, marca, ou outro direito legal), envie notificação para <a href="mailto:juridico@deskly.life" className="text-primary hover:underline">juridico@deskly.life</a> ou pela página <a href="/relatar-conteudo" className="text-primary hover:underline">/relatar-conteudo</a>, contendo:</p>
            <ul className="ml-6 list-disc space-y-1">
              <li>identificação do titular do direito (você ou quem representa);</li>
              <li>URL específica do conteúdo questionado;</li>
              <li>fundamento legal da reclamação;</li>
              <li>declaração de boa-fé de que a reivindicação é legítima.</li>
            </ul>
            <p>Analisaremos em até 5 dias úteis. Notificações abusivas (Lei nº 12.965/2014, Marco Civil da Internet) podem resultar em responsabilização civil do notificante.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold">14. Foro e Lei Aplicável</h2>
            <p>Estes Termos são regidos pelas leis da República Federativa do Brasil. Fica eleito o foro da comarca de domicílio do usuário consumidor para dirimir controvérsias.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold">15. Alterações</h2>
            <p>Podemos atualizar estes Termos. Mudanças <strong>relevantes</strong> (que aumentem responsabilidade do usuário, reduzam direitos ou alterem preço) serão comunicadas por e-mail ou aviso na Plataforma com pelo menos 15 dias de antecedência. Você poderá rescindir gratuitamente nesse período se não concordar. Mudanças <strong>não-relevantes</strong> (correções, ajustes ortográficos, esclarecimentos) entram em vigor na publicação.</p>
            <p>Histórico de versões fica disponível mediante solicitação via <a href="mailto:juridico@deskly.life" className="text-primary hover:underline">juridico@deskly.life</a>.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold">16. Contato</h2>
            <ul className="ml-6 list-disc space-y-1">
              <li>Geral: <a href="mailto:contato@deskly.life" className="text-primary hover:underline">contato@deskly.life</a></li>
              <li>Jurídico / Notificações / DMCA: <a href="mailto:juridico@deskly.life" className="text-primary hover:underline">juridico@deskly.life</a></li>
              <li>Privacidade / LGPD / Encarregado (DPO): <a href="mailto:privacidade@deskly.life" className="text-primary hover:underline">privacidade@deskly.life</a></li>
            </ul>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
