/**
 * QA dedicado ao Product Matching: valida links vêm do Supabase,
 * affiliate_url tem prioridade, tracking dispara, sem open redirect.
 *
 * Reutiliza o fluxo principal — o validateResult() já cobre tracking +
 * Ver produto + tipos de produto. Este wrapper força mode=full.
 */
process.env.QA_RUN_MODE = "full";
import "./homeoffice-analysis-flow.test";
