import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/CTA";
import { findSetup, type Product, type Setup } from "@/data/setups";
import { WatermarkOverlay } from "@/components/setup/WatermarkOverlay";
import { RentalLeadModal } from "@/components/setup/RentalLeadModal";
import { estimateMonthlyRental } from "@/lib/rental";
import { fetchSetupBySlug } from "@/lib/setups-db";
import { trackAffiliateClick, affiliateHref, normalizeStore } from "@/lib/affiliate";
import { track, trackPageView } from "@/lib/track";
import { fetchCrossSellMatches, formatBrl, type CrossSellMatch } from "@/lib/marketplace";
import { Heart, Bookmark, Share2, MapPin, Star, ExternalLink, Sparkles, Send, Loader2, Trash2, Radio, ArrowLeftRight, CalendarClock, Building2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLikes, useSaves } from "@/hooks/use-saved";
import { useAuth } from "@/hooks/use-auth";
import { useIsAdmin } from "@/hooks/use-is-admin";
import { useComments } from "@/hooks/use-comments";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/setup/$slug")({
  loader: async ({ params }) => {
    const dbSetup = await fetchSetupBySlug(params.slug);
    if (dbSetup) return { setup: dbSetup, fromDb: true };
    const local = findSetup(params.slug);
    if (!local) throw notFound();
    return { setup: local, fromDb: false };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [] };
    const s = loaderData.setup;
    const url = `https://homeofficelife.com.br/setup/${s.slug || s.id}`;
    const description = s.description
      ? s.description.slice(0, 200)
      : `Setup de ${s.author} em ${s.city}: ${s.styles.slice(0, 3).join(", ")}. Orçamento R$ ${s.budget.toLocaleString("pt-BR")}.`;

    // JSON-LD: 3 schemas separados (BreadcrumbList, ItemList de produtos,
    // Article do setup) pra cobrir múltiplos rich snippets do Google.
    const breadcrumb = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Início", item: "https://homeofficelife.com.br/" },
        { "@type": "ListItem", position: 2, name: "Galeria", item: "https://homeofficelife.com.br/galeria" },
        { "@type": "ListItem", position: 3, name: s.title, item: url },
      ],
    };
    const article = {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: s.title,
      description,
      image: s.image,
      url,
      author: { "@type": "Person", name: s.author.replace(/^@/, "") },
      publisher: {
        "@type": "Organization",
        name: "HomeOfficeLife",
        url: "https://homeofficelife.com.br",
        logo: { "@type": "ImageObject", url: "https://homeofficelife.com.br/og-image-v2.png" },
      },
      ...(s.score && {
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: s.score,
          bestRating: 10,
          worstRating: 0,
          ratingCount: Math.max(1, s.likes + s.saves),
        },
      }),
    };
    const productList = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: `Produtos do setup ${s.title}`,
      itemListElement: (s.products || []).map((p: Product, i: number) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "Product",
          name: p.name,
          brand: { "@type": "Brand", name: p.brand },
          category: p.category,
          offers: {
            "@type": "Offer",
            priceCurrency: "BRL",
            price: p.price,
            availability: "https://schema.org/InStock",
            seller: { "@type": "Organization", name: p.store },
            url: `https://homeofficelife.com.br/r/${p.id}`,
          },
          aggregateRating: p.rating
            ? { "@type": "AggregateRating", ratingValue: p.rating, ratingCount: 50 }
            : undefined,
        },
      })),
    };
    return {
      meta: [
        { title: `${s.title} — ${s.author} · HomeOfficeLife` },
        { name: "description", content: description },
        { name: "keywords", content: `${s.styles.join(", ")}, home office, setup ${s.authorRole}, ${s.city}, R$ ${s.budget.toLocaleString("pt-BR")}` },
        { property: "og:title", content: `${s.title} · Setup ${s.styles[0] || "home office"} de ${s.author}` },
        { property: "og:description", content: description },
        { property: "og:image", content: s.image },
        { property: "og:image:width", content: "1600" },
        { property: "og:image:height", content: "1100" },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
        { property: "og:site_name", content: "HomeOfficeLife" },
        { property: "og:locale", content: "pt_BR" },
        { property: "article:author", content: s.author },
        { property: "twitter:image", content: s.image },
        { property: "twitter:title", content: `${s.title} — Setup brasileiro` },
        { property: "twitter:description", content: description },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      scripts: [
        { type: "application/ld+json", children: JSON.stringify(breadcrumb) },
        { type: "application/ld+json", children: JSON.stringify(article) },
        { type: "application/ld+json", children: JSON.stringify(productList) },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-32 text-center">
        <h1 className="font-display text-5xl font-bold">Setup não encontrado</h1>
        <Link to="/galeria" className="mt-6 inline-block text-primary underline">Voltar à galeria</Link>
      </div>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-32 text-center">
        <h1 className="font-display text-3xl font-bold">Erro ao carregar setup</h1>
        <p className="mt-3 text-muted-foreground">{error.message}</p>
      </div>
    </div>
  ),
  component: SetupDetail,
});

