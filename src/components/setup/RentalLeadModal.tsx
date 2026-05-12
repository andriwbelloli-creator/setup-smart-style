import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { notifyPartner, type LeadType } from "@/lib/rental";
import { toast } from "sonner";
import { Loader2, User, Building2, Check, Phone, Mail } from "lucide-react";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  setupId?: string;
  setupTitle?: string;
  /** Preço total do setup pra inferir orçamento. */
  totalPriceBrl?: number;
};

const DURATION_OPTIONS = [
  { value: 6, label: "6 meses" },
  { value: 12, label: "12 meses (recomendado)" },
  { value: 24, label: "24 meses (melhor preço)" },
];

const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
const isPhone = (s: string) => s.replace(/\D/g, "").length >= 10;

export function RentalLeadModal({ open, onOpenChange, setupId, setupTitle, totalPriceBrl }: Props) {
  const { user } = useAuth();
  const [tab, setTab] = useState<LeadType>("B2C");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  // Shared
  const [duration, setDuration] = useState(12);
  // B2C
  const [name, setName] = useState("");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState("");
  // B2B
  const [company, setCompany] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [employees, setEmployees] = useState<number>(5);

  const reset = () => {
    setTab("B2C");
    setSubmitting(false);
    setDone(false);
    setDuration(12);
    setName("");
    setEmail(user?.email ?? "");
    setPhone("");
    setCompany("");
    setCnpj("");
    setEmployees(5);
  };

  const handleClose = (v: boolean) => {
    if (!v && done) reset();
    onOpenChange(v);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !isEmail(email) || !isPhone(phone)) {
      toast.error("Preencha nome, email válido e WhatsApp.");
      return;
    }
    if (tab === "B2B" && !company) {
      toast.error("Informe o nome da empresa.");
      return;
    }
    setSubmitting(true);

    const payload = {
      setup_id: setupId ?? null,
      user_id: user?.id ?? null,
      lead_type: tab,
      customer_name: name,
      customer_email: email.toLowerCase().trim(),
      customer_phone: phone,
      company_name: tab === "B2B" ? company : null,
      cnpj: tab === "B2B" ? cnpj || null : null,
      employee_count: tab === "B2B" ? employees : null,
      rental_duration_months: duration,
      estimated_budget: totalPriceBrl ?? null,
      status: "pending",
    };

    const { data, error } = await (supabase as any)
      .from("rental_leads")
      .insert(payload)
      .select("id")
      .single();

    if (error) {
      console.warn("rental_leads insert:", error.message);
      toast.error("Não conseguimos enviar agora. Tenta de novo em instantes.");
      setSubmitting(false);
      return;
    }

    // Roteia pro parceiro (fire-and-forget — UX não bloqueia)
    notifyPartner(data.id).catch((err) => console.warn("notifyPartner:", err));

    setSubmitting(false);
    setDone(true);
    toast.success("Pedido enviado! Em breve um parceiro entra em contato.");
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        {done ? (
          <div className="py-6 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Check className="h-6 w-6" />
            </div>
            <DialogHeader className="mt-5">
              <DialogTitle className="text-center font-display text-2xl">Pedido enviado!</DialogTitle>
              <DialogDescription className="text-center">
                Um parceiro de locação vai te contactar em até 24h úteis pelo
                {" "}<strong>{phone || email}</strong>.
              </DialogDescription>
            </DialogHeader>
            <Button onClick={() => handleClose(false)} className="mt-6 bg-gradient-hero">
              Fechar
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="font-display text-xl">Solicitar cotação de aluguel</DialogTitle>
              <DialogDescription>
                {setupTitle ? <>Setup de referência: <strong>{setupTitle}</strong>. </> : null}
                Um parceiro Deskly vai te contactar com a proposta.
              </DialogDescription>
            </DialogHeader>

            <Tabs value={tab} onValueChange={(v) => setTab(v as LeadType)} className="mt-2">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="B2C" className="gap-2">
                  <User className="h-4 w-4" /> Para mim
                </TabsTrigger>
                <TabsTrigger value="B2B" className="gap-2">
                  <Building2 className="h-4 w-4" /> Para minha empresa
                </TabsTrigger>
              </TabsList>

              {/* Form (compartilhado, com seções B2B condicionais) */}
              <form onSubmit={submit} className="mt-5 space-y-4">
                <TabsContent value="B2C" className="m-0 space-y-4">
                  <Field label="Nome completo" required>
                    <Input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Como você se chama?" />
                  </Field>
                </TabsContent>

                <TabsContent value="B2B" className="m-0 space-y-4">
                  <Field label="Nome do responsável" required>
                    <Input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Quem é o ponto focal?" />
                  </Field>
                  <Field label="Empresa" required>
                    <Input value={company} onChange={(e) => setCompany(e.target.value)} required placeholder="Razão social ou nome fantasia" />
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="CNPJ (opcional)">
                      <Input value={cnpj} onChange={(e) => setCnpj(e.target.value)} placeholder="00.000.000/0000-00" />
                    </Field>
                    <Field label="Setups (quantidade)" required>
                      <Input
                        type="number"
                        min={1}
                        max={500}
                        value={employees}
                        onChange={(e) => setEmployees(Math.max(1, Number(e.target.value) || 1))}
                        required
                      />
                    </Field>
                  </div>
                </TabsContent>

                {/* Compartilhado */}
                <Field label={tab === "B2B" ? "Email corporativo" : "Email"} required>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="voce@email.com"
                    inputMode="email"
                    autoComplete="email"
                  />
                </Field>
                <Field label="WhatsApp" required>
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    placeholder="(11) 99999-9999"
                    inputMode="tel"
                    autoComplete="tel"
                  />
                </Field>
                <Field label="Prazo de locação" required>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  >
                    {DURATION_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </Field>

                <p className="text-[10px] leading-relaxed text-muted-foreground">
                  Ao enviar, você concorda em ser contactado por parceiros de
                  locação do HomeOfficeLife. Sem spam — só sobre essa cotação.
                  Veja a{" "}
                  <a href="/privacidade" className="underline hover:text-foreground">Política de Privacidade</a>.
                </p>

                <Button type="submit" disabled={submitting} className="w-full gap-2 bg-gradient-hero shadow-elegant">
                  {submitting ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Enviando...</>
                  ) : (
                    <>
                      {tab === "B2B" ? <Mail className="h-4 w-4" /> : <Phone className="h-4 w-4" />}
                      Enviar pedido de cotação
                    </>
                  )}
                </Button>
              </form>
            </Tabs>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold">
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      {children}
    </div>
  );
}
