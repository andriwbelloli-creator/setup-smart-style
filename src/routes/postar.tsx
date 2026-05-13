import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/CTA";
import { Button } from "@/components/ui/button";
import { Upload, Image as ImageIcon, Plus, X, Loader2, Wand2 } from "lucide-react";
import { STYLES, ROLES } from "@/data/setups";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { slugify } from "@/lib/setups-db";
import { toast } from "sonner";

export const Route = createFileRoute("/postar")({
  head: () => ({
    meta: [
      { title: "Postar meu setup · HomeOfficeLife" },
      { name: "description", content: "Compartilhe seu home office com a comunidade HomeOfficeLife e receba feedback de ergonomia, iluminação e estética." },
    ],
  }),
  component: Postar,
});

const careerMap: Record<string, string> = {
  Dev: "dev", Designer: "designer", "PO/PM": "po", Creator: "creator", Remoto: "remoto",
};

type DraftProduct = {
  id: string;
  category: string;
  name: string;
  brand: string;
  price: number;
  store: string;
  affiliate_url: string;
  x: number;
  y: number;
};

const CATEGORIES = ["Mesa", "Cadeira", "Monitor", "Notebook", "Iluminação", "Decoração", "Periféricos"];
const STORES = ["Amazon BR", "Mercado Livre", "Kabum", "Magalu", "Pichau", "outro"];

