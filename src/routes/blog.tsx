import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/CTA";
import { BLOG_POSTS } from "@/data/blog-posts";
import { Calendar, Clock, ArrowRight, BookOpen } from "lucide-react";

const CATEGORY_LABEL: Record<string, string> = {
  guia: "Guia",
  comparacao: "Comparação",
  review: "Review",
  ergonomia: "Ergonomia",
};
const CATEGORY_COLOR: Record<string, string> = {
  guia: "bg-primary/10 text-primary",
  comparacao: "bg-accent/15 text-accent-foreground",
  review: "bg-coral/15 text-coral-foreground",
  ergonomia: "bg-secondary text-foreground",
};

export const Route = createFileRoute("/blog")({
  head: () => ({
    meta: [
      { title: "Blog · Deskly — guias práticos de home office BR" },
      { name: "description", content: "Guias, comparações e dicas de home office no Brasil. Tutoriais práticos, listas de produtos com preço real e análise por IA." },
      { property: "og:title", content: "Blog Deskly — home office brasileiro" },
      { property: "og:description", content: "Conteúdo prático sobre ergonomia, setup, iluminação e produtos para home office no Brasil." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: BlogIndex,
});

function BlogIndex() {
  const posts = [...BLOG_POSTS].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  const featured = posts[0];
  const rest = posts.slice(1);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-12 md:px-6 md:py-16">
        <div className="mb-10 max-w-2xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
            <BookOpen className="h-3 w-3" /> Blog Deskly
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
            Guias práticos de home office no Brasil
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">
            Comparações reais, listas curadas, lições de ergonomia. Conteúdo que
            economiza seu dinheiro e melhora seu setup hoje.
          </p>
        </div>

        {featured && (
          <Link
            to="/blog/$slug"
            params={{ slug: featured.slug }}
            className="group block overflow-hidden rounded-3xl border border-border bg-card shadow-soft transition-smooth hover:shadow-elegant"
          >
            <div className="grid md:grid-cols-2">
              <div className="aspect-[16/10] overflow-hidden md:aspect-auto">
                <img
                  src={featured.cover}
                  alt={featured.title}
                  className="h-full w-full object-cover transition-smooth group-hover:scale-105"
                  loading="eager"
                />
              </div>
              <div className="flex flex-col justify-center p-7 md:p-10">
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${CATEGORY_COLOR[featured.category]}`}>
                    {CATEGORY_LABEL[featured.category]}
                  </span>
                  <span className="rounded-full bg-coral px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-coral-foreground">
                    Em destaque
                  </span>
                </div>
                <h2 className="mt-4 font-display text-2xl font-bold leading-tight md:text-3xl">
                  {featured.title}
                </h2>
                <p className="mt-3 text-sm text-muted-foreground md:text-base">{featured.excerpt}</p>
                <div className="mt-5 flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{formatDate(featured.publishedAt)}</span>
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{featured.readingMinutes} min</span>
                </div>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                  Ler post completo <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </div>
          </Link>
        )}

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((p) => (
            <Link
              key={p.slug}
              to="/blog/$slug"
              params={{ slug: p.slug }}
              className="group flex flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-soft transition-smooth hover:-translate-y-1 hover:shadow-elegant"
            >
              <div className="aspect-[16/10] overflow-hidden">
                <img src={p.cover} alt={p.title} className="h-full w-full object-cover transition-smooth group-hover:scale-105" loading="lazy" />
              </div>
              <div className="flex flex-1 flex-col p-5">
                <span className={`inline-flex w-fit rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${CATEGORY_COLOR[p.category]}`}>
                  {CATEGORY_LABEL[p.category]}
                </span>
                <h3 className="mt-3 font-display text-lg font-bold leading-snug">{p.title}</h3>
                <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{p.excerpt}</p>
                <div className="mt-auto flex items-center gap-3 pt-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{formatDate(p.publishedAt)}</span>
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{p.readingMinutes} min</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return iso;
  }
}
