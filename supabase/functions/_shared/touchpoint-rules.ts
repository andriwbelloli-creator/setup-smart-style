// Motor de regras dos touchpoints — pure TypeScript, sem dependências externas.
// Roda dentro da edge function `analyze-homeoffice-image` e (no futuro)
// também pode rodar no client pra preview imediato sem chamar IA de novo.
//
// PRINCÍPIO: regras transformam SINAIS visuais (output do Gemini) em
// TOUCHPOINTS recomendados. Nada de inventar. Se não tem sinal, não recomenda.
//
// HOOK PARA AFILIADOS:
//   Cada touchpoint tem `partners: string[]` (slugs de partners table) e
//   `commercial_category`. No futuro, o frontend lê esses slugs e busca
//   `search_url_template` em public.partners pra montar o link afiliado.

export type ProfileType =
  | "geral" | "dev" | "designer" | "advogado" | "medico" | "psicologo"
  | "professor" | "autonomo" | "consultor" | "criador" | "executivo";

export type Priority = "high" | "medium" | "low";

/** Output do Gemini (schema fixo — validado antes de chegar aqui) */
export interface GeminiSignals {
  elementos_detectados: {
    mesa: boolean;
    cadeira: boolean;
    monitor: boolean;
    notebook: boolean;
    teclado: boolean;
    mouse: boolean;
    suporte_notebook: boolean;
    luminaria: boolean;
    janela: boolean;
    cortina: boolean;
    planta: boolean;
    estante: boolean;
    prateleira: boolean;
    papel_de_parede: boolean;
    quadros: boolean;
    tapete: boolean;
    cabos_visiveis: boolean;
    dock_ou_hub: boolean;
    webcam: boolean;
    microfone: boolean;
    parede_vazia: boolean;
    objetos_decorativos: boolean;
  };
  sinais_visuais: {
    pouca_iluminacao: boolean;
    excesso_de_luz: boolean;
    possivel_reflexo_na_tela: boolean;
    mesa_desorganizada: boolean;
    cabos_aparentes: boolean;
    fundo_vazio: boolean;
    fundo_poluito: boolean;
    setup_frio_sem_elementos_naturais: boolean;
    falta_de_armazenamento: boolean;
    possivel_baixa_ergonomia: boolean;
    ambiente_com_pouca_personalidade: boolean;
    cenario_pouco_profissional: boolean;
    risco_de_ruido_visual: boolean;
    possivel_problema_acustico: boolean;
  };
  scores_iniciais: {
    ergonomia: number;
    iluminacao: number;
    organizacao: number;
    gestao_de_cabos: number;
    decoracao: number;
    fundo_para_video: number;
    acustica_provavel: number;
    produtividade: number;
  };
  observacoes_objetivas: string[];
  nivel_confianca_geral: number;
}

export interface Touchpoint {
  item: string;
  category: string;
  commercial_category: string;
  visual_evidence: string;
  problem: string;
  impact: string;
  recommendation: string;
  priority: Priority;
  confidence: number;
  estimated_budget: string;
  partners: string[];
  is_recommended: true;
}

export interface NotRecommended {
  item: string;
  is_recommended: false;
  reason: string;
}

export type AnyTouchpoint = Touchpoint | NotRecommended;

export interface RulesResult {
  recommended: Touchpoint[];
  not_recommended: NotRecommended[];
  /** Score derivado das regras (pode diferir levemente do Gemini) */
  weighted_scores: Record<string, number>;
}

// ============================================================================
// Helpers de prioridade por perfil
// ============================================================================