function Postar() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [city, setCity] = useState("");
  const [role, setRole] = useState<string>(ROLES[0]);
  const [picked, setPicked] = useState<string[]>([]);
  const [budget, setBudget] = useState<number>(3000);
  const [products, setProducts] = useState<DraftProduct[]>([]);
  const [editingProduct, setEditingProduct] = useState<DraftProduct | null>(null);
  const [submitting, setSubmitting] = useState(false);
  // Cessão de imagem — Lei 9.610/98 art. 79 + Lei Geral de Proteção
  // de Dados art. 7º. Sem o aceite explícito, bloqueamos o submit.
  const [authorshipConfirmed, setAuthorshipConfirmed] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      toast.error("Faça login para postar um setup");
      navigate({ to: "/auth" });
    }
  }, [authLoading, user, navigate]);

  const handleFile = (f: File | undefined) => {
    if (!f) return;
    if (f.size > 8 * 1024 * 1024) { toast.error("Imagem precisa ter no máximo 8MB"); return; }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const togglePick = (s: string) => {
    setPicked((prev) => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  };

  const onImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!preview) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    const draft: DraftProduct = {
      id: crypto.randomUUID(),
      category: "Monitor", name: "", brand: "", price: 0, store: "Amazon BR", affiliate_url: "", x, y,
    };
    setEditingProduct(draft);
  };

  const saveProduct = (p: DraftProduct) => {
    setProducts((prev) => {
      const exists = prev.find(x => x.id === p.id);
      if (exists) return prev.map(x => x.id === p.id ? p : x);
      return [...prev, p];
    });
    setEditingProduct(null);
  };

  const removeProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    if (editingProduct?.id === id) setEditingProduct(null);
  };

  // Detecta x/y dos produtos via Gemini Vision. Requer que o usuário tenha
  // ao menos 1 produto declarado (com nome e categoria) — a IA precisa saber
  // o que procurar. Filtra confidence >= 85 no servidor.
  const [detecting, setDetecting] = useState(false);
  const [autoDetectEnabled, setAutoDetectEnabled] = useState(true);
  // Debounce: dispara detect 3s após última edição de produto.
  // Evita gastar quota a cada keystroke.
  useEffect(() => {
    if (!autoDetectEnabled || !file || detecting) return;
    const named = products.filter((p) => p.name?.trim().length >= 3);
    if (named.length === 0) return;
    const handle = setTimeout(() => {
      detectTouchpointsViaAI({ silent: true });
    }, 3000);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products.map((p) => `${p.id}:${p.name}`).join(","), file, autoDetectEnabled]);

  const detectTouchpointsViaAI = async ({ silent = false }: { silent?: boolean } = {}) => {
    if (!file || products.length === 0) {
      if (!silent) toast.error("Adicione ao menos 1 produto (nome + categoria) antes de detectar.");
      return;
    }
    const named = products.filter((p) => p.name?.trim());
    if (named.length === 0) {
      if (!silent) toast.error("Produtos precisam ter nome preenchido para a IA buscar.");
      return;
    }
    setDetecting(true);
    try {
      const reader = new FileReader();
      const imageBase64: string = await new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const knownProducts = named.map((p) => ({ category: p.category, name: p.name }));
      // Tenta Gemini primeiro (qualidade alta). Se rate-limit/quota → cai
      // pra Cloud Vision API (cota separada). Body shape é idêntico.
      const tryEndpoint = async (fn: "detect-touchpoints" | "detect-touchpoints-vision") => {
        return supabase.functions.invoke(fn, { body: { imageBase64, knownProducts } });
      };
      let { data, error } = await tryEndpoint("detect-touchpoints");
      const errMsg = error?.message || (data as any)?.error || "";
      const isQuotaError =
        errMsg.toLowerCase().includes("quota") ||
        errMsg.toLowerCase().includes("rate") ||
        errMsg.includes("429") ||
        (data as any)?.gemini_status === 429;
      if ((error || (data as any)?.error) && isQuotaError) {
        if (!silent) toast.info("Gemini sem cota — usando Cloud Vision (mais simples).");
        ({ data, error } = await tryEndpoint("detect-touchpoints-vision"));
      }
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);

      const detected = (data?.products || []) as Array<{
        name: string; category: string; x: number; y: number; confidence: number;
      }>;
      if (detected.length === 0) {
        if (!silent) toast.info("IA não conseguiu localizar nenhum produto com certeza. Marque manualmente.");
        return;
      }
      // Match por (category, name) — atualiza x/y só nos produtos batidos.
      setProducts((prev) => prev.map((p) => {
        const hit = detected.find(
          (d) => d.name.toLowerCase() === p.name.toLowerCase() && d.category === p.category,
        );
        return hit ? { ...p, x: hit.x, y: hit.y } : p;
      }));
      if (!silent) toast.success(`${detected.length} de ${named.length} produto(s) localizados pela IA.`);
    } catch (err: any) {
      if (!silent) console.error("detect-touchpoints:", err);
      toast.error(err.message || "Falha ao detectar touchpoints.");
    } finally {
      setDetecting(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !file) return;

    // Crivo de qualidade — pré-requisitos pra publicar
    // 1. Pelo menos 1 touchpoint marcado (produto na foto)
    const named = products.filter((p) => p.name?.trim() && p.x >= 0 && p.y >= 0);
    if (named.length === 0) {
      toast.error("Marque pelo menos 1 produto na sua foto antes de publicar.");
      return;
    }
    // 2. Descrição mínima
    if (description.trim().length < 20) {
      toast.error("Descrição precisa ter no mínimo 20 caracteres pra dar contexto pra comunidade.");
      return;
    }

    setSubmitting(true);
    try {
      // 1. upload image
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
      const up = await supabase.storage.from("setups").upload(path, file, { contentType: file.type });
      if (up.error) throw up.error;
      const { data: pub } = supabase.storage.from("setups").getPublicUrl(path);
      const cover_url = pub.publicUrl;

      // 2. create setup
      const baseSlug = slugify(title) || "setup";
      const slug = `${baseSlug}-${Math.random().toString(36).slice(2, 7)}`;
      const { data: setupRow, error: setupErr } = await supabase
        .from("setups")
        .insert({
          owner_id: user.id,
          slug, title, description: description || "",
          city, budget_brl: budget,
          career: careerMap[role] as any,
          styles: picked,
          cover_url,
          status: "published",
        })
        .select()
        .single();
      if (setupErr) throw setupErr;

      // 3. cover image record
      await supabase.from("setup_images").insert({
        setup_id: setupRow.id, url: cover_url, position: 0,
      });

      // 4. products
      if (products.length) {
        await supabase.from("setup_products").insert(
          products.map((p, i) => ({
            setup_id: setupRow.id,
            category: p.category,
            name: p.name,
            brand: p.brand || null,
            price_brl: p.price,
            store: p.store as any,
            affiliate_url: p.affiliate_url || null,
            x: p.x, y: p.y,
            position: i,
          }))
        );
      }

      toast.success("Setup publicado!");
      navigate({ to: "/setup/$slug", params: { slug } });
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Erro ao publicar");
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return <div className="min-h-screen bg-background"><Navbar /><div className="container py-32 text-center"><Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" /></div></div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-12 md:px-6 md:py-16">
        <div className="mb-8 max-w-2xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
            Compartilhar setup
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl">Postar meu home office</h1>
          <p className="mt-3 text-lg text-muted-foreground">
            Mostra seu canto pra comunidade BR. <strong>Clique na imagem</strong> pra marcar produtos.
          </p>
        </div>

        <form onSubmit={submit} className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
            <span className="text-sm font-semibold">Foto do setup</span>
            {!preview ? (
              <label className="mt-3 flex aspect-[4/3] cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-border bg-background transition-smooth hover:border-primary">
                <div className="text-center text-muted-foreground">
                  <ImageIcon className="mx-auto h-10 w-10" />
                  <div className="mt-2 text-sm">Clique para escolher uma foto (até 8MB)</div>
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
              </label>
            ) : (
              <div className="mt-3">
                <div onClick={onImageClick} className="relative aspect-[4/3] cursor-crosshair overflow-hidden rounded-2xl border border-border bg-background">
                  <img src={preview} alt="Preview" className="h-full w-full object-cover" />
                  {products.map((p) => (
                    <button type="button" key={p.id}
                      onClick={(e) => { e.stopPropagation(); setEditingProduct(p); }}
                      style={{ left: `${p.x}%`, top: `${p.y}%` }}
                      className="absolute -translate-x-1/2 -translate-y-1/2">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-accent text-accent-foreground shadow-elegant">
                        <Plus className="h-4 w-4" />
                      </span>
                    </button>
                  ))}
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{products.length} produto{products.length !== 1 ? "s" : ""} marcado{products.length !== 1 ? "s" : ""}</span>
                  <button type="button" onClick={() => { setFile(null); setPreview(null); setProducts([]); }} className="text-coral hover:underline">Trocar foto</button>
                </div>
                {/* Auto-detect: só faz sentido se o usuário JÁ digitou nomes dos produtos */}
                {products.some((p) => p.name?.trim()) && (
                  <button
                    type="button"
                    onClick={() => detectTouchpointsViaAI({ silent: false })}
                    disabled={detecting}
                    className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-primary/50 bg-primary/5 px-4 py-2.5 text-sm font-semibold text-primary transition-smooth hover:bg-primary/10 disabled:opacity-50"
                  >
                    {detecting ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /> Detectando posições...</>
                    ) : (
                      <><Wand2 className="h-4 w-4" /> Detectar posições com IA</>
                    )}
                  </button>
                )}
              </div>
            )}

            {editingProduct && (
              <ProductEditor
                key={editingProduct.id}
                draft={editingProduct}
                onSave={saveProduct}
                onRemove={() => removeProduct(editingProduct.id)}
                onCancel={() => setEditingProduct(null)}
              />
            )}
          </div>

          <div className="space-y-5">
            <Field label="Título do setup">
              <input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Cantinho dev em apê 40m²" maxLength={80}
                className="h-12 w-full rounded-2xl border border-border bg-card px-4 text-sm focus:border-primary focus:outline-none" />
            </Field>
            <Field label="Descrição">
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Como você usa, o que destaca, dicas..." maxLength={600} rows={3}
                className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm focus:border-primary focus:outline-none" />
            </Field>
            <Field label="Cidade / UF">
              <input required value={city} onChange={(e) => setCity(e.target.value)} placeholder="Ex: São Paulo, SP" maxLength={60}
                className="h-12 w-full rounded-2xl border border-border bg-card px-4 text-sm focus:border-primary focus:outline-none" />
            </Field>
            <Field label="Sua função">
              <div className="flex flex-wrap gap-2">
                {ROLES.map((r) => (
                  <button type="button" key={r} onClick={() => setRole(r)}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-smooth ${
                      role === r ? "bg-foreground text-background" : "border border-border bg-card text-muted-foreground hover:text-foreground"
                    }`}>{r}</button>
                ))}
              </div>
            </Field>
            <Field label="Estilos (selecione 1+)">
              <div className="flex flex-wrap gap-2">
                {STYLES.filter(s => s !== "Todos").map((s) => (
                  <button type="button" key={s} onClick={() => togglePick(s)}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-smooth ${
                      picked.includes(s) ? "bg-primary text-primary-foreground" : "border border-border bg-card text-muted-foreground hover:text-foreground"
                    }`}>{s}</button>
                ))}
              </div>
            </Field>
            <Field label={`Orçamento total: R$ ${budget.toLocaleString("pt-BR")}`}>
              <input type="range" min={500} max={20000} step={100} value={budget}
                onChange={(e) => setBudget(Number(e.target.value))} className="w-full accent-primary" />
            </Field>
            {/* Cessão de imagem — Lei 9.610/98 (Direitos Autorais) */}
            <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-border bg-background p-4 transition-smooth hover:border-foreground/40">
              <input
                type="checkbox"
                checked={authorshipConfirmed}
                onChange={(e) => setAuthorshipConfirmed(e.target.checked)}
                className="mt-0.5 h-4 w-4 flex-shrink-0 cursor-pointer accent-primary"
                aria-label="Declaração de autoria"
                required
              />
              <span className="text-xs leading-relaxed text-muted-foreground">
                <strong className="text-foreground">Declaro que sou o autor desta foto</strong> e autorizo sua exibição pública no HomeOfficeLife. Veja a{" "}
                <Link to="/termos" className="text-primary underline">licença de uso de conteúdo</Link>{" "}
                nos Termos.
              </span>
            </label>
            <Button type="submit" disabled={submitting || !file || !title || !city || picked.length === 0 || !authorshipConfirmed}
              className="h-12 w-full gap-2 bg-gradient-hero text-base shadow-elegant disabled:opacity-50">
              {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Publicando...</> : <><Upload className="h-4 w-4" /> Publicar setup</>}
            </Button>
            <p className="text-xs text-muted-foreground">
              Após publicar, seu setup aparece imediatamente na <Link to="/galeria" className="text-primary underline">galeria</Link>.
            </p>
          </div>
        </form>
      </main>
      <Footer />
    </div>
  );
}

