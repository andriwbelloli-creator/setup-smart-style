import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/landing/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Entrar · Deskly" },
      { name: "description", content: "Crie sua conta no Deskly e poste seu setup brasileiro." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [mode, setMode] = useState<"auth" | "forgot" | "verify">("auth");
  const [pendingEmail, setPendingEmail] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const POLICY_VERSION = "2026-05-10";

  useEffect(() => {
    if (!loading && user) navigate({ to: "/" });
  }, [user, loading, navigate]);

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setSubmitting(false);
    if (error) {
      if (error.message === "Invalid login credentials") {
        toast.error("E-mail ou senha incorretos.");
      } else if (error.message.toLowerCase().includes("email not confirmed")) {
        toast.error("Confirme seu e-mail antes de entrar.");
        setPendingEmail(email);
        setMode("verify");
      } else {
        toast.error(error.message);
      }
      return;
    }
    toast.success("Bem-vindo de volta!");
    navigate({ to: "/" });
  };

  const signUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptedTerms) {
      toast.error("Aceite os Termos e a Política de Privacidade pra continuar.");
      return;
    }
    setSubmitting(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: typeof window !== "undefined" ? window.location.origin : undefined,
        data: {
          display_name: displayName || email.split("@")[0],
          consent_terms_version: POLICY_VERSION,
          consent_terms_at: new Date().toISOString(),
        },
      },
    });
    setSubmitting(false);
    if (error) {
      if (error.message.includes("already registered")) toast.error("E-mail já cadastrado. Faça login.");
      else toast.error(error.message);
      return;
    }
    // If session is null, email confirmation is required
    if (!data.session) {
      setPendingEmail(email);
      setMode("verify");
      setPassword("");
      return;
    }
    toast.success("Conta criada!");
    navigate({ to: "/" });
  };

  const resendVerification = async () => {
    if (!pendingEmail) return;
    setSubmitting(true);
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: pendingEmail,
      options: {
        emailRedirectTo: typeof window !== "undefined" ? window.location.origin : undefined,
      },
    });
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("E-mail reenviado!");
  };

  const forgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Informe seu e-mail.");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: typeof window !== "undefined" ? `${window.location.origin}/reset-password` : undefined,
    });
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Link de recuperação enviado! Cheque seu e-mail.");
    setMode("auth");
  };

  const signInWithGoogle = async () => {
    setSubmitting(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: typeof window !== "undefined" ? `${window.location.origin}/` : undefined,
      },
    });
    setSubmitting(false);
    if (error) toast.error(error.message);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-10">
        <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 shadow-elegant">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-hero text-primary-foreground shadow-elegant">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold">Entre no Deskly</h1>
              <p className="text-xs text-muted-foreground">Comunidade brasileira de home offices</p>
            </div>
          </div>

          {mode === "verify" && (
            <div className="space-y-4 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-3xl">📬</div>
              <h2 className="font-display text-lg font-bold">Confirme seu e-mail</h2>
              <p className="text-sm text-muted-foreground">
                Enviamos um link de confirmação pra <strong className="text-foreground">{pendingEmail}</strong>.
                Clique nele pra ativar sua conta.
              </p>
              <p className="text-xs text-muted-foreground">
                Não chegou? Olha a caixa de spam ou{" "}
                <button
                  type="button"
                  onClick={resendVerification}
                  disabled={submitting}
                  className="font-medium text-primary hover:underline disabled:opacity-50"
                >
                  reenvie o link
                </button>.
              </p>
              <button
                type="button"
                onClick={() => { setMode("auth"); setPendingEmail(""); }}
                className="block w-full text-center text-xs text-muted-foreground hover:text-foreground"
              >
                ← Voltar
              </button>
            </div>
          )}

          {mode === "forgot" && (
            <form onSubmit={forgotPassword} className="space-y-4">
              <div>
                <h2 className="font-display text-lg font-bold">Recuperar senha</h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Vamos enviar um link de redefinição pro seu e-mail.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email-forgot">E-mail cadastrado</Label>
                <Input id="email-forgot" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <Button type="submit" disabled={submitting} className="w-full bg-gradient-hero shadow-elegant">
                {submitting ? "Enviando..." : "Enviar link"}
              </Button>
              <button
                type="button"
                onClick={() => setMode("auth")}
                className="block w-full text-center text-xs text-muted-foreground hover:text-foreground"
              >
                ← Voltar ao login
              </button>
            </form>
          )}

          {mode === "auth" && (
          <>
            <button
              type="button"
              onClick={signInWithGoogle}
              disabled={submitting}
              className="mb-4 flex w-full items-center justify-center gap-3 rounded-full border border-border bg-background px-5 py-3 text-sm font-semibold text-foreground transition-smooth hover:border-foreground hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.56c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.77c-.99.66-2.25 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" fill="#34A853"/>
                <path d="M5.84 14.1A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.34-2.1V7.07H2.18A10.99 10.99 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.83z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.07l3.66 2.83C6.71 7.31 9.14 5.38 12 5.38z" fill="#EA4335"/>
              </svg>
              Continuar com Google
            </button>
            <div className="mb-4 flex items-center gap-3 text-xs text-muted-foreground">
              <div className="h-px flex-1 bg-border" />
              ou
              <div className="h-px flex-1 bg-border" />
            </div>
          <Tabs defaultValue="signin">
            <TabsList className="mb-4 grid w-full grid-cols-2">
              <TabsTrigger value="signin">Entrar</TabsTrigger>
              <TabsTrigger value="signup">Criar conta</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={signIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Senha</Label>
                    <button
                      type="button"
                      onClick={() => setMode("forgot")}
                      className="text-xs font-medium text-primary hover:underline"
                    >
                      Esqueci minha senha
                    </button>
                  </div>
                  <Input id="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <Button type="submit" disabled={submitting} className="w-full bg-gradient-hero shadow-elegant">
                  {submitting ? "Entrando..." : "Entrar"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={signUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Como te chamamos?</Label>
                  <Input id="name" required value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Ana, João, etc." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email2">E-mail</Label>
                  <Input id="email2" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password2">Senha</Label>
                  <Input id="password2" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" />
                </div>
                <label className="flex items-start gap-2 text-xs text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="mt-0.5 h-4 w-4 cursor-pointer accent-primary"
                    required
                  />
                  <span>
                    Li e aceito os{" "}
                    <Link to="/termos" target="_blank" className="text-primary hover:underline">Termos de Uso</Link>
                    {" "}e a{" "}
                    <Link to="/privacidade" target="_blank" className="text-primary hover:underline">Política de Privacidade</Link>.
                  </span>
                </label>
                <Button type="submit" disabled={submitting || !acceptedTerms} className="w-full bg-gradient-hero shadow-elegant">
                  {submitting ? "Criando..." : "Criar conta"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
          </>
          )}

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Voltar para a <Link to="/" className="text-primary hover:underline">página inicial</Link>
          </p>
        </div>
      </main>
    </div>
  );
}