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
    setSubmitting(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: typeof window !== "undefined" ? window.location.origin : undefined,
        data: { display_name: displayName || email.split("@")[0] },
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
                <Button type="submit" disabled={submitting} className="w-full bg-gradient-hero shadow-elegant">
                  {submitting ? "Criando..." : "Criar conta"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
          )}

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Voltar para a <Link to="/" className="text-primary hover:underline">página inicial</Link>
          </p>
        </div>
      </main>
    </div>
  );
}