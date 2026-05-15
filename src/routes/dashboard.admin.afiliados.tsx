import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Navbar } from "@/components/landing/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { useIsAdmin } from "@/hooks/use-is-admin";
import { supabase } from "@/integrations/supabase/client";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Pause,
  AlertTriangle,
  ExternalLink,
  Edit,
} from "lucide-react";
import { toast } from "sonner";
import type { AffiliateProviderRow } from "@/lib/affiliate-deeplink";
import { generateAffiliateUrl } from "@/lib/affiliate-deeplink";

export const Route = createFileRoute("/dashboard/admin/afiliados")({
  head: () => ({
    meta: [
      { title: "Afiliados & Monetização · Admin · HomeOfficeLife" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminAfiliados,
});

const STATUS_META: Record<
  AffiliateProviderRow["status"],
  { label: string; icon: typeof CheckCircle2; cls: string }
> = {
  active:  { label: "Ativo",    icon: CheckCircle2, cls: "bg-primary/10 text-primary" },
  pending: { label: "Pendente", icon: Clock,        cls: "bg-accent/15 text-accent" },
  paused:  { label: "Pausado",  icon: Pause,        cls: "bg-muted text-muted-foreground" },
  error:   { label: "Erro",     icon: AlertTriangle,cls: "bg-coral/15 text-coral" },
};

function AdminAfiliados() {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useIsAdmin();
  const navigate = useNavigate();

  const [providers, setProviders] = useState<AffiliateProviderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<AffiliateProviderRow | null>(null);

  useEffect(() => {
    if (!authLoading && !user) navigate({ to: "/auth" });
    if (!adminLoading && !isAdmin && user) navigate({ to: "/" });
  }, [authLoading, adminLoading, isAdmin, user, navigate]);

  useEffect(() => {
    if (!isAdmin) return;
    (async () => {
      setLoading(true);
      const { data, error } = await (supabase as any)
        .from("affiliate_providers")
        .select("*")
        .order("status", { ascending: true })
        .order("name");
      if (error) console.warn("providers fetch:", error.message);
      setProviders((data as AffiliateProviderRow[]) ?? []);
      setLoading(false);
    })();
  }, [isAdmin]);

  const stats = useMemo(() => {
    const total = providers.length;
    const active = providers.filter((p) => p.status === "active").length;
    const pending = providers.filter((p) => p.status === "pending").length;
    const errored = providers.filter((p) => p.status === "error").length;
    return { total, active, pending, errored };
  }, [providers]);

  if (authLoading || adminLoading || (!isAdmin && user)) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-10 md:px-6">
        <Link
          to="/dashboard/admin"
          className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar ao admin
        </Link>

        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
            Afiliados & Monetização
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Configure IDs reais de cada programa. Pendentes mostram produto com fallback de busca.
          </p>
        </div>

        {/* KPIs */}
        <div className="mb-8 grid gap-4 sm:grid-cols-4">
          <StatCard label="Total" value={stats.total} />
          <StatCard label="Ativos" value={stats.active} accent="primary" />
          <StatCard label="Pendentes" value={stats.pending} accent="accent" />
          <StatCard label="Erro" value={stats.errored} accent="coral" />
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground">Carregando providers...</p>
        ) : (
          <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-soft">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Loja</th>
                  <th className="px-4 py-3">Rede</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">ID afiliado</th>
                  <th className="px-4 py-3">Comissão</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {providers.map((p) => {
                  const s = STATUS_META[p.status];
                  const Icon = s.icon;
                  return (
                    <tr key={p.id} className="hover:bg-muted/20">
                      <td className="px-4 py-3 font-semibold">{p.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{p.network}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${s.cls}`}>
                          <Icon className="h-3 w-3" /> {s.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                        {p.affiliate_id || <span className="italic">não configurado</span>}
                      </td>
                      <td className="px-4 py-3">{(p.commission_estimate * 100).toFixed(1)}%</td>
                      <td className="px-4 py-3 text-right">
                        <Button size="sm" variant="ghost" onClick={() => setEditing(p)}>
                          <Edit className="h-3.5 w-3.5" /> Editar
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {editing && (
          <ProviderModal
            provider={editing}
            onClose={() => setEditing(null)}
            onSaved={(updated) => {
              setProviders((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
              setEditing(null);
            }}
          />
        )}
      </main>
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: number; accent?: "primary" | "accent" | "coral" }) {
  const color =
    accent === "primary" ? "text-primary" :
    accent === "accent" ? "text-accent" :
    accent === "coral" ? "text-coral" :
    "text-foreground";
  return (
    <div className="rounded-3xl border border-border bg-card p-5 shadow-soft">
      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`mt-1 font-display text-3xl font-bold ${color}`}>{value}</div>
    </div>
  );
}

function ProviderModal({
  provider,
  onClose,
  onSaved,
}: {
  provider: AffiliateProviderRow;
  onClose: () => void;
  onSaved: (updated: AffiliateProviderRow) => void;
}) {
  const [affiliateId, setAffiliateId] = useState(provider.affiliate_id ?? "");
  const [trackingId, setTrackingId] = useState(provider.tracking_id ?? "");
  const [status, setStatus] = useState<AffiliateProviderRow["status"]>(provider.status);
  const [subidTemplate, setSubidTemplate] = useState(provider.subid_template ?? "");
  const [commission, setCommission] = useState(provider.commission_estimate);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  const save = async () => {
    setSaving(true);
    const { data, error } = await (supabase as any)
      .from("affiliate_providers")
      .update({
        affiliate_id: affiliateId || null,
        tracking_id: trackingId || null,
        status,
        subid_template: subidTemplate || null,
        commission_estimate: commission,
      })
      .eq("id", provider.id)
      .select("*")
      .maybeSingle();
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (data) {
      toast.success("Provider atualizado");
      onSaved(data as AffiliateProviderRow);
    }
  };

  const testLink = () => {
    setTesting(true);
    const result = generateAffiliateUrl(
      { ...provider, affiliate_id: affiliateId, tracking_id: trackingId, status },
      "monitor 24 polegadas",
      { problemCategory: "produtividade", sourcePage: "diagnosis" },
    );
    setTesting(false);
    window.open(result.url, "_blank", "noopener,noreferrer");
    toast.info(result.isPending ? "Link de fallback (sem comissão)" : "Link com tracking real");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-3xl bg-card p-6 shadow-elegant"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5">
          <h2 className="font-display text-2xl font-bold">{provider.name}</h2>
          <p className="text-xs text-muted-foreground">{provider.network} · {provider.slug}</p>
        </div>

        <div className="space-y-4">
          <div>
            <Label>Status</Label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as AffiliateProviderRow["status"])}
              className="mt-1 w-full rounded-md border border-border bg-background p-2 text-sm"
            >
              <option value="active">Ativo</option>
              <option value="pending">Pendente</option>
              <option value="paused">Pausado</option>
              <option value="error">Erro</option>
            </select>
          </div>
          <div>
            <Label>ID de afiliado</Label>
            <Input value={affiliateId} onChange={(e) => setAffiliateId(e.target.value)} placeholder="ex: deskly02-20" />
          </div>
          <div>
            <Label>Tracking ID (opcional)</Label>
            <Input value={trackingId} onChange={(e) => setTrackingId(e.target.value)} placeholder="usado por algumas redes" />
          </div>
          <div>
            <Label>Template de SubID (opcional)</Label>
            <Input value={subidTemplate} onChange={(e) => setSubidTemplate(e.target.value)} placeholder="ex: {diagnosis_id}-{problem_category}" />
            <p className="mt-1 text-[10px] text-muted-foreground">
              Placeholders: {"{"}diagnosis_id{"}"}, {"{"}user_id{"}"}, {"{"}session_id{"}"}, {"{"}problem_category{"}"}, {"{"}product_category{"}"}, {"{"}source_page{"}"}
            </p>
          </div>
          <div>
            <Label>Comissão estimada (0–1)</Label>
            <Input
              type="number"
              step="0.001"
              min="0"
              max="1"
              value={commission}
              onChange={(e) => setCommission(Number(e.target.value))}
            />
            <p className="mt-1 text-[10px] text-muted-foreground">
              {(commission * 100).toFixed(2)}% — usado pra estimar receita
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <Button onClick={save} disabled={saving} className="flex-1 bg-gradient-hero">
            {saving ? "Salvando..." : "Salvar"}
          </Button>
          <Button variant="outline" onClick={testLink} disabled={testing} className="gap-1">
            <ExternalLink className="h-4 w-4" /> Testar
          </Button>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
        </div>
      </div>
    </div>
  );
}
