import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/auth/callback")({
  head: () => ({ meta: [{ title: "Entrando · HomeOffice.life" }] }),
  component: AuthCallback,
});

function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      if (typeof window === "undefined") return;

      const url = new URL(window.location.href);
      const code = url.searchParams.get("code");
      const errParam = url.searchParams.get("error_description") || url.searchParams.get("error");

      if (errParam) {
        setError(errParam);
        toast.error(`Login falhou: ${errParam}`);
        setTimeout(() => navigate({ to: "/auth" }), 3000);
        return;
      }

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          setError(error.message);
          toast.error(`Login falhou: ${error.message}`);
          setTimeout(() => navigate({ to: "/auth" }), 3000);
          return;
        }
      }

      // OAuth implícito também resolve aqui (tokens em #), o getSession pega.
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        toast.success("Bem-vindo!");
        navigate({ to: "/" });
      } else {
        setError("Não conseguimos criar sua sessão.");
        setTimeout(() => navigate({ to: "/auth" }), 3000);
      }
    })();
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="text-center">
        {error ? (
          <>
            <h1 className="font-display text-xl font-bold text-foreground">Não foi possível entrar</h1>
            <p className="mt-2 text-sm text-muted-foreground">{error}</p>
            <p className="mt-4 text-xs text-muted-foreground">Voltando para o login...</p>
          </>
        ) : (
          <>
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
            <p className="mt-4 text-sm text-muted-foreground">Entrando...</p>
          </>
        )}
      </div>
    </div>
  );
}