/** Tabela de boost de prioridade por (item, perfil). +1 = sobe um nível. */
const PROFILE_PRIORITY: Record<string, Partial<Record<ProfileType, number>>> = {
  planta: {
    psicologo: 2, criador: 1, designer: 1, executivo: 1,
    advogado: 0, medico: 0, professor: 0, dev: -1, autonomo: 0, consultor: 0, geral: 0,
  },
  estante: {
    advogado: 2, professor: 2, psicologo: 1, consultor: 1, executivo: 1,
    medico: 1, criador: 0, designer: 0, dev: 0, autonomo: 0, geral: 0,
  },
  cortina: {
    psicologo: 1, medico: 1, advogado: 1, professor: 1, criador: 1,
    executivo: 1, consultor: 1, designer: 0, dev: 0, autonomo: 0, geral: 0,
  },
  webcam: {
    professor: 2, psicologo: 2, advogado: 2, medico: 2, criador: 2,
    executivo: 2, consultor: 1, designer: 0, dev: 0, autonomo: 0, geral: 0,
  },
  microfone: {
    professor: 2, psicologo: 2, criador: 2, advogado: 1, medico: 1,
    executivo: 1, consultor: 1, designer: 0, dev: 0, autonomo: 0, geral: 0,
  },
  monitor: {
    dev: 2, designer: 2, professor: 1, consultor: 1, executivo: 1,
    criador: 1, advogado: 0, medico: 0, psicologo: 0, autonomo: 0, geral: 0,
  },
  suporte_notebook: {
    dev: 2, designer: 1, professor: 1, consultor: 1, autonomo: 1,
    advogado: 0, medico: 0, psicologo: 0, criador: 0, executivo: 0, geral: 0,
  },
  papel_de_parede: {
    criador: 2, psicologo: 1, designer: 1, executivo: 0, advogado: 0,
    medico: 0, professor: 0, dev: -1, autonomo: 0, consultor: 0, geral: 0,
  },
  tapete: {
    psicologo: 2, criador: 1, designer: 1, professor: 1, executivo: 1,
    advogado: 0, medico: 0, dev: 0, autonomo: 0, consultor: 0, geral: 0,
  },
  quadro: {
    advogado: 2, executivo: 1, consultor: 1, psicologo: 1, criador: 1,
    medico: 0, professor: 0, dev: 0, designer: 0, autonomo: 0, geral: 0,
  },
  luminaria: {
    psicologo: 2, criador: 2, designer: 1, medico: 1, advogado: 1,
    professor: 1, executivo: 1, consultor: 1, dev: 1, autonomo: 1, geral: 1,
  },
  organizador_cabos: {
    dev: 2, designer: 1, criador: 1, consultor: 1, executivo: 1,
    advogado: 1, medico: 1, professor: 1, psicologo: 1, autonomo: 1, geral: 1,
  },
  cadeira: {
    dev: 2, designer: 2, advogado: 1, executivo: 1, consultor: 1,
    professor: 1, psicologo: 1, medico: 1, criador: 0, autonomo: 1, geral: 1,
  },
  mesa: {
    dev: 1, designer: 1, criador: 1, professor: 1, executivo: 1,
    advogado: 1, medico: 1, psicologo: 1, consultor: 1, autonomo: 1, geral: 1,
  },
};

function adjustPriority(item: string, base: Priority, profile: ProfileType): Priority {
  const boost = PROFILE_PRIORITY[item]?.[profile] ?? 0;
  const order: Priority[] = ["low", "medium", "high"];
  const idx = Math.max(0, Math.min(2, order.indexOf(base) + boost));
  return order[idx];
}

// ============================================================================
// REGRAS — cada função retorna Touchpoint[] | NotRecommended[]
// ============================================================================

function ruleCortina(s: GeminiSignals, profile: ProfileType): AnyTouchpoint[] {
  const e = s.elementos_detectados;
  const v = s.sinais_visuais;

  if (!e.janela) {
    return [{ item: "cortina", is_recommended: false,
      reason: "Sem janela visível na imagem — cortina não se aplica." }];
  }
  const needs = !e.cortina || v.excesso_de_luz || v.possivel_reflexo_na_tela;
  if (!needs) {
    return [{ item: "cortina", is_recommended: false,
      reason: "Janela já tem cortina adequada e não há sinal de excesso de luz." }];
  }

  const priority = adjustPriority("cortina",
    (v.possivel_reflexo_na_tela || v.excesso_de_luz) ? "high" : "medium",
    profile);

  return [{
    item: "cortina",
    category: "iluminacao_conforto_visual",
    commercial_category: v.possivel_reflexo_na_tela ? "cortina_blackout" : "cortina_rolo",
    visual_evidence: `Janela ${e.cortina ? "com cortina insuficiente" : "sem cortina"} ` +
      (v.excesso_de_luz ? "com excesso de luz" : v.possivel_reflexo_na_tela ? "causando reflexo na tela" : "exposta"),
    problem: "Luz solar direta gera reflexo e fadiga visual ao longo do dia.",
    impact: "Reduz reflexo na tela, melhora ergonomia visual e qualidade do fundo em videochamadas.",
    recommendation: v.possivel_reflexo_na_tela
      ? "Cortina blackout ou rolo blecaute, instalada no topo do batente."
      : "Cortina rolo ou persiana ajustável pra controlar a intensidade da luz.",
    priority,
    confidence: v.possivel_reflexo_na_tela ? 90 : 75,
    estimated_budget: "R$ 120 a R$ 500",
    partners: ["leroy_merlin", "madeira_madeira", "tokstok", "mobly"],
    is_recommended: true,
  }];
}

