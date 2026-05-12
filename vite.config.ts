// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... } }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  cloudflare: false,
  tanstackStart: { target: "node-server" },
  vite: {
    build: {
      // Removemos source maps em prod pra dificultar engenharia reversa
      // (DevTools ainda funciona, mas só mostra o bundle minificado).
      sourcemap: false,
      // esbuild já é o minifier default do Vite. Aqui apenas removemos
      // console.* e debugger em produção (mantemos console.warn/error
      // pra que erros legítimos do usuário ainda apareçam no DevTools).
      minify: "esbuild",
    },
    esbuild: {
      drop: process.env.NODE_ENV === "production" ? ["debugger"] : [],
      pure:
        process.env.NODE_ENV === "production"
          ? ["console.log", "console.info", "console.debug", "console.trace"]
          : [],
    },
  },
});
