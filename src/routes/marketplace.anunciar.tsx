import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/CTA";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { track, trackPageView } from "@/lib/track";
import {
  createListing,
  fetchCategories,
  fetchConditions,
  formatBrl,
  uploadListingImage,
  type MarketplaceCategory,
  type MarketplaceCondition,
} from "@/lib/marketplace";
import {
  Loader2,
  Image as ImageIcon,
  X,
  Upload,
  ShoppingBag,
  Info,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/marketplace/anunciar")({
  head: () => ({
    meta: [
      { title: "Anunciar produto · Marketplace · HomeOfficeLife" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AnunciarProduto,
});

const MAX_IMAGES = 6;
const MAX_FILE_BYTES = 8 * 1024 * 1024;

type PendingImage = {
  id: string;
  file: File;
  previewUrl: string;
};

function AnunciarProduto() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [categories, setCategories] = useState<MarketplaceCategory[]>([]);
  const [conditions, setConditions] = useState<MarketplaceCondition[]>([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<string>("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [conditionId, setConditionId] = useState<string>("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [images, setImages] = useState<PendingImage[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [authorshipConfirmed, setAuthorshipConfirmed] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      toast.error("Faça login para anunciar um produto");
      navigate({ to: "/auth" });
    }
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (user) trackPageView("marketplace", { route: "create_listing" });
  }, [user]);

  useEffect(() => {
    Promise.all([fetchCategories(), fetchConditions()]).then(([cats, conds]) => {
      setCategories(cats);
      setConditions(conds);
      if (cats[0]) setCategoryId(cats[0].id);
      if (conds[0]) setConditionId(conds[0].id);
    });
  }, []);

  useEffect(() => {
    return () => {
      images.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    };
  }, [images]);

  const onFiles = (files: FileList | null) => {
    if (!files) return;
    const incoming = Array.from(files);
    const remaining = MAX_IMAGES - images.length;
    const accepted: PendingImage[] = [];
    for (const f of incoming.slice(0, remaining)) {
      if (f.size > MAX_FILE_BYTES) {
        toast.error(`"${f.name}" passa de 8MB e foi ignorada.`);
        continue;
      }
      accepted.push({
        id: crypto.randomUUID(),
        file: f,
        previewUrl: URL.createObjectURL(f),
      });
    }
    setImages((prev) => [...prev, ...accepted]);
  };

  const removeImage = (id: string) => {
    setImages((prev) => {
      const next = prev.filter((img) => img.id !== id);
      const removed = prev.find((img) => img.id === id);
      if (removed) URL.revokeObjectURL(removed.previewUrl);
      return next;
    });
  };

  const priceNum = Number(price.replace(",", "."));

  const isValid =
    title.trim().length >= 4 &&
    description.trim().length >= 10 &&
    priceNum > 0 &&
    categoryId &&
    conditionId &&
    images.length >= 1 &&
    authorshipConfirmed;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !isValid) return;
    setSubmitting(true);
    try {
      // 1. upload das imagens em paralelo
      const urls = await Promise.all(
        images.map((img) => uploadListingImage(user.id, img.file)),
      );

      // 2. cria o anúncio
      const { data, error } = await createListing(user.id, {
        title: title.trim(),
        description: description.trim(),
        price: priceNum,
        category_id: categoryId,
        condition_id: conditionId,
        images: urls,
        city: city.trim() || undefined,
        state: state.trim() || undefined,
      });
      if (error) throw error;

      track("marketplace_listing_create", "marketplace", {
        listing_id: data.id,
        category_id: categoryId,
        condition_id: conditionId,
        price: priceNum,
        image_count: images.length,
      });
      toast.success("Anúncio publicado!");
      navigate({ to: "/marketplace/$id", params: { id: data.id } });
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Erro ao publicar anúncio");
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-32 text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-12 md:px-6 md:py-16">
        <div className="mb-8 max-w-2xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
            <ShoppingBag className="h-3 w-3" /> Marketplace
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
            Anunciar produto usado
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">
            Fotos boas e descrição honesta vendem rápido. Sem taxa pra publicar.
          </p>
        </div>

        <form onSubmit={submit} className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
          {/* Coluna esquerda: imagens */}
          <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
            <Label className="text-sm font-semibold">
              Fotos do produto <span className="text-destructive">*</span>
            </Label>
            <p className="mt-1 text-xs text-muted-foreground">
              De 1 a {MAX_IMAGES} imagens, até 8MB cada. A primeira vira a capa.
            </p>

            <div className="mt-4 grid grid-cols-3 gap-3">
              {images.map((img, idx) => (
                <div
                  key={img.id}
                  className="group relative aspect-square overflow-hidden rounded-2xl border border-border bg-background"
                >
                  <img src={img.previewUrl} alt="" className="h-full w-full object-cover" />
                  {idx === 0 && (
                    <span className="absolute left-2 top-2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground shadow">
                      Capa
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(img.id)}
                    className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-foreground/80 text-background opacity-0 transition-smooth group-hover:opacity-100"
                    aria-label="Remover imagem"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}

              {images.length < MAX_IMAGES && (
                <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-border bg-background text-xs text-muted-foreground transition-smooth hover:border-primary hover:text-foreground">
                  <ImageIcon className="h-6 w-6" />
                  <span>Adicionar</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => onFiles(e.target.files)}
                  />
                </label>
              )}
            </div>
          </div>

          {/* Coluna direita: campos */}
          <div className="space-y-5">
            <Field label="Título" required>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Monitor LG UltraGear 27GN800 144Hz"
                maxLength={100}
                required
              />
              <p className="mt-1 text-[11px] text-muted-foreground">
                {title.length}/100 — mínimo 4 caracteres
              </p>
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Categoria" required>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  required
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Condição" required>
                <select
                  value={conditionId}
                  onChange={(e) => setConditionId(e.target.value)}
                  required
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  {conditions.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <Field label="Preço (R$)" required>
              <Input
                type="number"
                min={1}
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Ex: 1250"
                required
                inputMode="decimal"
              />
              {priceNum > 0 && (
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Preview: {formatBrl(priceNum)}
                </p>
              )}
            </Field>

            <Field label="Descrição" required>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Estado de conservação, tempo de uso, acessórios inclusos, motivo da venda..."
                maxLength={4000}
                rows={6}
                required
                className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none"
              />
              <p className="mt-1 text-[11px] text-muted-foreground">
                {description.length}/4000 — mínimo 10 caracteres
              </p>
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Cidade">
                <Input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="São Paulo"
                  maxLength={60}
                />
              </Field>
              <Field label="UF">
                <Input
                  value={state}
                  onChange={(e) => setState(e.target.value.toUpperCase())}
                  placeholder="SP"
                  maxLength={2}
                />
              </Field>
            </div>

            <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-border bg-background p-4 transition-smooth hover:border-foreground/40">
              <input
                type="checkbox"
                checked={authorshipConfirmed}
                onChange={(e) => setAuthorshipConfirmed(e.target.checked)}
                className="mt-0.5 h-4 w-4 flex-shrink-0 cursor-pointer accent-primary"
                required
              />
              <span className="text-xs leading-relaxed text-muted-foreground">
                <strong className="text-foreground">Confirmo que sou o dono do produto</strong>,
                que ele está conforme descrito e autorizo a publicação. Veja a{" "}
                <Link to="/termos" className="text-primary underline">
                  política do Marketplace
                </Link>
                .
              </span>
            </label>

            <div className="flex items-start gap-2 rounded-2xl bg-primary/5 p-4 text-xs text-muted-foreground">
              <Info className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-primary" />
              <span>
                Pagamento integrado com proteção e split de taxa chegam na Fase 2 (Pagar.me).
                Por enquanto a comunicação é feita fora da plataforma.
              </span>
            </div>

            <Button
              type="submit"
              disabled={submitting || !isValid}
              className="h-12 w-full gap-2 bg-gradient-hero text-base shadow-elegant disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Publicando...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" /> Publicar anúncio
                </>
              )}
            </Button>
          </div>
        </form>
      </main>
      <Footer />
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-semibold">
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      {children}
    </div>
  );
}