function ruleLuminaria(s: GeminiSignals, profile: ProfileType): AnyTouchpoint[] {
  const e = s.elementos_detectados;
  const v = s.sinais_visuais;
  const sc = s.scores_iniciais;

  const fundoBaixo = sc.fundo_para_video < 60;
  const needs = !e.luminaria && (v.pouca_iluminacao || fundoBaixo);

  if (!needs) {
    if (e.luminaria) {
      return [{ item: "luminaria", is_recommended: false,
        reason: "Já há luminária visível e iluminação adequada." }];
    }
    return [];
  }

  const priority = adjustPriority("luminaria", v.pouca_iluminacao ? "high" : "medium", profile);

  return [{
    item: "luminaria",
    category: "iluminacao",
    commercial_category: "luminaria_mesa",
    visual_evidence: v.pouca_iluminacao
      ? "Ambiente com iluminação geral baixa"
      : "Falta de luz pontual sobre a mesa de trabalho",
    problem: "Baixa iluminação causa fadiga visual e empobrece a aparência em videochamadas.",
    impact: "Iluminação frontal/lateral suaviza sombras, melhora foco e qualidade de imagem.",
    recommendation: "Luminária de mesa LED com braço articulado, 5000K (luz neutra) e ajuste de intensidade.",
    priority,
    confidence: 80,
    estimated_budget: "R$ 90 a R$ 350",
    partners: ["amazon_br", "tokstok", "leroy_merlin", "mercado_livre"],
    is_recommended: true,
  }];
}

function rulePlanta(s: GeminiSignals, profile: ProfileType): AnyTouchpoint[] {
  const e = s.elementos_detectados;
  const v = s.sinais_visuais;

  if (e.planta) {
    return [{ item: "planta", is_recommended: false,
      reason: "A imagem já apresenta elementos naturais suficientes." }];
  }
  const needs = v.setup_frio_sem_elementos_naturais || v.ambiente_com_pouca_personalidade;
  if (!needs) return [];

  const priority = adjustPriority("planta", "medium", profile);

  return [{
    item: "planta",
    category: "decoracao_natural",
    commercial_category: "planta_decorativa_interior",
    visual_evidence: "Ambiente sem elementos naturais visíveis",
    problem: "Espaços sem vegetação tendem a ser mentalmente cansativos em jornadas longas.",
    impact: "Plantas reduzem estresse percebido, melhoram acolhimento visual e aparência em chamadas.",
    recommendation: profile === "psicologo"
      ? "Planta de médio porte (jiboia, samambaia) em vaso neutro, ao lado da câmera."
      : "Planta pequena/média de baixa manutenção (suculenta, zamioculca, jiboia).",
    priority,
    confidence: 75,
    estimated_budget: "R$ 40 a R$ 200",
    partners: ["cobasi", "petz", "tokstok", "leroy_merlin"],
    is_recommended: true,
  }];
}

function ruleEstante(s: GeminiSignals, profile: ProfileType): AnyTouchpoint[] {
  const e = s.elementos_detectados;
  const v = s.sinais_visuais;

  if (e.estante) {
    return [{ item: "estante", is_recommended: false,
      reason: "Estante já presente no ambiente." }];
  }
  const needs = v.parede_vazia || v.fundo_vazio || v.falta_de_armazenamento;
  if (!needs) return [];

  const priorityBoost = ["advogado", "professor", "psicologo", "consultor", "executivo"].includes(profile);
  const priority = adjustPriority("estante", priorityBoost ? "high" : "medium", profile);

  return [{
    item: "estante",
    category: "armazenamento_decoracao",
    commercial_category: "estante_livros",
    visual_evidence: v.parede_vazia ? "Parede vazia atrás do setup" :
      v.falta_de_armazenamento ? "Falta evidente de armazenamento organizado" : "Fundo visualmente vazio",
    problem: "Fundo vazio reduz autoridade visual e dificulta organização de materiais.",
    impact: "Estante adiciona credibilidade ao fundo em videochamadas e organiza livros/material.",
    recommendation: ["advogado", "executivo", "professor"].includes(profile)
      ? "Estante modular em madeira escura ou clara, parcialmente preenchida com livros relevantes da área."
      : "Estante compacta de parede pra exibir livros, plantas e objetos decorativos.",
    priority,
    confidence: 80,
    estimated_budget: "R$ 300 a R$ 1500",
    partners: ["tokstok", "madeira_madeira", "mobly", "amazon_br"],
    is_recommended: true,
  }];
}

