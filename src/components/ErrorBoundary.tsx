import { Component, type ReactNode, type ErrorInfo } from "react";

type Props = { children: ReactNode };
type State = { error: Error | null };

/**
 * Error Boundary global. Captura erros de render em qualquer
 * componente filho e mostra fallback amigável em vez de tela
 * branca de React quebrado.
 *
 * Eventos críticos (auth, payment) NÃO podem morrer silenciosos
 * — quem precisar de tratamento mais fino deve usar try/catch
 * local em vez de depender desse boundary.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Mantém console.error mesmo em prod (esbuild só remove .log/.info/.debug/.trace)
    console.error("[ErrorBoundary]", error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4">
          <div className="max-w-md rounded-3xl border border-border bg-card p-8 shadow-elegant">
            <div className="text-7xl">😵</div>
            <h1 className="mt-4 font-display text-2xl font-bold">Algo quebrou aqui</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Encontramos um erro inesperado. Já registramos por debug.
              Recarregar a página geralmente resolve.
            </p>
            {process.env.NODE_ENV !== "production" && (
              <pre className="mt-4 max-h-40 overflow-auto rounded-xl bg-secondary p-3 text-xs">
                {this.state.error.message}
              </pre>
            )}
            <div className="mt-6 flex flex-col gap-2 sm:flex-row">
              <button
                onClick={() => window.location.reload()}
                className="rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background"
              >
                Recarregar página
              </button>
              <a
                href="/"
                className="rounded-full border border-border bg-background px-5 py-2.5 text-center text-sm font-semibold transition-smooth hover:border-foreground"
              >
                Voltar ao início
              </a>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