function ProductEditor({ draft, onSave, onRemove, onCancel }: {
  draft: DraftProduct; onSave: (p: DraftProduct) => void; onRemove: () => void; onCancel: () => void;
}) {
  const [p, setP] = useState<DraftProduct>(draft);
  return (
    <div className="mt-4 rounded-2xl border border-accent bg-accent/5 p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-semibold">Marcar produto</span>
        <button type="button" onClick={onCancel} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <select value={p.category} onChange={(e) => setP({ ...p, category: e.target.value })} className="h-10 rounded-xl border border-border bg-background px-3 text-sm">
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
        <select value={p.store} onChange={(e) => setP({ ...p, store: e.target.value })} className="h-10 rounded-xl border border-border bg-background px-3 text-sm">
          {STORES.map(s => <option key={s}>{s}</option>)}
        </select>
        <input placeholder="Nome do produto" value={p.name} onChange={(e) => setP({ ...p, name: e.target.value })} className="col-span-2 h-10 rounded-xl border border-border bg-background px-3 text-sm" />
        <input placeholder="Marca" value={p.brand} onChange={(e) => setP({ ...p, brand: e.target.value })} className="h-10 rounded-xl border border-border bg-background px-3 text-sm" />
        <input type="number" placeholder="Preço R$" value={p.price || ""} onChange={(e) => setP({ ...p, price: Number(e.target.value) })} className="h-10 rounded-xl border border-border bg-background px-3 text-sm" />
        <input placeholder="Link de compra (opcional)" value={p.affiliate_url} onChange={(e) => setP({ ...p, affiliate_url: e.target.value })} className="col-span-2 h-10 rounded-xl border border-border bg-background px-3 text-sm" />
      </div>
      <div className="mt-3 flex gap-2">
        <Button type="button" size="sm" onClick={() => p.name && onSave(p)} disabled={!p.name} className="flex-1 bg-foreground text-background">Salvar marcação</Button>
        <Button type="button" size="sm" variant="outline" onClick={onRemove} className="text-coral">Remover</Button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 text-sm font-semibold">{label}</div>
      {children}
    </div>
  );
}