function rulePapelParede(s: GeminiSignals, profile: ProfileType): AnyTouchpoint[] {
  const v = s.sinais_visuais;
  const e = s.elementos_detectados;

  if (v.fundo_poluito || e.objetos_decorativos) {
    return [{ item: "papel_de_parede", is_recommended: false,
      reason: "Fundo já tem elementos decorativos suficientes — adicionar papel pode poluir." }];
  }
  const needs = v.parede_vazia && v.ambiente_com_pouca_personalidade && !v.fundo_poluito;
  if (!needs) return [];

  const priority = adjustPriority("papel_de_parede", "low", profile);

  return [{
    item: "papel_de_parede",
    category: "decoracao_parede",
    commercial_category: "papel_de_parede_adesivo",
    visual_evidence: "Parede de fundo lisa e sem personalidade",
    problem: "Fundo neutro demais transmite sensação de ambiente impessoal/temporário.",
    impact: "Papel de parede sutil adiciona profundidade visual sem competir com a presença em câmera.",
    recommendation: profile === "criador"
      ? "Papel de parede com textura/cor de marca pessoal, contraste sutil com o fundo."
      : "Papel de parede liso ou geométrico discreto, tons terrosos ou cinza-azulado.",
    priority,
    confidence: 65,
    estimated_budget: "R$ 80 a R$ 400 (rolo)",
    partners: ["leroy_merlin", "madeira_madeira", "mobly"],
    is_recommended: true,
  }];
}

function ruleOrganizadorCabos(s: GeminiSignals, profile: ProfileType): AnyTouchpoint[] {
  const v = s.sinais_visuais;
  const e = s.elementos_detectados;

  const needs = e.cabos_visiveis || v.cabos_aparentes;
  if (!needs) return [];

  const priority = adjustPriority("organizador_cabos", "high", profile);

  return [{
    item: "organizador_de_cabos",
    category: "organizacao_cabos",
    commercial_category: "organizador_cabos_calha",
    visual_evidence: "Cabos visíveis no chão ou na mesa, sem cobertura",
    problem: "Cabos expostos prejudicam estética, dificultam limpeza e aumentam risco de tropeço.",
    impact: "Organização de cabos limpa visualmente o setup e reduz risco físico.",
    recommendation: "Kit com calha de mesa, abraçadeiras de velcro e canaleta de parede.",
    priority,
    confidence: 85,
    estimated_budget: "R$ 50 a R$ 200",
    partners: ["amazon_br", "mercado_livre", "kalunga", "shopee"],
    is_recommended: true,
  }];
}

function ruleSuporteNotebook(s: GeminiSignals, profile: ProfileType): AnyTouchpoint[] {
  const e = s.elementos_detectados;
  const v = s.sinais_visuais;

  if (!e.notebook) return [];
  if (e.suporte_notebook) {
    return [{ item: "suporte_notebook", is_recommended: false,
      reason: "Notebook já está em suporte adequado." }];
  }
  const needs = !e.monitor || v.possivel_baixa_ergonomia;
  if (!needs) return [];

  const priority = adjustPriority("suporte_notebook", v.possivel_baixa_ergonomia ? "high" : "medium", profile);

  return [{
    item: "suporte_notebook",
    category: "ergonomia",
    commercial_category: "suporte_notebook_aluminio",
    visual_evidence: e.monitor
      ? "Notebook na mesa em altura baixa, sem suporte"
      : "Notebook usado como tela principal, em altura baixa",
    problem: "Tela abaixo da linha dos olhos força flexão cervical contínua.",
    impact: "Suporte eleva a tela, alivia pescoço/coluna e permite usar teclado externo.",
    recommendation: "Suporte de notebook em alumínio com altura ajustável, idealmente combinado com teclado externo.",
    priority,
    confidence: 88,
    estimated_budget: "R$ 90 a R$ 300",
    partners: ["amazon_br", "mercado_livre", "kalunga"],
    is_recommended: true,
  }];
}

