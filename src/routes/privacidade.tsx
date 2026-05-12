import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/CTA";

export const Route = createFileRoute("/privacidade")({
  head: () => ({
    meta: [
      { title: "Política de Privacidade · Deskly" },
      { name: "description", content: "Como o Deskly trata seus dados pessoais nos termos da LGPD (Lei 13.709/2018)." },
      { name: "robots", content: "index,follow" },
    ],
  }),
  component: Privacidade,
});

function Privacidade() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto max-w-3xl px-4 py-12 md:px-6 md:py-20">
        <h1 className="font-display text-4xl font-bold tracking-tight">Política de Privacidade</h1>
        <p className="mt-2 text-sm text-muted-foreground">Última atualização: 12 de maio de 2026 · Versão 2026-05-12</p>

        <div className="mt-6 rounded-2xl border border-primary/20 bg-primary/5 p-5 text-sm leading-relaxed">
          <p className="font-semibold">Resumo em 30 segundos</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
            <li>Coletamos só o necessário pra você usar a Plataforma.</li>
            <li>Não vendemos seus dados. Compartilhamos só com prestadores essenciais (Supabase, Stripe, Google, Netlify).</li>
            <li>Você pode <Link to="/perfil" className="text-primary hover:underline">baixar todos os seus dados</Link> ou <Link to="/perfil" className="text-primary hover:underline">excluir sua conta</Link> a qualquer momento, sozinho, sem precisar nos pedir.</li>
            <li>DPO: <a href="mailto:privacidade@deskly.life" className="text-primary hover:underline">privacidade@deskly.life</a> — respondemos em até 15 dias úteis.</li>
          </ul>
        </div>

        <div className="prose mt-10 max-w-none space-y-8 text-sm leading-relaxed text-foreground">
          <section>
            <h2 className="font-display text-xl font-bold">1. Quem somos (Controlador dos dados)</h2>
            <p>O <strong>Deskly</strong> (deskly.life) é uma plataforma brasileira de inspiração, avaliação e compra de produtos para home office, operada por Andriw Belloli (pessoa física, MEI em constituição). Atuamos como <strong>Controlador</strong> dos seus dados pessoais, nos termos da Lei Geral de Proteção de Dados (Lei 13.709/2018 — LGPD).</p>
            <p className="mt-2"><strong>Contato:</strong> <a href="mailto:privacidade@deskly.life" className="text-primary hover:underline">privacidade@deskly.life</a> · <strong>Encarregado (DPO):</strong> Andriw Belloli.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold">2. Quais dados coletamos</h2>
            <ul className="ml-6 list-disc space-y-1">
              <li><strong>Dados de cadastro</strong>: nome de exibição, e-mail, senha (armazenada apenas como hash bcrypt — nem nós conseguimos ler).</li>
              <li><strong>Dados de perfil público</strong>: username, biografia, cidade, área profissional, foto (você decide o que mostra).</li>
              <li><strong>Conteúdo que você publica</strong>: fotos de setup, descrições, comentários, listas de produtos, curtidas, salvamentos.</li>
              <li><strong>Análises de IA</strong>: a foto que você envia ao Diagnóstico é analisada pelo Google Gemini. Não retemos a imagem após a análise; armazenamos só a nota e dicas geradas.</li>
              <li><strong>Pagamentos</strong>: dados de cobrança vão direto ao Stripe. <strong>Não armazenamos número de cartão.</strong> Recebemos apenas o status da assinatura.</li>
              <li><strong>Dados técnicos</strong>: endereço IP (hash truncado), tipo de navegador, sistema operacional, idioma, páginas visitadas (apenas em log de servidor). Usados para segurança e métricas anônimas.</li>
              <li><strong>Cookies essenciais</strong>: token de sessão (autenticação), preferência de tema. Sem cookies de publicidade ou de rastreamento de terceiros.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold">3. Por que tratamos cada dado (base legal)</h2>
            <p className="mb-2">A LGPD exige que cada uso de dado pessoal tenha base legal. Aqui está a nossa:</p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="py-2 pr-3 font-semibold">Finalidade</th>
                    <th className="py-2 pr-3 font-semibold">Base legal (LGPD art. 7º)</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <Row what="Criar e manter sua conta" base="Execução de contrato (V)" />
                  <Row what="Cobrança de assinatura premium" base="Execução de contrato (V)" />
                  <Row what="Enviar a foto pra IA analisar" base="Consentimento (I) — você clica em 'Analisar'" />
                  <Row what="Exibir seu setup público na galeria" base="Consentimento (I) — você clica em 'Publicar'" />
                  <Row what="Newsletter / comunicação opcional" base="Consentimento (I) — opt-in explícito, descadastro a qualquer momento" />
                  <Row what="Logs de segurança e antifraude" base="Legítimo interesse (IX) — proteção do serviço" />
                  <Row what="Métricas agregadas e anônimas de uso" base="Legítimo interesse (IX)" />
                  <Row what="Cumprir obrigações fiscais/contábeis" base="Cumprimento de obrigação legal (II)" />
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold">4. Com quem compartilhamos seus dados</h2>
            <p>Não vendemos nem alugamos seus dados pessoais para terceiros. Compartilhamos apenas com os <strong>operadores</strong> abaixo, que são essenciais pra operar a Plataforma:</p>
            <ul className="ml-6 mt-2 list-disc space-y-1">
              <li><strong>Supabase Inc.</strong> (EUA) — banco de dados e autenticação. Acordo de Processamento (DPA) padrão Supabase.</li>
              <li><strong>Stripe Payments Europe Ltd.</strong> (Irlanda) — processamento de pagamentos. Cartão é tokenizado pela Stripe; não passa pelos nossos servidores.</li>
              <li><strong>Google LLC</strong> (EUA) — análise de imagens via Gemini API e login OAuth opcional. A foto enviada ao Diagnóstico transita pela API do Gemini.</li>
              <li><strong>Netlify, Inc.</strong> (EUA) — hospedagem das páginas estáticas e funções serverless.</li>
              <li><strong>ImprovMX</strong> (EUA) — encaminhamento de e-mails do domínio deskly.life.</li>
              <li><strong>Programas de afiliados</strong> (Amazon BR, Mercado Livre, Magazine Você, Kabum/Awin) — recebem apenas o clique e o ID de afiliado, sem identificação pessoal. Não compartilhamos sua identidade.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold">5. Transferência internacional de dados</h2>
            <p>Vários dos nossos operadores (Supabase, Stripe, Google, Netlify) processam dados em servidores fora do Brasil — predominantemente EUA e União Europeia. A LGPD permite essa transferência quando o operador adota garantias adequadas (cláusulas contratuais padrão, certificações reconhecidas). Mantemos cópias dos DPAs vigentes; se quiser ver, escreva pro DPO.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold">6. Seus direitos (LGPD art. 18)</h2>
            <p>Você tem o direito a, gratuitamente:</p>
            <ul className="ml-6 mt-2 list-disc space-y-1">
              <li><strong>Confirmar</strong> que tratamos seus dados (art. 18, I);</li>
              <li><strong>Acessar</strong> os dados que mantemos sobre você (art. 18, II);</li>
              <li><strong>Corrigir</strong> dados incompletos, inexatos ou desatualizados (art. 18, III);</li>
              <li><strong>Anonimizar, bloquear ou eliminar</strong> dados desnecessários, excessivos ou tratados em desconformidade (art. 18, IV);</li>
              <li><strong>Portar</strong> seus dados a outro fornecedor (art. 18, V) — disponibilizamos exportação JSON na sua área de perfil;</li>
              <li><strong>Eliminar</strong> dados pessoais tratados com seu consentimento (art. 18, VI) — disponibilizamos botão de exclusão de conta na sua área de perfil;</li>
              <li><strong>Informação</strong> sobre com quem compartilhamos (art. 18, VII) — está na Seção 4;</li>
              <li><strong>Informação</strong> sobre a possibilidade de não consentir (art. 18, VIII) — você pode usar partes da Plataforma sem cadastro;</li>
              <li><strong>Revogar consentimento</strong> (art. 18, IX) — descadastro de e-mails e exclusão da conta a qualquer momento.</li>
            </ul>
            <div className="mt-4 rounded-xl border border-border bg-card p-4">
              <p className="font-semibold">Como exercer seus direitos:</p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li><strong>Self-service:</strong> em <Link to="/perfil" className="text-primary hover:underline">/perfil → Editar perfil</Link> você baixa todos os seus dados em JSON e exclui sua conta com 1 clique.</li>
                <li><strong>E-mail:</strong> <a href="mailto:privacidade@deskly.life" className="text-primary hover:underline">privacidade@deskly.life</a> — respondemos em até 15 dias úteis.</li>
                <li><strong>ANPD:</strong> se acreditar que descumprimos a LGPD, você pode reclamar à <a href="https://www.gov.br/anpd/pt-br" target="_blank" rel="noreferrer" className="text-primary hover:underline">Autoridade Nacional de Proteção de Dados</a>.</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold">7. Tempo de retenção</h2>
            <ul className="ml-6 list-disc space-y-1">
              <li><strong>Conta ativa:</strong> mantemos seus dados enquanto sua conta existir.</li>
              <li><strong>Após exclusão da conta:</strong> dados pessoais são removidos em até 30 dias.</li>
              <li><strong>Logs de segurança:</strong> 6 meses.</li>
              <li><strong>Faturas e dados fiscais:</strong> 5 anos (obrigação legal — Código Tributário Nacional).</li>
              <li><strong>Inatividade:</strong> contas inativas por mais de 24 meses recebem aviso por e-mail; sem resposta em 30 dias, são excluídas.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold">8. Cookies e tecnologias similares</h2>
            <p>Usamos apenas <strong>cookies essenciais</strong>:</p>
            <ul className="ml-6 mt-2 list-disc space-y-1">
              <li><code>sb-*</code> (Supabase Auth) — mantém você logado entre páginas.</li>
              <li><code>deskly_cookie_consent</code> — guarda que você viu o aviso de cookies.</li>
              <li><code>theme</code> — preferência de tema claro/escuro (se ativado).</li>
            </ul>
            <p className="mt-2">Não usamos cookies de rastreamento de terceiros (Facebook Pixel, Google Analytics, etc.) na versão atual. Caso adicionemos no futuro, será com opt-in explícito.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold">9. Segurança e incidentes</h2>
            <p>Aplicamos medidas técnicas e administrativas razoáveis pra proteger seus dados:</p>
            <ul className="ml-6 mt-2 list-disc space-y-1">
              <li>HTTPS (TLS 1.3) em todas as comunicações.</li>
              <li>Senhas armazenadas com hash bcrypt (irreversível).</li>
              <li>Controle de acesso por linhas (Row Level Security) no banco — você só lê e escreve dados seus.</li>
              <li>Endpoints da IA exigem autenticação (JWT) pra prevenir abuso.</li>
              <li>Backups diários do banco com criptografia em repouso.</li>
            </ul>
            <p className="mt-3">Em caso de <strong>incidente de segurança</strong> que afete dados pessoais e represente risco/dano relevante a você (LGPD art. 48):</p>
            <ul className="ml-6 mt-2 list-disc space-y-1">
              <li>Notificaremos a ANPD em até 2 dias úteis a partir da ciência;</li>
              <li>Notificaremos os titulares afetados por e-mail descrevendo o que aconteceu, quais dados foram afetados e como mitigar.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold">10. Crianças e adolescentes</h2>
            <p>O Deskly é direcionado a maiores de 18 anos. Não coletamos intencionalmente dados de menores. Se você é responsável por um menor cujos dados foram coletados sem seu consentimento, escreva para o DPO que removemos imediatamente.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold">11. Mudanças nesta Política</h2>
            <p>Podemos atualizar esta Política para refletir mudanças no serviço ou na legislação. Mudanças relevantes serão comunicadas por e-mail ou aviso na Plataforma com pelo menos <strong>15 dias de antecedência</strong>. A data e versão da última atualização estão sempre no topo desta página.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold">12. Foro</h2>
            <p>Fica eleito o foro da comarca da cidade do titular dos dados como competente para dirimir quaisquer controvérsias relativas a esta Política, sem prejuízo de qualquer outro mais benéfico ao consumidor (CDC art. 101, I).</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function Row({ what, base }: { what: string; base: string }) {
  return (
    <tr className="border-b border-border/50">
      <td className="py-2 pr-3">{what}</td>
      <td className="py-2 pr-3">{base}</td>
    </tr>
  );
}
