import { QueryClient } from "@tanstack/react-query";

/**
 * Cliente global do TanStack Query — reaproveitamento de queries Supabase.
 *
 * Defaults sensatos pro app:
 * - staleTime 5min: galeria/kits/setups não mudam segundo-a-segundo, então
 *   reusar cache dentro desse window evita N requests no Supabase por
 *   navegação.
 * - gcTime 30min: dado fica em memória 30min depois de inativo.
 * - retry 1: se Supabase falha 1x, tenta de novo; depois mostra erro
 *   sem dar 5 retries que travam UX.
 * - refetchOnWindowFocus false: comportamento Lovable estável (não
 *   recarrega ao voltar de aba).
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 min
      gcTime: 30 * 60 * 1000, // 30 min
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