function ruleMonitor(s: GeminiSignals, profile: ProfileType): AnyTouchpoint[] {
  const e = s.elementos_detectados;

  if (!e.notebook || e.monitor) return [];
  const profilesNeedingMonitor: ProfileType[] = ["dev", "designer", "professor", "consultor", "executivo", "geral"];
  if (!profilesNeedingMonitor.includes(profile)) return [];

  const priority = adjustPriority("monitor", "medium", profile);

  return [{
    item: "monitor",
    category: "produtividade",
    commercial_category: "monitor_externo",
    visual_evidence: "Notebook como única tela visível",
    problem: "Uma tela só limita produtividade — context switching constante em apps + chamadas.",
    impact: profile === "dev" || profile === "designer"
      ? "Segunda tela reduz tempo de troca de contexto em ~30%."
      : "Permite ver apresentação + alunos/clientes ao mesmo tempo.",
    recommendation: profile === "designer"
      ? 'Monitor IPS 27" com calibração de cor (sRGB 99%+).'
      : profile === "dev"
      ? 'Monitor 27" 4K ou ultrawide 34" pra editor + browser lado a lado.'
      : 'Monitor 24"–27" Full HD com entrada HDMI/USB-C.',
    priority,
    confidence: 75,
    estimated_budget: profile === "designer" || profile === "dev" ? "R$ 1500 a R$ 4000" : "R$ 700 a R$ 1500",
    partners: ["amazon_br", "mercado_livre", "magalu", "kalunga"],
    is_recommended: true,
  }];
}

function ruleTapete(s: GeminiSignals, profile: ProfileType): AnyTouchpoint[] {
  const e = s.elementos_detectados;
  const v = s.sinais_visuais;

  if (e.tapete) {
    return [{ item: "tapete", is_recommended: false,
      reason: "Já há tapete na cena." }];
  }
  const needs = v.possivel_problema_acustico || (v.fundo_vazio && v.setup_frio_sem_elementos_naturais);
  if (!needs) return [];

  const priority = adjustPriority("tapete", v.possivel_problema_acustico ? "high" : "medium", profile);

  return [{
    item: "tapete",
    category: "acustica_conforto",
    commercial_category: "tapete_grande",
    visual_evidence: v.possivel_problema_acustico
      ? "Piso duro + paredes nuas — alto risco de eco em chamadas"
      : "Ambiente visualmente frio, sem elementos têxteis",
    problem: "Pisos duros refletem som — eco prejudica chamadas e qualidade de gravação.",
    impact: "Tapete absorve som, aquece visualmente e delimita o espaço de trabalho.",
    recommendation: "Tapete grande de fibras naturais (2x3m) sob a mesa e cadeira.",
    priority,
    confidence: 70,
    estimated_budget: "R$ 200 a R$ 1200",
    partners: ["tokstok", "mobly", "madeira_madeira"],
    is_recommended: true,
  }];
}

function ruleQuadro(s: GeminiSignals, profile: ProfileType): AnyTouchpoint[] {
  const e = s.elementos_detectados;
  const v = s.sinais_visuais;

  if (e.quadros) {
    return [{ item: "quadro", is_recommended: false,
      reason: "Quadros já presentes no fundo." }];
  }
  const needs = v.parede_vazia && !e.papel_de_parede && v.ambiente_com_pouca_personalidade;
  if (!needs) return [];

  const priority = adjustPriority("quadro", "low", profile);

  return [{
    item: "quadro_decorativo",
    category: "decoracao_parede",
    commercial_category: "quadro_decorativo",
    visual_evidence: "Parede vazia sem nenhum elemento decorativo",
    problem: "Fundo vazio gera ambiente impessoal e prejudica presença em câmera.",
    impact: "Quadros adicionam personalidade controlada e melhoram o fundo de videochamadas.",
    recommendation: profile === "advogado" || profile === "executivo"
      ? "1–2 quadros de arte abstrata ou diploma emoldurado em fundo neutro."
      : "Grupo de 3 quadros pequenos em moldura neutra, alinhados na parede atrás da câmera.",
    priority,
    confidence: 70,
    estimated_budget: "R$ 80 a R$ 400",
    partners: ["tokstok", "mobly", "madeira_madeira", "amazon_br"],
    is_recommended: true,
  }];
}