function SetupDetail() {
  const { setup, fromDb } = Route.useLoaderData() as { setup: Setup; fromDb: boolean };
  const gallery: string[] = (setup as any).gallery ?? [];
  const allImages = [setup.image, ...gallery].filter(Boolean);
  const [heroIdx, setHeroIdx] = useState(0);
  const heroImage = allImages[heroIdx] ?? setup.image;
  const [active, setActive] = useState<Product | null>(null);
  const total = setup.products.reduce((sum: number, p: Product) => sum + p.price, 0);
  const likes = useLikes();
  const saves = useSaves();
  const liked = likes.has(setup.id);
  const saved = saves.has(setup.id);
  const { user } = useAuth();
  const { isAdmin } = useIsAdmin();
  const navigate = useNavigate();
  const cmt = useComments(setup.id, fromDb);
  const [commentBody, setCommentBody] = useState("");
  const [deletingSetup, setDeletingSetup] = useState(false);
  const [myFirstSlug, setMyFirstSlug] = useState<string | null>(null);
  const [rentalOpen, setRentalOpen] = useState(false);
  const [crossSells, setCrossSells] = useState<Map<string, CrossSellMatch>>(new Map());
  const [isOwner, setIsOwner] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  // Cross-selling: pra cada produto deste setup, verifica se tem usado
  // equivalente no marketplace por preço menor. Mostra badge "Economize R$X".
  useEffect(() => {
    if (setup.products.length === 0) {
      setCrossSells(new Map());
      return;
    }
    const input = setup.products.map((p: Product) => ({
      product_id: p.id,
      category: p.category,
      name: p.name,
      ref_price: p.price,
    }));
    fetchCrossSellMatches(input)
      .then(setCrossSells)
      .catch((e) => console.warn("cross-sell:", e));
  }, [setup.id]);
  const monthlyRental = estimateMonthlyRental(total, 12);

  // Track page view + impressões dos produtos (afiliado funnel impression)
  useEffect(() => {
    trackPageView("inspiration", {
      setup_id: setup.id,
      setup_slug: setup.slug,
      product_count: setup.products.length,
      total_brl: total,
    });
    if (setup.products.length > 0) {
      track("affiliate_impression", "affiliate", {
        setup_id: setup.id,
        product_count: setup.products.length,
        stores: Array.from(new Set(setup.products.map((p) => p.store))),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setup.id]);

  // Carrega 1º setup do user logado pra habilitar one-click "Comparar com meu"
  useEffect(() => {
    if (!user) { setMyFirstSlug(null); return; }
    let cancelled = false;
    supabase
      .from("setups")
      .select("slug")
      .eq("owner_id", user.id)
      .neq("slug", setup.slug)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled) setMyFirstSlug(data?.slug ?? null);
      });
    return () => { cancelled = true; };
  }, [user, setup.slug]);

  // Detecta se o user logado é o dono deste setup pra habilitar edição.
  useEffect(() => {
    if (!user) { setIsOwner(false); return; }
    let cancelled = false;
    supabase
      .from("setups")
      .select("owner_id")
      .eq("id", setup.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled) setIsOwner(data?.owner_id === user.id);
      });
    return () => { cancelled = true; };
  }, [user, setup.id]);

  const onCoverChange = async (file: File | null) => {
    if (!file || !user || !isOwner) return;
    setUploadingCover(true);
    try {
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
      const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
      const up = await supabase.storage.from("setups").upload(path, file, { contentType: file.type });
      if (up.error) throw up.error;
      const { data: pub } = supabase.storage.from("setups").getPublicUrl(path);
      const newUrl = pub.publicUrl;

      const { error: upErr } = await supabase.from("setups").update({ cover_url: newUrl }).eq("id", setup.id);
      if (upErr) throw upErr;

      // Atualiza setup_images cover (position=0). Tenta update; se nada
      // afetado, insere — cobre setups antigos que nasceram sem registro.
      const { data: existing } = await supabase
        .from("setup_images")
        .select("id")
        .eq("setup_id", setup.id)
        .eq("position", 0)
        .maybeSingle();
      if (existing?.id) {
        await supabase.from("setup_images").update({ url: newUrl }).eq("id", existing.id);
      } else {
        await supabase.from("setup_images").insert({ setup_id: setup.id, url: newUrl, position: 0 });
      }
      toast.success("Capa atualizada!");
      // Reload pra refletir a nova imagem em todos os pontos (hero, og, etc.)
      window.location.reload();
    } catch (e: any) {
      toast.error(e?.message || "Falha ao atualizar capa.");
    } finally {
      setUploadingCover(false);
    }
  };

  const handleDeleteSetup = async () => {
    if (!confirm(`Excluir o setup "${setup.title}"? Esta ação é permanente.`)) return;
    setDeletingSetup(true);
    const { data: snap } = await supabase.from("setups").select("*").eq("id", setup.id).maybeSingle();
    const { data: auth } = await supabase.auth.getUser();
    const { error } = await supabase.from("setups").delete().eq("id", setup.id);
    setDeletingSetup(false);
    if (error) {
      toast.error(`Falha ao excluir: ${error.message}`);
      return;
    }
    if (auth?.user?.id) {
      // admin_actions ainda não está nos types gerados — cast
      (supabase as any).from("admin_actions").insert({
        admin_user_id: auth.user.id,
        action: "delete_setup",
        target_table: "setups",
        target_id: setup.id,
        target_snapshot: snap,
        reason: "Excluído via página de detalhe",
      }).then(({ error: logErr }: { error: { message: string } | null }) => {
        if (logErr) console.warn("admin_actions log:", logErr.message);
      });
    }
    toast.success("Setup excluído.");
    navigate({ to: "/galeria" });
  };

  const postComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { toast.error("Faça login para comentar"); return; }
    const res = await cmt.post(commentBody, user.id);
    if ("error" in res && res.error) { toast.error(res.error); return; }
    setCommentBody("");
  };

  const deleteComment = async (id: string) => {
    const res = await cmt.remove(id);
    if ("error" in res && res.error) { toast.error(res.error); return; }
    toast.success("Comentário removido");
  };

  const [shareOpen, setShareOpen] = useState(false);
  const share = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: setup.title, url });
      } catch {}
      return;
    }
    setShareOpen((v) => !v);
  };
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareText = `${setup.title} — vi esse setup no HomeOfficeLife e amei`;
  const shareLinks = {
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
  };
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copiado!");
      setShareOpen(false);
    } catch {
      toast.error("Não consegui copiar — copie manualmente da barra.");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-10 md:px-6 md:py-14">
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {setup.styles.map((t) => (
              <span key={t} className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">{t}</span>
            ))}
          </div>
          <h1 className="mt-3 font-display text-4xl font-bold tracking-tight md:text-5xl">{setup.title}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{setup.author}</span>
            <span>· {setup.authorRole}</span>
            <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{setup.city}</span>
            {setup.score > 0 && <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-accent text-accent" />Nota IA {setup.score}</span>}
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <div className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-elegant">
              <div className="relative aspect-[16/11]">
                <img src={heroImage} alt={`Setup completo de ${setup.author}: ${setup.title}`} className="h-full w-full object-cover transition-opacity duration-300" fetchPriority="high" decoding="async" />
                <WatermarkOverlay position="tl" />
                {isOwner && heroIdx === 0 && (
                  <label
                    className={`absolute right-3 top-3 z-10 inline-flex cursor-pointer items-center gap-2 rounded-full bg-foreground/90 px-4 py-2 text-xs font-semibold text-background shadow-elegant transition-smooth hover:bg-foreground ${uploadingCover ? "opacity-50 cursor-wait" : ""}`}
                    title="Trocar a foto de capa"
                  >
                    {uploadingCover ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Pencil className="h-3.5 w-3.5" />}
                    {uploadingCover ? "Enviando..." : "Editar capa"}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={uploadingCover}
                      onChange={(e) => onCoverChange(e.target.files?.[0] ?? null)}
                    />
                  </label>
                )}
                {heroIdx === 0 && setup.products.map((p, idx) => {
                  // Clampa coordenadas pra dentro do quadro (3-97%) e disambígua
                  // duplicatas com offset pequeno em espiral, pra todo touchpoint
                  // ficar visível e clicável mesmo com dados ruins.
                  const clamp = (v: number) => Math.max(3, Math.min(97, v));
                  const dupCount = setup.products.slice(0, idx).filter(
                    (q) => q.x === p.x && q.y === p.y,
                  ).length;
                  const offset = dupCount * 5; // 5% por duplicata
                  const left = clamp(p.x + (offset * Math.cos(dupCount * 1.2)));
                  const top = clamp(p.y + (offset * Math.sin(dupCount * 1.2)));
                  return (
                  <a
                    key={p.id}
                    href={affiliateHref(p)}
                    target="_blank"
                    rel="sponsored noopener noreferrer"
                    onClick={(e) => {
                      e.stopPropagation();
                      trackAffiliateClick({
                        productId: p.id,
                        setupId: setup.id,
                        store: normalizeStore(p.store),
                      });
                    }}
                    onContextMenu={(e) => {
                      // Botão direito (desktop) ou long-press (mobile via system menu)
                      // mostra detalhes do produto sem sair pra afiliada.
                      e.preventDefault();
                      setActive(p);
                    }}
                    style={{ left: `${left}%`, top: `${top}%` }}
                    className="group absolute -translate-x-1/2 -translate-y-1/2 touch-manipulation"
                    aria-label={`Comprar ${p.name} em ${p.store}`}
                    title={`${p.name} · R$ ${p.price.toLocaleString("pt-BR")} · ${p.store}`}
                  >
                    {/* Halo pequeno só no hover/active — sem animate-ping que polui */}
                    <span
                      className={`absolute inset-0 -m-1.5 rounded-full bg-accent/30 transition-opacity ${
                        active?.id === p.id ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                      }`}
                    />
                    <span
                      className={`relative flex h-7 w-7 items-center justify-center rounded-full border-2 border-background bg-accent text-accent-foreground shadow-elegant transition-smooth group-hover:scale-110 sm:h-8 sm:w-8 ${
                        active?.id === p.id ? "ring-2 ring-accent/50" : ""
                      }`}
                    >
                      <ExternalLink className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    </span>
                  </a>
                  );
                })}
              </div>
            </div>
            {allImages.length > 1 && (
              <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6">
                {allImages.map((url, i) => (
                  <button
                    key={`${url}-${i}`}
                    onClick={() => setHeroIdx(i)}
                    className={`aspect-[4/3] overflow-hidden rounded-xl border transition-smooth ${
                      heroIdx === i ? "border-primary ring-2 ring-primary/30" : "border-border opacity-70 hover:opacity-100"
                    }`}
                    aria-label={`Imagem ${i + 1}`}
                  >
                    <img src={url} alt={`${setup.title} — foto ${i + 1}`} className="h-full w-full object-cover" loading="lazy" decoding="async" />
                  </button>
                ))}
              </div>
            )}

            {setup.description && <p className="mt-6 text-base leading-relaxed text-muted-foreground">{setup.description}</p>}

            {/* Action bar — agrupada e mobile-friendly */}
            <div className="mt-6 space-y-3">
              {/* Linha primária: CTAs principais (montar parecido + comparar) */}
              <div className="flex flex-wrap gap-2">
                {myFirstSlug ? (
                  <Button asChild className="gap-2 bg-gradient-hero shadow-elegant">
                    <Link to="/comparar" search={{ setups: `${myFirstSlug},${setup.slug}` }}>
                      <ArrowLeftRight className="h-4 w-4" /> Comparar com o meu setup
                    </Link>
                  </Button>
                ) : (
                  <Button asChild className="gap-2 bg-gradient-hero shadow-elegant">
                    <Link to="/orcamento"><Sparkles className="h-4 w-4" /> Quero montar parecido</Link>
                  </Button>
                )}
                <Button asChild variant="outline" className="gap-2">
                  <Link to="/comparar" search={{ setups: setup.slug }}>
                    <ArrowLeftRight className="h-4 w-4" /> <span className="hidden sm:inline">Comparar com </span>outro
                  </Link>
                </Button>
                {myFirstSlug && (
                  <Button asChild variant="ghost" className="gap-2 text-coral hover:bg-coral/10 hover:text-coral">
                    <Link to="/orcamento"><Sparkles className="h-4 w-4" /> Montar parecido</Link>
                  </Button>
                )}
              </div>

              {/* Linha secundária: ações sociais (icon-only em mobile) */}
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => likes.toggle(setup.id)}
                  variant={liked ? "default" : "outline"}
                  size="sm"
                  className={`gap-2 ${liked ? "bg-coral text-coral-foreground hover:opacity-90" : ""}`}
                  aria-label={liked ? "Descurtir" : "Curtir"}
                >
                  <Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} />
                  <span className="hidden sm:inline">{liked ? "Curtido" : "Curtir"}</span>
                  <span>{setup.likes + (liked ? 1 : 0)}</span>
                </Button>
                <Button
                  onClick={() => saves.toggle(setup.id)}
                  variant={saved ? "default" : "outline"}
                  size="sm"
                  className="gap-2"
                  aria-label={saved ? "Remover dos favoritos" : "Salvar nos favoritos"}
                >
                  <Bookmark className={`h-4 w-4 ${saved ? "fill-current" : ""}`} />
                  <span className="hidden sm:inline">{saved ? "Salvo" : "Salvar"}</span>
                </Button>
                <div className="relative">
                  <Button onClick={share} variant="outline" size="sm" className="gap-2" aria-label="Compartilhar">
                    <Share2 className="h-4 w-4" />
                    <span className="hidden sm:inline">Compartilhar</span>
                  </Button>
                  {shareOpen && (
                    <div className="absolute left-0 top-full z-30 mt-2 w-56 rounded-2xl border border-border bg-card p-2 shadow-elegant">
                      <a href={shareLinks.whatsapp} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm hover:bg-secondary" onClick={() => setShareOpen(false)}>
                        <span className="text-lg">💬</span> WhatsApp
                      </a>
                      <a href={shareLinks.twitter} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm hover:bg-secondary" onClick={() => setShareOpen(false)}>
                        <span className="text-lg">𝕏</span> Twitter
                      </a>
                      <a href={shareLinks.telegram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm hover:bg-secondary" onClick={() => setShareOpen(false)}>
                        <span className="text-lg">✈️</span> Telegram
                      </a>
                      <a href={shareLinks.facebook} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm hover:bg-secondary" onClick={() => setShareOpen(false)}>
                        <span className="text-lg">📘</span> Facebook
                      </a>
                      <button onClick={copyLink} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm hover:bg-secondary">
                        <span className="text-lg">🔗</span> Copiar link
                      </button>
                    </div>
                  )}
                </div>
                {isAdmin && (
                  <Button
                    type="button"
                    onClick={handleDeleteSetup}
                    disabled={deletingSetup}
                    variant="outline"
                    size="sm"
                    className="ml-auto gap-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    title="Excluir setup (admin)"
                    aria-label="Excluir setup (admin)"
                  >
                    {deletingSetup ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    <span className="hidden sm:inline">Excluir</span>
                  </Button>
                )}
              </div>
            </div>

            {/* Comments */}
            {fromDb && (
              <section className="mt-12">
                <div className="flex items-center justify-between gap-4">
                  <h2 className="font-display text-2xl font-bold">Comentários ({cmt.total})</h2>
                  {cmt.live && (
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      <Radio className="h-3.5 w-3.5 animate-pulse" /> ao vivo
                    </span>
                  )}
                </div>
                <form onSubmit={postComment} className="mt-4">
                  <div className="flex gap-2">
                    <input value={commentBody} onChange={(e) => setCommentBody(e.target.value)}
                      placeholder={user ? "Escreva um comentário..." : "Faça login para comentar"}
                      disabled={!user || cmt.posting} maxLength={500}
                      className="h-12 flex-1 rounded-2xl border border-border bg-card px-4 text-sm focus:border-primary focus:outline-none disabled:opacity-50" />
                    <Button type="submit" disabled={!user || !commentBody.trim() || cmt.posting} className="gap-2 bg-foreground text-background">
                      {cmt.posting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                  </div>
                  {user && (
                    <div className="mt-1 text-right text-[10px] text-muted-foreground">
                      {commentBody.length}/500
                    </div>
                  )}
                </form>
                <div className="mt-6 space-y-4">
                  {cmt.comments.length === 0 && !cmt.loading && (
                    <p className="text-sm text-muted-foreground">Seja o primeiro a comentar.</p>
                  )}
                  {cmt.comments.map((c) => {
                    const initials = (c.author?.display_name || c.author?.username || "U").slice(0, 2).toUpperCase();
                    const isOwn = user?.id === c.author_id;
                    return (
                      <div key={c.id} className="group rounded-2xl border border-border bg-card p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            {c.author?.avatar_url ? (
                              <img src={c.author.avatar_url} alt="" className="h-8 w-8 rounded-full object-cover" loading="lazy" decoding="async" />
                            ) : (
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-[10px] font-bold text-secondary-foreground">
                                {initials}
                              </div>
                            )}
                            <div className="text-xs text-muted-foreground">
                              <span className="font-semibold text-foreground">@{c.author?.username || "user"}</span>
                              <span> · {new Date(c.created_at).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}</span>
                            </div>
                          </div>
                          {isOwn && (
                            <button
                              onClick={() => deleteComment(c.id)}
                              className="text-muted-foreground opacity-0 transition-smooth hover:text-destructive group-hover:opacity-100"
                              aria-label="Excluir comentário"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                        <p className="mt-2 whitespace-pre-wrap text-sm">{c.body}</p>
                      </div>
                    );
                  })}
                  {cmt.hasMore && (
                    <div className="pt-2 text-center">
                      <Button onClick={cmt.loadMore} disabled={cmt.loading} variant="outline" className="gap-2">
                        {cmt.loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                        Carregar mais ({cmt.total - cmt.comments.length})
                      </Button>
                    </div>
                  )}
                </div>
              </section>
            )}
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
              <div className="flex items-baseline justify-between">
                <h2 className="font-display text-xl font-bold">Lista de equipamentos</h2>
                <span className="text-xs text-muted-foreground">{setup.products.length} itens</span>
              </div>
              <div className="mt-2 text-3xl font-display font-bold">R$ {total.toLocaleString("pt-BR")}</div>
              <div className="text-xs text-muted-foreground">Soma dos produtos marcados</div>

              {/* Card de Locação — B2B + B2C lead gen */}
              {total > 0 && (
                <div className="mt-5 rounded-2xl border-2 border-dashed border-coral/40 bg-coral/5 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-coral text-coral-foreground shadow-soft">
                      <CalendarClock className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-coral-foreground/80">
                        Prefere alugar?
                      </div>
                      <div className="mt-0.5 font-display text-lg font-bold leading-tight">
                        A partir de R$ {monthlyRental.toLocaleString("pt-BR")}
                        <span className="text-xs font-medium text-muted-foreground">/mês</span>
                      </div>
                      <div className="mt-0.5 text-xs text-muted-foreground">
                        Para você ou pra sua empresa (B2B)
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={() => setRentalOpen(true)}
                    className="mt-3 w-full gap-2 bg-foreground text-background hover:opacity-90"
                  >
                    <Building2 className="h-4 w-4" />
                    Solicitar cotação de aluguel
                  </Button>
                </div>
              )}

              <div className="mt-5 space-y-3">
                {setup.products.length === 0 && (
                  <p className="rounded-2xl border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                    Nenhum produto marcado neste setup.
                  </p>
                )}
                {setup.products.map((p) => {
                  const xSell = crossSells.get(p.id);
                  return (
                    <div key={p.id}
                      className={`flex w-full flex-col gap-2 rounded-2xl border p-3 text-left transition-smooth ${
                        active?.id === p.id ? "border-accent bg-accent/5" : "border-border bg-background hover:border-foreground/30"
                      }`}>
                      <div className="flex items-start gap-3">
                        <button onClick={() => setActive(p)} className="flex flex-1 items-start gap-3 text-left min-w-0">
                          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-secondary text-xs font-bold">
                            {p.category[0]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{p.category}</div>
                            <div className="truncate text-sm font-semibold">{p.name}</div>
                            <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                              <span className="font-bold text-foreground">R$ {p.price.toLocaleString("pt-BR")}</span>
                              <span>· {p.store}</span>
                            </div>
                          </div>
                        </button>
                        <a
                          href={affiliateHref(p)}
                          target="_blank"
                          rel="sponsored noopener noreferrer"
                          onClick={() => trackAffiliateClick({ productId: p.id, setupId: setup.id, store: normalizeStore(p.store) })}
                          className="flex h-9 flex-shrink-0 items-center justify-center gap-1.5 self-center rounded-xl bg-primary px-3 text-xs font-bold text-primary-foreground shadow-soft transition-smooth hover:bg-primary/90 hover:shadow-elegant"
                          aria-label={`Comprar ${p.name} em ${p.store}`}
                          title={`Abrir ${p.name} em ${p.store}`}
                        >
                          <span className="hidden sm:inline">Ver em</span> {p.store}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>

                      {/* Cross-sell badge: produto usado encontrado no marketplace */}
                      {xSell && (
                        <Link
                          to="/marketplace/$id"
                          params={{ id: xSell.listing.id }}
                          onClick={() => track("marketplace_crosssell_click", "marketplace", {
                            from_product_id: p.id,
                            listing_id: xSell.listing.id,
                            savings: xSell.savings,
                          })}
                          className="group flex items-center gap-2 rounded-xl border border-primary/30 bg-gradient-to-r from-primary/10 to-accent/10 px-3 py-2 text-xs transition-smooth hover:border-primary hover:from-primary/15 hover:to-accent/15"
                        >
                          <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
                            Usado
                          </span>
                          <span className="flex-1">
                            <strong className="text-foreground">Economize {formatBrl(xSell.savings)}</strong>{" "}
                            <span className="text-muted-foreground">comprando da comunidade — {formatBrl(Number(xSell.listing.price))}</span>
                          </span>
                          <span className="font-bold text-primary transition-transform group-hover:translate-x-0.5">→</span>
                        </Link>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Disclosure de afiliado — obrigatório CONAR + CDC art. 36 */}
              {setup.products.length > 0 && (
                <p className="mt-5 border-t border-border pt-4 text-[11px] leading-relaxed text-muted-foreground">
                  O HomeOfficeLife é mantido por comissões de afiliados. Podemos
                  receber uma porcentagem se você comprar através dos
                  nossos links, <strong>sem custo extra para você</strong>.
                </p>
              )}

              {/* CTA Marketplace — vende usado */}
              {setup.products.length > 0 && (
                <Link
                  to="/marketplace/anunciar"
                  className="mt-5 flex items-center justify-between gap-3 rounded-2xl border border-dashed border-primary/40 bg-primary/5 p-4 text-sm transition-smooth hover:border-primary hover:bg-primary/10"
                >
                  <div>
                    <div className="font-semibold text-foreground">Tem um equipamento igual?</div>
                    <div className="text-xs text-muted-foreground">Anuncie na Loja e venda pra comunidade.</div>
                  </div>
                  <span className="text-xs font-semibold text-primary">Anunciar →</span>
                </Link>
              )}
            </div>
          </aside>
        </div>

        {active && (
          <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card shadow-elegant md:left-auto md:right-6 md:bottom-6 md:max-w-md md:rounded-3xl md:border">
            <div className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{active.category} · {active.brand}</div>
                  <h3 className="mt-1 font-display text-lg font-bold">{active.name}</h3>
                  <div className="mt-1 flex items-center gap-2 text-sm">
                    <span className="font-bold">R$ {active.price.toLocaleString("pt-BR")}</span>
                    <span className="text-muted-foreground">· {active.store}</span>
                    {active.rating > 0 && <span className="flex items-center gap-0.5 text-accent">
                      <Star className="h-3.5 w-3.5 fill-current" /> {active.rating}
                    </span>}
                  </div>
                </div>
                <button onClick={() => setActive(null)} className="text-muted-foreground hover:text-foreground" aria-label="Fechar">✕</button>
              </div>
              {active.cheaperAlt && (
                <div className="mt-3 rounded-2xl border-l-4 border-coral bg-coral/10 p-3 text-sm">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-coral-foreground/80">Alternativa mais barata</div>
                  <div className="mt-0.5 font-semibold">{active.cheaperAlt.name}</div>
                  <div className="text-xs text-muted-foreground">R$ {active.cheaperAlt.price.toLocaleString("pt-BR")} · {active.cheaperAlt.store}</div>
                </div>
              )}
              <div className="mt-4 flex gap-2">
                <Button asChild className="flex-1 gap-2 bg-gradient-hero">
                  <a
                    href={affiliateHref(active)}
                    target="_blank"
                    rel="sponsored noopener noreferrer"
                    onClick={() =>
                      trackAffiliateClick({
                        productId: active.id,
                        setupId: setup.id,
                        store: normalizeStore(active.store),
                      })
                    }
                  >
                    Ver na loja <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
      <RentalLeadModal
        open={rentalOpen}
        onOpenChange={setRentalOpen}
        setupId={fromDb ? setup.id : undefined}
        setupTitle={setup.title}
        totalPriceBrl={total}
      />
    </div>
  );
}