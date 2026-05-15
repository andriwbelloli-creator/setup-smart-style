// HomeOfficeLife · Categorias profissionais — grid with profession-specific cards
/* eslint-disable */

const CATEGORIAS = [
  { id: "dev",       label: "Desenvolvedor",      emoji: null, color: "var(--primary)",          desc: "Código limpo, setup limpo. Monitores, ergonomia e produtividade.",                          copy: "Monte um setup funcional para codar por horas sem dor." },
  { id: "designer",  label: "Designer",            emoji: null, color: "var(--brand-coral-500)",  desc: "Cores calibradas, espaço criativo, conforto para jornadas longas.",                          copy: "Seu espaço criativo impacta direto na qualidade do seu trabalho." },
  { id: "criador",   label: "Criador de conteúdo",  emoji: null, color: "var(--accent)",           desc: "Iluminação, câmera, áudio, estética de fundo e cenário.",                                    copy: "Transforme seu setup em um cenário bonito e produtivo para conteúdo." },
  { id: "gamer",     label: "Gamer",               emoji: null, color: "oklch(0.55 0.15 300)",    desc: "Performance, conforto, iluminação ambiente e organização de cabos.",                          copy: "Um setup organizado melhora até seu gameplay." },
  { id: "psicologo", label: "Psicólogo",           emoji: null, color: "oklch(0.6 0.13 155)",     desc: "Iluminação acolhedora, privacidade, fundo neutro, áudio e câmera.",                          copy: "Crie um ambiente acolhedor e profissional para atendimentos online." },
  { id: "advogado",  label: "Advogado",            emoji: null, color: "oklch(0.42 0.06 230)",    desc: "Organização, postura, ambiente formal, credibilidade visual.",                                copy: "Monte um home office organizado e profissional para reuniões e audiências." },
  { id: "professor", label: "Professor",           emoji: null, color: "var(--warning)",          desc: "Câmera, microfone, iluminação, apoio visual, conforto para aulas longas.",                    copy: "Melhore suas aulas online com um setup mais claro e confortável." },
  { id: "medico",    label: "Médico",              emoji: null, color: "oklch(0.5 0.12 195)",     desc: "Ambiente limpo, iluminação, privacidade, ergonomia, credibilidade.",                          copy: "Tenha um ambiente profissional e confiável para atendimentos." },
  { id: "autonomo",  label: "Autônomo",            emoji: null, color: "var(--wood)",             desc: "Custo-benefício, versatilidade, produtividade com orçamento limitado.",                       copy: "Monte um setup completo sem gastar muito." },
  { id: "estudante", label: "Estudante",           emoji: null, color: "oklch(0.55 0.12 80)",     desc: "Setup compacto, barato, funcional para estudar e produzir de casa.",                          copy: "Estude melhor com um espaço organizado e confortável." },
  { id: "executivo", label: "Executivo",           emoji: null, color: "var(--brand-teal-700)",   desc: "Reuniões online, apresentações, postura profissional, estética premium.",                     copy: "Impressione em videochamadas com um setup premium." },
  { id: "reunioes",  label: "Reuniões online",     emoji: null, color: "oklch(0.45 0.1 210)",     desc: "Câmera, iluminação, fundo, áudio. Foco em profissionalismo em vídeo.",                       copy: "Pareça mais profissional nas suas videochamadas." },
];

const ICONS_MAP = {
  dev:       <><path d="M16 18l6-6-6-6"/><path d="M8 6l-6 6 6 6"/></>,
  designer:  <><circle cx="13.5" cy="6.5" r="2.5"/><path d="M17 2a2.5 2.5 0 0 1 0 5"/><circle cx="6.5" cy="17.5" r="2.5"/><path d="M3 22a2.5 2.5 0 0 1 0-5"/><path d="M14 9L9 14"/></>,
  criador:   <><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></>,
  gamer:     <><rect x="6" y="11" width="12" height="8" rx="2"/><path d="M12 11V7"/><circle cx="12" cy="4" r="2"/></>,
  psicologo: <><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></>,
  advogado:  <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></>,
  professor: <><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></>,
  medico:    <><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></>,
  autonomo:  <><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></>,
  estudante: <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></>,
  executivo: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>,
  reunioes:  <><path d="M15 10l5 5-5 5"/><path d="M4 4v7a4 4 0 0 0 4 4h12"/></>,
};

const Categorias = ({ onSelect }) => (
  <section id="categorias" className="py-16 md:py-24 bg-[var(--cream)]">
    <div className="mx-auto max-w-[1200px] px-6">
      <div className="mx-auto max-w-2xl text-center mb-10">
        <Pill tone="eyebrow" className="mb-4 !text-[10px]">
          <Icon.Sparkles size={11}/> Para cada profissão
        </Pill>
        <h2 style={{ fontFamily: "var(--font-display)" }}
            className="text-[32px] sm:text-[44px] font-bold leading-tight tracking-[-0.025em] text-[var(--foreground)]">
          Setup ideal pra{" "}
          <span style={{ backgroundImage: "var(--gradient-warm)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
            sua profissão
          </span>
        </h2>
        <p className="mt-3 text-[var(--muted-foreground)]">
          Cada trabalho pede um setup diferente. Encontre dicas, kits e inspiração para o seu.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {CATEGORIAS.map(c => (
          <div key={c.id} onClick={() => onSelect?.(c.id)}
               className="group flex cursor-pointer flex-col rounded-[22px] border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--shadow-soft)] transition-all duration-300 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:shadow-[var(--shadow-elegant)]">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl"
                 style={{ background: `color-mix(in oklch, ${c.color} 12%, transparent)` }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c.color}
                   strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {ICONS_MAP[c.id]}
              </svg>
            </div>
            <h3 style={{ fontFamily: "var(--font-display)" }}
                className="text-[16px] font-bold leading-tight text-[var(--foreground)]">{c.label}</h3>
            <p className="mt-1.5 flex-1 text-[13px] leading-relaxed text-[var(--muted-foreground)]">{c.desc}</p>
            <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-[var(--primary)] transition-all group-hover:gap-2">
              Ver dicas <Icon.ArrowRight size={13}/>
            </span>
          </div>
        ))}
      </div>
    </div>
  </section>
);

window.Categorias = Categorias;