function ruleWebcamMic(s: GeminiSignals, profile: ProfileType): AnyTouchpoint[] {
  const e = s.elementos_detectados;
  const sc = s.scores_iniciais;

  const profilesNeedingAV: ProfileType[] = [
    "professor", "psicologo", "consultor", "advogado", "medico", "criador", "executivo",
  ];
  if (!profilesNeedingAV.includes(profile)) return [];

  const out: AnyTouchpoint[] = [];

  const lowBg = sc.fundo_para_video < 65 || sc.iluminacao < 65;

  if (!e.webcam && lowBg) {
    out.push({
      item: "webcam",
      category: "video_chamadas",
      commercial_category: "webcam_full_hd",
      visual_evidence: "Sem webcam dedicada — provavelmente usando câmera do notebook",
      problem: "Câmera de notebook ângulo baixo + baixa resolução prejudica presença profissional.",
      impact: "Webcam Full HD/4K em altura dos olhos transmite credibilidade em chamadas.",
      recommendation: profile === "medico" || profile === "executivo"
        ? "Webcam 4K com autofoco e captura de áudio."
        : "Webcam Full HD com autofoco, montada acima do monitor.",
      priority: adjustPriority("webcam", "high", profile),
      confidence: 70,
      estimated_budget: "R$ 250 a R$ 1200",
      partners: ["amazon_br", "mercado_livre", "kalunga"],
      is_recommended: true,
    });
  }
  if (!e.microfone && (profile === "professor" || profile === "criador" || profile === "psicologo")) {
    out.push({
      item: "microfone",
      category: "video_chamadas",
      commercial_category: "microfone_usb_condensador",
      visual_evidence: "Sem microfone dedicado — usando microfone do notebook/webcam",
      problem: "Áudio é 60% da qualidade percebida em aulas/atendimentos online.",
      impact: "Microfone direcional reduz ruído ambiente e aumenta clareza da voz.",
      recommendation: profile === "criador"
        ? "Microfone condensador cardioide USB-C ou shotgun montado em braço articulado."
        : "Microfone USB direcional com filtro pop, em braço articulado.",
      priority: adjustPriority("microfone", "high", profile),
      confidence: 75,
      estimated_budget: "R$ 250 a R$ 900",
      partners: ["amazon_br", "mercado_livre", "kalunga"],
      is_recommended: true,
    });
  }
  return out;
}

// ============================================================================
// Rules ambientais/ergonomia 2 — cadeira, mesa, painel acústico, dock/hub, prateleira
// ============================================================================

function ruleCadeira(s: GeminiSignals, profile: ProfileType): AnyTouchpoint[] {
  const e = s.elementos_detectados;
  const v = s.sinais_visuais;

  // Sem cadeira detectada — provavelmente perfil incompleto, não recomenda
  // (foto pode ter sido cortada). Só sugere se há SINAL claro de baixa ergonomia.
  if (!e.cadeira) {
    if (!v.possivel_baixa_ergonomia) return [];
  } else if (!v.possivel_baixa_ergonomia) {
    return [{ item: "cadeira", is_recommended: false,
      reason: "Cadeira já presente e sem sinal de problema ergonômico." }];
  }

  const priority = adjustPriority(
    "cadeira",
    v.possivel_baixa_ergonomia ? "high" : "medium",
    profile,
  );

  return [{
    item: "cadeira_ergonomica",
    category: "ergonomia",
    commercial_category: "cadeira_ergonomica_mesh",
    visual_evidence: e.cadeira
      ? "Cadeira sem suporte lombar visível / postura inadequada"
      : "Sem cadeira ergonômica adequada no setup",
    problem: "Cadeira sem suporte lombar provoca dor cervical/lombar em jornadas longas — principal causa de afastamento por LER/DORT.",
    impact: "Cadeira ergonômica reduz dor crônica, aumenta concentração e estende vida útil profissional.",
    recommendation: profile === "executivo" || profile === "advogado"
      ? "Cadeira executiva em couro/courino com apoio cervical e ajuste lombar (Herman Miller Aeron ou DT3 Elise)."
      : profile === "dev" || profile === "designer"
      ? "Cadeira ergonômica mesh com 5 ajustes (altura, encosto, apoio lombar, braços, base) — investimento de 5+ anos."
      : "Cadeira de escritório com apoio lombar ajustável e malha respirável.",
    priority,
    confidence: e.cadeira ? 70 : 80,
    estimated_budget: profile === "executivo" || profile === "advogado"
      ? "R$ 1500 a R$ 4000"
      : "R$ 600 a R$ 2200",
    partners: ["amazon_br", "mercado_livre", "tokstok", "madeira_madeira", "mobly"],
    is_recommended: true,
  }];
}

