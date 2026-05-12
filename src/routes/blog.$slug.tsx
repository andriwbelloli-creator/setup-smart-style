import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/CTA";
import { findPost, BLOG_POSTS, type BlogSection } from "@/data/blog-posts";
import { Calendar, Clock, ArrowRight, Lightbulb, AlertTriangle, Info, Sparkles, ShoppingBag, Upload, BookOpen } from "lucide-react";
import { NewsletterCapture } from "@/components/NewsletterCapture";

const CATEGORY_LABEL: Record<string, string> = {
  guia: "Guia",
  comparacao: "Comparação",
  review: "Review",
  ergonomia: "Ergonomia",
};

export const Route = createFileRoute("/blog/$slug")({
  loader: ({ params }) => {
    const post = findPost(params.slug);
    if (!post) throw notFound();
    return { post };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [] };
    const p = loaderData.post;
    const url = `https://homeofficelife.com.br/blog/${p.slug}`;
    const ogImage = p.ogImage || p.cover;

    const breadcrumb = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Início", item: "https://homeofficelife.com.br/" },
        { "@type": "ListItem", position: 2, name: "Blog", item: "https://homeofficelife.com.br/blog" },
        { "@type": "ListItem", position: 3, name: p.title, item: url },
      ],
    };
    const article = {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: p.title,
      description: p.excerpt,
      image: ogImage,
      datePublished: p.publishedAt,
      dateModified: p.publishedAt,
      author: { "@type": "Organization", name: p.author, url: "https://homeofficelife.com.br" },
      publisher: {
        "@type": "Organization",
        name: "HomeOfficeLife",
        url: "https://homeofficelife.com.br",
        logo: { "@type": "ImageObject", url: "https://homeofficelife.com.br/og-image.jpg" },
      },
      mainEntityOfPage: { "@type": "WebPage", "@id": url },
    };

    return {
      meta: [
        { title: `${p.title} · Blog HomeOfficeLife` },
        { name: "description", content: p.excerpt },
        { name: "keywords", content: p.keywords },
        { name: "author", content: p.author },
        { property: "og:title", content: p.title },
        { property: "og:description", content: p.excerpt },
        { property: "og:image", content: ogImage },
        { property: "og:url", content: url },
        { property: "og:type", content: "article" },
        { property: "og:site_name", content: "HomeOfficeLife" },
        { property: "og:locale", content: "pt_BR" },
        { property: "article:published_time", content: p.publishedAt },
        { property: "article:author", content: p.author },
        { property: "article:section", content: CATEGORY_LABEL[p.category] },
        { property: "twitter:card", content: "summary_large_image" },
        { property: "twitter:title", content: p.title },
        { property: "twitter:description", content: p.excerpt },
        { property: "twitter:image", content: ogImage },
      ],
      scripts: [
        { type: "application/ld+json", children: JSON.stringify(breadcrumb) },
        { type: "application/ld+json", children: JSON.stringify(article) },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-32 text-center">
        <h1 className="font-display text-3xl font-bold">Post não encontrado</h1>
        <Link to="/blog" className="mt-6 inline-block text-primary hover:underline">Voltar pro blog →</Link>
      </div>
    </div>
  ),
  component: BlogPostPage,
});

