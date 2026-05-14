/**
 * QA mobile-only — viewport iPhone 14 Pro + UA Safari iOS.
 *
 * Wrapper que executa o fluxo principal forçando QA_RUN_MODE=full e
 * só salva screenshot mobile + checks de mobile_layout_ok.
 */
import "./homeoffice-analysis-flow.test";
// O test principal já testa desktop + mobile. Este wrapper é só pra
// permitir `bun run qa:mobile` rodar o mesmo flow com label diferente.
// O env var QA_RUN_MODE=full + analise visual focada no mobile_result.png
// fica a cargo do auto-fix-runner ou da inspeção humana.