function ruleMesa(s: GeminiSignals, profile: ProfileType): AnyTouchpoint[] {
  const e = s.elementos_detectados;
  const v = s.sinais_visuais;

  if (e.mesa) {
    return [{ item: "mesa", is_recommended: false,
      reason: "Mesa já presente no setup." }];
  }
  // Se há cadeira mas não mesa, provavelmente improviso (cama, sofá) — recomenda mesa.
  // Senão, sem sinal claro, não sugere (foto pode ter cortado).
  if (!e.cadeira && !v.possivel_baixa_ergonomia) return [];

  const priority = adjustPriority("mesa", "high", profile);

  return [{
    item: "mesa",
    category: "ergonomia",
    commercial_category: "mesa_escritorio",
    visual_evidence: "Setup improvisado sem mesa dedicada (cama, sofá, mesa de jantar)",
    problem: "Trabalhar sem mesa dedicada gera má postura, encurtamento muscular e baixa produtividade — sinal claro de improviso.",
    impact: "Mesa dedicada cria limite mental trabalho/descanso, melhora postura e separa contextos físicos.",
    recommendation: profile === "dev" || profile === "designer"
      ? "Mesa ampla 140x70cm (ou maior) com altura 72-76cm. Considere mesa regulável se sentar/ficar de pé varia."
      : "Mesa de escritório 120x60cm em altura 72-76cm. Madeira maciça ou MDF reforçado.",
    priority,
    confidence: 75,
    estimated_budget: "R$ 400 a R$ 2000",
    partners: ["tokstok", "madeira_madeira", "mobly", "magalu"],
    is_recommended: true,
  }];
}

function rulePainelAcustico(s: GeminiSignals, profile: ProfileType): AnyTouchpoint[] {
  const v = s.sinais_visuais;

  // Painel acústico não está no schema do Gemini ainda — recomenda baseado em
  // possivel_problema_acustico + perfil que faz muita chamada/gravação.
  if (!v.possivel_problema_acustico) return [];
  const acousticProfiles: ProfileType[] = ["professor", "psicologo", "criador", "advogado", "medico", "consultor", "executivo"];
  if (!acousticProfiles.includes(profile)) return [];

  const priority = adjustPriority("tapete", "medium", profile);

  return [{
    item: "painel_acustico",
    category: "acustica",
    commercial_category: "painel_acustico_decorativo",
    visual_evidence: "Paredes nuas + piso duro detectados — eco provável em chamadas/gravações",
    problem: "Eco prejudica clareza da voz, fadiga ouvinte e reduz qualidade percebida do conteúdo/atendimento.",
    impact: profile === "criador" || profile === "professor"
      ? "Painéis absorvem reverberação — áudio profissional sem precisar de pós-produção."
      : "Reduz eco em atendimentos online, melhora discrição da conversa e qualidade percebida.",
    recommendation: profile === "criador"
      ? "8-12 painéis acústicos 30x30cm dispostos em padrão hexagonal atrás da câmera + tapete grande."
      : "4-6 painéis acústicos decorativos (espuma ou fibra mineral) na parede atrás do microfone.",
    priority,
    confidence: 60,
    estimated_budget: profile === "criador" ? "R$ 300 a R$ 1500" : "R$ 150 a R$ 500",
    partners: ["amazon_br", "mercado_livre", "leroy_merlin", "shopee"],
    is_recommended: true,
  }];
}

function ruleDockHub(s: GeminiSignals, profile: ProfileType): AnyTouchpoint[] {
  const e = s.elementos_detectados;
  const v = s.sinais_visuais;

  // Dock/hub faz sentido se: tem notebook + muitos cabos visíveis +
  // não tem dock já. Sinal forte = cabos_visiveis + cabos_aparentes simultâneos.
  if (e.dock_ou_hub) {
    return [{ item: "dock_hub", is_recommended: false,
      reason: "Dock/hub já presente no setup." }];
  }
  if (!e.notebook) return [];
  if (!e.cabos_visiveis && !v.cabos_aparentes) return [];

  const priority = adjustPriority("organizador_cabos", "medium", profile);

  return [{
    item: "dock_hub",
    category: "produtividade",
    commercial_category: "dock_usb_c",
    visual_evidence: "Notebook com múltiplos cabos saindo direto (HDMI, USB, ethernet, power)",
    problem: "Conectar/desconectar cabos avulsos várias vezes por dia desgasta as portas USB-C e aumenta poluição visual.",
    impact: "Dock single-cable libera todas as portas com um único conector — setup mais limpo e portas duram mais.",
    recommendation: profile === "dev" || profile === "designer"
      ? "Dock USB-C com PD 100W, 2x HDMI, 4x USB-A, Ethernet Gigabit (CalDigit TS4, Anker 575)."
      : "Hub USB-C 7-em-1 com HDMI 4K, 3x USB, leitor SD, PD passthrough.",
    priority,
    confidence: 70,
    estimated_budget: profile === "dev" || profile === "designer"
      ? "R$ 800 a R$ 3000 (dock thunderbolt)"
      : "R$ 150 a R$ 400 (hub USB-C)",
    partners: ["amazon_br", "kalunga", "mercado_livre", "magalu"],
    is_recommended: true,
  }];
}