function BlogPostPage() {
  const { post } = Route.useLoaderData();
  const related = BLOG_POSTS.filter((p) => p.slug !== post.slug).slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        {/* Hero */}
        <header className="border-b border-border bg-gradient-mesh">
          <div className="container mx-auto px-4 py-12 md:px-6 md:py-16">
            <div className="mx-auto max-w-3xl">
              <nav className="mb-5 flex items-center gap-2 text-xs text-muted-foreground">
                <Link to="/" className="hover:text-foreground">Início</Link>
                <span>›</span>
                <Link to="/blog" className="hover:text-foreground">Blog</Link>
                <span>›</span>
                <span className="text-foreground">{CATEGORY_LABEL[post.category]}</span>
              </nav>
              <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
                {CATEGORY_LABEL[post.category]}
              </span>
              <h1 className="mt-5 font-display text-4xl font-bold leading-tight tracking-tight md:text-5xl">
                {post.title}
              </h1>
              <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
                <span>Por <strong className="text-foreground">{post.author}</strong></span>
                <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{formatDate(post.publishedAt)}</span>
                <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{post.readingMinutes} min de leitura</span>
              </div>
            </div>
          </div>
        </header>

        {/* Cover image */}
        <div className="border-b border-border">
          <div className="container mx-auto px-4 md:px-6">
            <div className="mx-auto max-w-4xl">
              <div className="aspect-[16/9] overflow-hidden rounded-3xl border border-border shadow-elegant -translate-y-8">
                <img src={post.cover} alt={post.title} className="h-full w-full object-cover" fetchPriority="high" />
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <article className="container mx-auto px-4 pb-12 md:px-6 md:pb-16">
          <div className="mx-auto max-w-3xl space-y-6 text-base leading-relaxed text-foreground">
            {post.content.map((section, i) => (
              <Section key={i} s={section} />
            ))}
          </div>
        </article>

        {/* Newsletter (post engagement) */}
        <section className="border-t border-border bg-cream py-12">
          <div className="mx-auto max-w-2xl px-4 md:px-6">
            <NewsletterCapture
              source={`blog_${post.slug}`}
              variant="card"
              title="Curtiu o post? 1 novo por semana."
              subtitle="Insights práticos de home office BR + os 3 melhores setups da semana."
            />
          </div>
        </section>

        {/* Related posts */}
        {related.length > 0 && (
          <section className="border-t border-border py-12">
            <div className="container mx-auto px-4 md:px-6">
              <div className="mx-auto max-w-5xl">
                <h2 className="mb-6 inline-flex items-center gap-2 font-display text-xl font-bold">
                  <BookOpen className="h-5 w-5" /> Continue lendo
                </h2>
                <div className="grid gap-5 md:grid-cols-3">
                  {related.map((p) => (
                    <Link
                      key={p.slug}
                      to="/blog/$slug"
                      params={{ slug: p.slug }}
                      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-smooth hover:-translate-y-1 hover:shadow-elegant"
                    >
                      <div className="aspect-[16/10] overflow-hidden">
                        <img src={p.cover} alt={p.title} className="h-full w-full object-cover transition-smooth group-hover:scale-105" loading="lazy" />
                      </div>
                      <div className="flex flex-1 flex-col p-4">
                        <h3 className="font-display text-sm font-bold leading-snug">{p.title}</h3>
                        <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{p.excerpt}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}

function Section({ s }: { s: BlogSection }) {
  switch (s.type) {
    case "p":
      return <p>{s.text}</p>;
    case "h2":
      return <h2 className="font-display text-2xl font-bold tracking-tight mt-10">{s.text}</h2>;
    case "h3":
      return <h3 className="font-display text-xl font-semibold mt-8">{s.text}</h3>;
    case "ul":
      return (
        <ul className="ml-6 list-disc space-y-2">
          {s.items.map((i, k) => <li key={k}>{i}</li>)}
        </ul>
      );
    case "ol":
      return (
        <ol className="ml-6 list-decimal space-y-2">
          {s.items.map((i, k) => <li key={k}>{i}</li>)}
        </ol>
      );
    case "callout": {
      const Icon = s.tone === "tip" ? Lightbulb : s.tone === "warning" ? AlertTriangle : Info;
      const border = s.tone === "tip" ? "border-l-primary bg-primary/5" : s.tone === "warning" ? "border-l-coral bg-coral/10" : "border-l-accent bg-accent/10";
      return (
        <div className={`rounded-2xl border-l-4 p-5 ${border}`}>
          <div className="flex items-center gap-2 font-semibold">
            <Icon className="h-4 w-4" /> {s.title}
          </div>
          <p className="mt-2 text-sm">{s.text}</p>
        </div>
      );
    }
    case "kit-cta":
      return (
        <Link
          to="/kits"
          className="my-2 flex items-center justify-between gap-4 rounded-2xl border border-border bg-card p-5 transition-smooth hover:border-foreground hover:shadow-elegant"
        >
          <div className="flex items-center gap-3">
            <ShoppingBag className="h-5 w-5 text-coral" />
            <div>
              <div className="font-display font-bold">{s.title}</div>
              <div className="text-xs text-muted-foreground">Ver kit completo na /kits</div>
            </div>
          </div>
          <ArrowRight className="h-4 w-4" />
        </Link>
      );
    case "setup-cta":
      return (
        <Link
          to="/setup/$slug"
          params={{ slug: s.setupSlug }}
          className="my-2 flex items-center justify-between gap-4 rounded-2xl border border-border bg-card p-5 transition-smooth hover:border-foreground hover:shadow-elegant"
        >
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-primary" />
            <div>
              <div className="font-display font-bold">{s.title}</div>
              <div className="text-xs text-muted-foreground">Setup completo na galeria</div>
            </div>
          </div>
          <ArrowRight className="h-4 w-4" />
        </Link>
      );
    case "diagnostic-cta":
      return (
        <div className="my-2 rounded-3xl bg-gradient-hero p-6 text-center text-primary-foreground shadow-elegant md:p-8">
          <Upload className="mx-auto h-7 w-7" />
          <h3 className="mt-3 font-display text-xl font-bold">Manda foto do seu setup. IA analisa em 30s.</h3>
          <p className="mt-2 text-sm text-primary-foreground/80">Grátis. 3 análises lifetime. Sem cartão.</p>
          <Link
            to="/diagnostico"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-background px-6 py-2.5 text-sm font-semibold text-foreground shadow-elegant transition-smooth hover:scale-105"
          >
            Avaliar grátis <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      );
  }
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
  } catch {
    return iso;
  }
}
