import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/CTA";

export const Route = createFileRoute("/privacidade")({
  head: () => ({
    meta: [
      { title: "Política de Privacidade · Deskly" },
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
        <p className="mt-2 text-sm text-muted-foreground">Última atualização: 10 de maio de 2026</p>

        <div className="prose mt-8 max-w-none space-y-6 text-sm leading-relaxed text-foreground">
          <section>
            <h2 className="font-display text-xl font-bold">1. Quem somos</h2>
            <p>O Deskly (deskly.life) é uma plataforma brasileira de inspiração e análise de home office. Esta política descreve como tratamos seus dados pessoais nos termos da Lei Geral de Proteção de Dados (Lei 13.709/2018 — LGPD).</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold">2. Dados que coletamos</h2>
            <ul className="ml-6 list-disc space-y-1">
              <li><strong>Cadastro</strong>: nome, e-mail, senha (criptografada), foto opcional</li>
              <li><strong>Perfil público</strong>: username, bio, cidade, área profissional</li>
              <li><strong>Conteúdo</strong>: fotos de setup, descrições, comentários, listas de produtos que você publica</li>
              <li><strong>Uso</strong>: análises de IA solicitadas, setups curtidos/salvos</li>
              <li><strong>Pagamentos</strong>: dados de cobrança são processados pela Stripe (não armazenamos número de cartão)</li>
              <li><strong>Técnicos</strong>: IP (hash), navegador, idioma, páginas visitadas — usados para analytics e prevenção de fraude</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold">3. Finalidades</h2>
            <ul className="ml-6 list-disc space-y-1">
              <li>Operar a Plataforma (criar conta, exibir setups, processar análises de IA)</li>
              <li>Cobrar assinaturas (via Stripe)</li>
              <li>Melhorar a experiência (analytics agregadas)</li>
              <li>Comunicação transacional (e-mail de confirmação, redefinição de senha)</li>
              <li>Comunicação opcional (newsletter — você pode descadastrar a qualquer momento)</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold">4. Compartilhamento</h2>
            <p>Não vendemos seus dados pessoais. Compartilhamos apenas com prestadores essenciais:</p>
            <ul className="ml-6 list-disc space-y-1">
              <li><strong>Supabase</strong> (banco de dados e autenticação)</li>
              <li><strong>Stripe</strong> (processamento de pagamentos)</li>
              <li><strong>Google (Gemini API)</strong> (análise de imagens — apenas a foto e contexto, sem identificação pessoal)</li>
              <li><strong>Netlify</strong> (hospedagem)</li>
              <li><strong>Programas de afiliados</strong> (apenas quando você clica em um link — eles recebem informações técnicas anônimas necessárias para atribuir comissões)</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold">5. Seus direitos (LGPD)</h2>
            <p>Você pode, a qualquer momento, solicitar:</p>
            <ul className="ml-6 list-disc space-y-1">
              <li>Acesso aos seus dados pessoais</li>
              <li>Correção de dados incompletos ou incorretos</li>
              <li>Anonimização, bloqueio ou eliminação de dados desnecessários</li>
              <li>Portabilidade dos dados</li>
              <li>Eliminação dos dados pessoais tratados com seu consentimento</li>
              <li>Revogação do consentimento</li>
            </ul>
            <p>Para exercer esses direitos, escreva para <a href="mailto:privacidade@deskly.life" className="text-primary hover:underline">privacidade@deskly.life</a>.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold">6. Cookies</h2>
            <p>Usamos cookies essenciais (autenticação, preferências). Não usamos cookies de rastreamento de terceiros para publicidade comportamental.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold">7. Retenção</h2>
            <p>Mantemos seus dados enquanto sua conta existir. Ao excluir a conta, removemos seus dados pessoais em até 30 dias, exceto quando obrigados por lei a reter (ex: fiscal — 5 anos para faturas).</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold">8. Segurança</h2>
            <p>Aplicamos práticas razoáveis de segurança: HTTPS em todo tráfego, senhas armazenadas com hash, controle de acesso por linhas (RLS) no banco. Nenhum sistema é 100% seguro, mas levamos a sério.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold">9. Crianças</h2>
            <p>O Deskly não é direcionado a menores de 16 anos. Não coletamos intencionalmente dados de crianças.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold">10. Mudanças nesta política</h2>
            <p>Avisaremos sobre mudanças relevantes por e-mail ou aviso na Plataforma com pelo menos 15 dias de antecedência.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold">11. DPO / Contato</h2>
            <p>Encarregado pela proteção de dados: <a href="mailto:privacidade@deskly.life" className="text-primary hover:underline">privacidade@deskly.life</a></p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