function rulePrateleira(s: GeminiSignals, profile: ProfileType): AnyTouchpoint[] {
  const e = s.elementos_detectados;
  const v = s.sinais_visuais;

  if (e.prateleira) {
    return [{ item: "prateleira", is_recommended: false,
      reason: "Prateleira já presente no setup." }];
  }
  // Prateleira é mais leve que estante — bom pra setups pequenos sem
  // espaço pra estante grande. Recomenda se parede vazia + falta de
  // armazenamento mas SEM espaço pra estante (apê pequeno).
  if (e.estante) {
    return [{ item: "prateleira", is_recommended: false,
      reason: "Estante já provê o armazenamento necessário." }];
  }
  if (!v.parede_vazia && !v.falta_de_armazenamento) return [];

  const priority = adjustPriority("estante", "low", profile);

  return [{
    item: "prateleira",
    category: "armazenamento_leve",
    commercial_category: "prateleira_parede",
    visual_evidence: "Parede vazia / falta de armazenamento, mas sem espaço pra estante completa",
    problem: "Sem armazenamento, mesa acumula objetos e perde área útil de trabalho.",
    impact: "Prateleiras de parede liberam mesa, organizam itens decorativos e preenchem fundo da câmera.",
    recommendation: profile === "criador" || profile === "designer"
      ? "Prateleiras flutuantes em madeira clara, 2-3 unidades em altura escalonada (galeria gallery wall)."
      : "Par de prateleiras de parede em L de aço/madeira pra livros e itens decorativos.",
    priority,
    confidence: 65,
    estimated_budget: "R$ 80 a R$ 350",
    partners: ["leroy_merlin", "madeira_madeira", "mobly", "amazon_br"],
    is_recommended: true,
  }];
}

// ============================================================================
// Score derivado: usa scores do Gemini + pequenos ajustes do motor
// ============================================================================

function deriveScores(s: GeminiSignals, touchpoints: AnyTouchpoint[]): Record<string, number> {
  const base = s.scores_iniciais;
  // Penalidade leve por número de touchpoints high recomendados (sinal de muitos problemas)
  const highCount = touchpoints.filter((t) => "priority" in t && t.priority === "high").length;
  const penalty = Math.min(15, highCount * 3);
  const overall =
    (base.ergonomia + base.iluminacao + base.organizacao + base.gestao_de_cabos +
     base.decoracao + base.fundo_para_video + base.acustica_provavel + base.produtividade) / 8;
  return {
    overall: Math.max(0, Math.round((overall - penalty) * 10) / 10),
    ergonomia: base.ergonomia,
    iluminacao: base.iluminacao,
    organizacao: base.organizacao,
    gestao_de_cabos: base.gestao_de_cabos,
    decoracao: base.decoracao,
    fundo_para_video: base.fundo_para_video,
    acustica_provavel: base.acustica_provavel,
    produtividade: base.produtividade,
  };
}

// ============================================================================
// Entry point
// ============================================================================

export function applyRules(signals: GeminiSignals, profile: ProfileType): RulesResult {
  const all: AnyTouchpoint[] = [
    ...ruleCortina(signals, profile),
    ...ruleLuminaria(signals, profile),
    ...rulePlanta(signals, profile),
    ...ruleEstante(signals, profile),
    ...rulePapelParede(signals, profile),
    ...ruleOrganizadorCabos(signals, profile),
    ...ruleSuporteNotebook(signals, profile),
    ...ruleMonitor(signals, profile),
    ...ruleTapete(signals, profile),
    ...ruleQuadro(signals, profile),
    ...ruleWebcamMic(signals, profile),
    // Touchpoints novos — cadeira, mesa, painel acústico, dock/hub, prateleira
    ...ruleCadeira(signals, profile),
    ...ruleMesa(signals, profile),
    ...rulePainelAcustico(signals, profile),
    ...ruleDockHub(signals, profile),
    ...rulePrateleira(signals, profile),
  ];

  const recommended = all.filter((t): t is Touchpoint => t.is_recommended === true);
  const not_recommended = all.filter((t): t is NotRecommended => t.is_recommended === false);

  // Ordena recomendados por prioridade (high > medium > low) e depois confidence
  const priorityWeight: Record<Priority, number> = { high: 3, medium: 2, low: 1 };
  recommended.sort((a, b) =>
    priorityWeight[b.priority] - priorityWeight[a.priority] || b.confidence - a.confidence,
  );

  return {
    recommended,
    not_recommended,
    weighted_scores: deriveScores(signals, recommended),
  };
}
