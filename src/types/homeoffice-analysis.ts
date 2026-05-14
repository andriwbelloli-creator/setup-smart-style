// Tipos compartilhados pela tela de resultado e cliente da edge function
// `analyze-homeoffice-image`. Mantém paridade com touchpoint-rules.ts (Deno).

export type ProfileType =
  | "geral" | "dev" | "designer" | "advogado" | "medico" | "psicologo"
  | "professor" | "autonomo" | "consultor" | "criador" | "executivo";

export type Priority = "high" | "medium" | "low";
export type AnalysisType = "free" | "premium";
export type AnalysisStatus = "pending" | "processing" | "completed" | "failed";

export interface Touchpoint {
  id?: string;
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
  // Hook pra Product Matching (Fase posterior — "para depois")
  recommended_products?: RecommendedProduct[];
}

export interface NotRecommendedTouchpoint {
  item: string;
  is_recommended: false;
  reason: string;
}

export interface RecommendedProduct {
  id?: string;
  product_name: string;
  partner_name: string;
  price?: number | null;
  price_range?: string;
  image_url?: string;
  url: string;
  is_affiliate: boolean;
  reason?: string;
}

export interface AnalysisResult {
  analysis_id: string;
  overall_score: number;
  scores: {
    overall: number;
    ergonomia: number;
    iluminacao: number;
    organizacao: number;
    gestao_de_cabos: number;
    decoracao: number;
    fundo_para_video: number;
    acustica_provavel: number;
    produtividade: number;
  };
  touchpoints_recomendados: Touchpoint[];
  touchpoints_nao_recomendados: NotRecommendedTouchpoint[];
  observacoes_objetivas: string[];
  nivel_confianca_geral: number;
  claude_result?: ClaudeResult | null;
  claude_failed?: boolean;
  meta?: { total_ms: number };
}

export interface ClaudeResult {
  resumo_consultivo: string;
  diagnostico_geral: string;
  principais_forcas: string[];
  principais_problemas: string[];
  plano_de_acao: {
    ordem: number;
    acao: string;
    motivo: string;
    impacto_esperado: string;
    investimento_estimado: string;
    prioridade: Priority;
  }[];
  recomendacao_por_perfil: string;
  mensagem_final: string;
}

export interface PartnerInfo {
  slug: string;
  name: string;
  base_url: string;
  search_url_template: string | null;
  affiliate_enabled: boolean;
}
