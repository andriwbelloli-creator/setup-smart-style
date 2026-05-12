import { createFileRoute, redirect } from "@tanstack/react-router";

// Alias /entrar -> /auth (slug em PT-BR comum em campanhas / redes sociais).
// Mantemos a search string pra preservar redirect=... etc.
export const Route = createFileRoute("/entrar")({
  beforeLoad: ({ search }) => {
    throw redirect({ to: "/auth", search: search as Record<string, unknown> });
  },
});
