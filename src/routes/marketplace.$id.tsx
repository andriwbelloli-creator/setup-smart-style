import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/CTA";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/use-auth";
import { useIsAdmin } from "@/hooks/use-is-admin";
import { track, trackPageView } from "@/lib/track";
import { toast } from "sonner";
import {
  fetchListingById,
  fetchOffersForListing,
  formatBrl,
  incrementViewCount,
  createOffer,
  updateOfferStatus,
  updateListingStatus,
  deleteListing,
  type MarketplaceListing,
  type MarketplaceOffer,
} from "@/lib/marketplace";
import {
  Loader2,
  MapPin,
  Tag,
  ChevronLeft,
  ChevronRight,
  ImageOff,
  ShoppingBag,
  ShieldCheck,
  ArrowLeft,
  Eye,
  Send,
  Check,
  X,
  Pause,
  Play,
  Trash2,
  Pencil,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export const Route = createFileRoute("/marketplace/$id")({
  head: () => ({
    meta: [
      { title: "Anúncio · Marketplace · HomeOfficeLife" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ListingDetail,
});

function ListingDetail() {
  const { id } = useParams({ from: "/marketplace/$id" });
  const { user } = useAuth();
  const { isAdmin } = useIsAdmin();
  const navigate = useNavigate();

  const [listing, setListing] = useState<MarketplaceListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [imgIdx, setImgIdx] = useState(0);

  const [offerModalOpen, setOfferModalOpen] = useState(false);
  const [offers, setOffers] = useState<MarketplaceOffer[]>([]);
  const [loadingOffers, setLoadingOffers] = useState(false);

  const isOwner = !!user && !!listing && user.id === listing.seller_id;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchListingById(id)
      .then((row) => {
        if (cancelled) return;
        setListing(row);
        if (row) {
          trackPageView("marketplace", {
            route: "listing_detail",
            listing_id: row.id,
            is_owner: !!user && user.id === row.seller_id,
            status: row.status,
            price: Number(row.price),
            category: row.category?.slug,
          });
        }
        if (row && (!user || user.id !== row.seller_id)) incrementViewCount(row.id).catch(() => {});
      })
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [id, user]);

  useEffect(() => {
    if (!isOwner || !listing) return;
    setLoadingOffers(true);
    fetchOffersForListing(listing.id)
      .then((rows) => setOffers(rows))
      .finally(() => setLoadingOffers(false));
  }, [isOwner, listing?.id]);

  const refreshOffers = async () => {
    if (!listing) return;
    const rows = await fetchOffersForListing(listing.id);
    setOffers(rows);
  };

  const onChangeStatus = async (status: "active" | "paused" | "sold") => {
    if (!listing) return;
    const labels: Record<typeof status, string> = {
      active: "reativado", paused: "pausado", sold: "marcado como vendido",
    };
    const { error } = await updateListingStatus(listing.id, status);
    if (error) return toast.error(error.message);
    setListing({ ...listing, status });
    toast.success(`Anúncio ${labels[status]}.`);
  };

  const onDelete = async () => {
    if (!listing) return;
    if (!confirm("Apagar este anúncio permanentemente? Esta ação não pode ser desfeita.")) return;
    const { error } = await deleteListing(listing.id);
    if (error) return toast.error(error.message);
    toast.success("Anúncio apagado.");
    navigate({ to: "/marketplace" });
  };

  const onAdminDelete = async () => {
    if (!listing) return;
    if (!confirm(`ADMIN: excluir o anúncio "${listing.title}"?\n\nVendedor: ${listing.seller?.display_name || listing.seller_id}.\nEsta ação é IRREVERSÍVEL.`)) return;
    const { error } = await deleteListing(listing.id);
    if (error) return toast.error(error.message);
    toast.success("Anúncio excluído (admin).");
    navigate({ to: "/marketplace" });
  };

  const onAcceptOffer = async (offerId: string) => {
    const { error } = await updateOfferStatus(offerId, "accepted");
    if (error) return toast.error(error.message);
    track("marketplace_offer_accepted", "marketplace", { listing_id: listing?.id, offer_id: offerId });
    toast.success("Proposta aceita! Entre em contato com o comprador.");
    await refreshOffers();
  };

  const onRejectOffer = async (offerId: string) => {
    const { error } = await updateOfferStatus(offerId, "rejected");
    if (error) return toast.error(error.message);
    track("marketplace_offer_rejected", "marketplace", { listing_id: listing?.id, offer_id: offerId });
    toast.success("Proposta recusada.");
    await refreshOffers();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-32 text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-20 text-center">
          <ShoppingBag className="mx-auto h-10 w-10 text-muted-foreground" />
          <h1 className="mt-4 font-display text-2xl font-bold">Anúncio não encontrado</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Pode ter sido removido ou estar pausado pelo vendedor.
          </p>
          <Button asChild className="mt-6 bg-gradient-hero">
            <Link to="/marketplace">Voltar ao Marketplace</Link>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  const images = listing.images?.length ? listing.images : [];
  const currentImg = images[imgIdx];
  const totalImgs = images.length;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-10 md:px-6">
        <Link
          to="/marketplace"
          className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar ao Marketplace
        </Link>

        <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr]">
          {/* Galeria */}
          <div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-border bg-muted">
              {currentImg ? (
                <img src={currentImg} alt={listing.title} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                  <ImageOff className="h-16 w-16" />
                </div>
              )}
              {listing.status !== "active" && (
                <div className="absolute inset-0 flex items-center justify-center bg-foreground/60 backdrop-blur-sm">
                  <span className="rounded-full bg-card px-5 py-2 font-display text-base font-bold uppercase tracking-wider">
                    {listing.status === "sold" ? "Vendido" : "Pausado"}
                  </span>
                </div>
              )}
              {totalImgs > 1 && (
                <>
                  <button type="button" onClick={() => setImgIdx((i) => (i - 1 + totalImgs) % totalImgs)} className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-background/90 p-2 shadow-elegant backdrop-blur hover:bg-background" aria-label="Imagem anterior">
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={() => setImgIdx((i) => (i + 1) % totalImgs)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-background/90 p-2 shadow-elegant backdrop-blur hover:bg-background" aria-label="Próxima imagem">
                    <ChevronRight className="h-4 w-4" />
                  </button>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-foreground/80 px-3 py-1 text-xs font-semibold text-background backdrop-blur">
                    {imgIdx + 1} / {totalImgs}
                  </div>
                </>
              )}
            </div>
            {totalImgs > 1 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {images.map((src, i) => (
                  <button key={src} type="button" onClick={() => setImgIdx(i)} className={`h-16 w-16 overflow-hidden rounded-xl border-2 ${i === imgIdx ? "border-primary" : "border-transparent"}`} aria-label={`Imagem ${i + 1}`}>
                    <img src={src} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Painel direito */}
          <div className="space-y-5">
            <div>
              <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {listing.category?.name ?? "Produto"}
              </div>
              <h1 className="mt-1 font-display text-3xl font-bold tracking-tight md:text-4xl">{listing.title}</h1>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                {listing.condition?.name && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold text-foreground">
                    <Tag className="h-3 w-3" /> {listing.condition.name}
                  </span>
                )}
                {(listing.city || listing.state) && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {[listing.city, listing.state].filter(Boolean).join(", ")}
                  </span>
                )}
                <span className="inline-flex items-center gap-1">
                  <Eye className="h-3 w-3" /> {listing.view_count} visualiza{listing.view_count === 1 ? "ção" : "ções"}
                </span>
              </div>
            </div>

            <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Preço pedido</div>
              <div className="mt-1 font-display text-4xl font-bold text-foreground">
                {formatBrl(Number(listing.price))}
              </div>

              {isOwner ? (
                <OwnerActions listing={listing} onStatus={onChangeStatus} onDelete={onDelete} />
              ) : listing.status === "active" ? (
                <Button onClick={() => setOfferModalOpen(true)} className="mt-5 h-12 w-full gap-2 bg-gradient-hero text-base shadow-elegant">
                  <Send className="h-5 w-5" /> Fazer proposta
                </Button>
              ) : (
                <Button disabled className="mt-5 h-12 w-full">
                  {listing.status === "sold" ? "Já foi vendido" : "Anúncio pausado"}
                </Button>
              )}

              {isAdmin && !isOwner && (
                <div className="mt-4 rounded-2xl border border-dashed border-destructive/40 bg-destructive/5 p-3">
                  <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-destructive">
                    Ações de admin
                  </div>
                  <Button
                    onClick={onAdminDelete}
                    variant="destructive"
                    size="sm"
                    className="w-full"
                  >
                    Excluir como admin (permanente)
                  </Button>
                </div>
              )}

              <p className="mt-3 flex items-start gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
                {isOwner
                  ? "Negociação direta com o comprador via dados de contato (Fase 2: chat seguro + pagamento integrado)."
                  : "Sua proposta fica registrada. O vendedor é notificado e responde via plataforma."}
              </p>
            </div>

            {listing.seller && !isOwner && (
              <div className="rounded-3xl border border-border bg-card p-5 shadow-soft">
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Vendedor</div>
                <div className="mt-2 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-hero text-base font-bold text-primary-foreground">
                    {(listing.seller.display_name || "?")[0].toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate font-semibold">{listing.seller.display_name || "Anônimo"}</div>
                    {listing.seller.username && (
                      <div className="truncate text-xs text-muted-foreground">@{listing.seller.username}</div>
                    )}
                  </div>
                </div>
                {listing.contact ? (
                  user ? (
                    <div className="mt-4 rounded-2xl border border-border bg-background p-3">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Contato direto</div>
                      <div className="mt-1 break-all text-sm font-medium text-foreground">{listing.contact}</div>
                      <p className="mt-2 text-[11px] text-muted-foreground">
                        Negociação fora da plataforma. Sempre encontre em local público e teste o produto antes de pagar.
                      </p>
                    </div>
                  ) : (
                    <Link
                      to="/auth"
                      className="mt-4 block rounded-2xl border border-dashed border-border bg-background p-3 text-center text-xs text-muted-foreground hover:border-foreground/40"
                    >
                      Faça login pra ver o contato do vendedor →
                    </Link>
                  )
                ) : null}
              </div>
            )}
          </div>
        </div>

        {/* Descrição */}
        <section className="mt-12 max-w-3xl">
          <h2 className="font-display text-xl font-bold">Descrição</h2>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
            {listing.description}
          </p>
        </section>

        {/* Propostas recebidas — só pra dono */}
        {isOwner && (
          <section className="mt-12 max-w-3xl">
            <h2 className="font-display text-xl font-bold">
              Propostas recebidas {offers.length > 0 && <span className="text-muted-foreground">({offers.length})</span>}
            </h2>
            {loadingOffers ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : offers.length === 0 ? (
              <div className="mt-4 rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                Ainda não chegou nenhuma proposta.
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {offers.map((o) => (
                  <OfferRow key={o.id} offer={o} onAccept={onAcceptOffer} onReject={onRejectOffer} listingPrice={Number(listing.price)} />
                ))}
              </div>
            )}
          </section>
        )}
      </main>
      <Footer />

      <OfferModal
        open={offerModalOpen}
        onOpenChange={setOfferModalOpen}
        listing={listing}
        onSent={() => { setOfferModalOpen(false); }}
      />
    </div>
  );
}

function OwnerActions({
  listing,
  onStatus,
  onDelete,
}: {
  listing: MarketplaceListing;
  onStatus: (s: "active" | "paused" | "sold") => void;
  onDelete: () => void;
}) {
  return (
    <div className="mt-5 space-y-2">
      <div className="grid grid-cols-2 gap-2">
        {listing.status === "active" ? (
          <Button variant="outline" onClick={() => onStatus("paused")} className="gap-2">
            <Pause className="h-4 w-4" /> Pausar
          </Button>
        ) : (
          <Button variant="outline" onClick={() => onStatus("active")} className="gap-2">
            <Play className="h-4 w-4" /> Reativar
          </Button>
        )}
        <Button
          variant="outline"
          onClick={() => onStatus("sold")}
          disabled={listing.status === "sold"}
          className="gap-2"
        >
          <CheckCircle2 className="h-4 w-4" /> Marcar vendido
        </Button>
      </div>
      <Button variant="outline" onClick={onDelete} className="w-full gap-2 border-coral/40 text-coral hover:bg-coral/5 hover:text-coral">
        <Trash2 className="h-4 w-4" /> Apagar anúncio
      </Button>
    </div>
  );
}

function OfferRow({
  offer,
  onAccept,
  onReject,
  listingPrice,
}: {
  offer: MarketplaceOffer;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  listingPrice: number;
}) {
  const diff = Number(offer.price_offered) - listingPrice;
  const diffPct = listingPrice > 0 ? Math.round((diff / listingPrice) * 100) : 0;
  const statusColor: Record<typeof offer.status, string> = {
    pending: "bg-secondary text-foreground",
    accepted: "bg-primary/15 text-primary",
    rejected: "bg-coral/15 text-coral",
    withdrawn: "bg-muted text-muted-foreground",
  };
  const statusLabel: Record<typeof offer.status, string> = {
    pending: "Pendente", accepted: "Aceita", rejected: "Recusada", withdrawn: "Cancelada pelo comprador",
  };
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-hero text-sm font-bold text-primary-foreground">
              {(offer.buyer?.display_name || "?")[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold">{offer.buyer?.display_name || "Anônimo"}</div>
              {offer.buyer?.username && (
                <div className="truncate text-xs text-muted-foreground">@{offer.buyer.username}</div>
              )}
            </div>
          </div>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusColor[offer.status]}`}>
          {statusLabel[offer.status]}
        </span>
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="font-display text-2xl font-bold">{formatBrl(Number(offer.price_offered))}</span>
        {diff !== 0 && (
          <span className={`text-xs font-semibold ${diff < 0 ? "text-coral" : "text-primary"}`}>
            ({diff > 0 ? "+" : ""}{diffPct}% vs. pedido)
          </span>
        )}
      </div>

      {offer.message && (
        <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">"{offer.message}"</p>
      )}

      {offer.status === "pending" && (
        <div className="mt-4 flex gap-2">
          <Button size="sm" onClick={() => onAccept(offer.id)} className="gap-2 bg-gradient-hero">
            <Check className="h-4 w-4" /> Aceitar
          </Button>
          <Button size="sm" variant="outline" onClick={() => onReject(offer.id)} className="gap-2 text-coral">
            <X className="h-4 w-4" /> Recusar
          </Button>
        </div>
      )}

      <div className="mt-3 text-[11px] text-muted-foreground">
        Enviada em {new Date(offer.created_at).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}
      </div>
    </div>
  );
}

function OfferModal({
  open,
  onOpenChange,
  listing,
  onSent,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  listing: MarketplaceListing;
  onSent: () => void;
}) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [price, setPrice] = useState<string>(String(listing.price));
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const priceNum = Number(String(price).replace(",", "."));
  const isValid = priceNum > 0 && priceNum < 1_000_000;
  const askPrice = Number(listing.price);
  const diffPct = askPrice > 0 ? Math.round(((priceNum - askPrice) / askPrice) * 100) : 0;

  const submit = async () => {
    if (!user) {
      toast.error("Faça login pra enviar proposta");
      onOpenChange(false);
      navigate({ to: "/auth" });
      return;
    }
    if (!isValid) return;
    setSubmitting(true);
    const { error } = await createOffer({
      listing_id: listing.id,
      buyer_id: user.id,
      seller_id: listing.seller_id,
      price_offered: priceNum,
      message: message.trim() || undefined,
    });
    setSubmitting(false);
    if (error) {
      // 23505 = unique_violation (proposta pendente já existe)
      const msg = String((error as any).message || "");
      if (msg.includes("marketplace_offers_unique_pending")) {
        toast.error("Você já tem uma proposta pendente neste anúncio.");
      } else {
        toast.error(msg || "Falha ao enviar proposta");
      }
      return;
    }
    track("marketplace_offer_create", "marketplace", {
      listing_id: listing.id,
      price_offered: priceNum,
      ask_price: askPrice,
      diff_pct: diffPct,
      with_message: !!message.trim(),
    });
    toast.success("Proposta enviada! O vendedor foi notificado.");
    onSent();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Fazer proposta</DialogTitle>
          <DialogDescription>
            Anúncio: <strong>{listing.title}</strong>
            <br />
            Preço pedido: <strong>{formatBrl(askPrice)}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold">Sua oferta (R$)</Label>
            <Input
              type="number"
              min={1}
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Ex: 1200"
              inputMode="decimal"
            />
            {isValid && (
              <p className={`text-[11px] font-semibold ${diffPct < 0 ? "text-coral" : diffPct > 0 ? "text-primary" : "text-muted-foreground"}`}>
                {diffPct === 0 ? "Mesma valor do pedido" : `${diffPct > 0 ? "+" : ""}${diffPct}% vs. pedido`}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-semibold">Mensagem (opcional)</Label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ex: Posso buscar amanhã em Pinheiros."
              rows={3}
              maxLength={1000}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div className="flex items-start gap-2 rounded-xl bg-primary/5 p-3 text-xs text-muted-foreground">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-primary" />
            <span>
              Você pode cancelar a proposta a qualquer momento antes do vendedor responder.
              Após aceita, vocês entram em contato direto pra fechar.
            </span>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancelar
          </Button>
          <Button onClick={submit} disabled={!isValid || submitting} className="gap-2 bg-gradient-hero">
            {submitting ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Enviando...</>
            ) : (
              <><Send className="h-4 w-4" /> Enviar proposta</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
