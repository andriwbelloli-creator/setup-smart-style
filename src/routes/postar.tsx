import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/CTA";
import { Button } from "@/components/ui/button";
import { Upload, Check, Image as ImageIcon } from "lucide-react";
import { STYLES, ROLES } from "@/data/setups";

export const Route = createFileRoute("/postar")({
  head: () => ({
    meta: [
      { title: "Postar meu setup · Deskly" },
      { name: "description", content: "Compartilhe seu home office com a comunidade Deskly e receba feedback de ergonomia, iluminação e estética." },
    ],
  }),
  component: Postar,
});

function Postar() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [city, setCity] = useState("");
  const [role, setRole] = useState<string>(ROLES[0]);
  const [picked, setPicked] = useState<string[]>([]);
  const [budget, setBudget] = useState<number>(3000);
  const [done, setDone] = useState(false);

  const handleFile = (f: File | undefined) => {
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const togglePick = (s: string) => {
    setPicked((prev) => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setDone(true);
    try {
      const queue = JSON.parse(localStorage.getItem("deskly:posts") || "[]");
      queue.push({ title, city, role, styles: picked, budget, ts: Date.now() });
      localStorage.setItem("deskly:posts", JSON.stringify(queue));
    } catch {}
  };

  if (done) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-24 md:px-6">
          <div className="mx-auto max-w-xl rounded-3xl border border-border bg-card p-12 text-center shadow-elegant">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Check className="h-7 w-7" />
            </div>
            <h1 className="mt-6 font-display text-3xl font-bold">Setup enviado!</h1>
            <p className="mt-3 text-muted-foreground">
              Sua submissão entrou na fila. A IA já vai gerar uma nota e em breve seu setup aparece na galeria.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button asChild className="bg-gradient-hero"><Link to="/galeria">Ver galeria</Link></Button>
              <Button asChild variant="outline"><Link to="/diagnostico">Rodar diagnóstico IA</Link></Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
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
            Mostra seu canto pra comunidade BR e ganhe nota da IA + feedback dos pares.
          </p>
        </div>

        <form onSubmit={submit} className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
            <label className="block">
              <span className="text-sm font-semibold">Foto do setup</span>
              <div className="mt-3 flex aspect-[4/3] cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-border bg-background transition-smooth hover:border-primary">
                {preview ? (
                  <img src={preview} alt="Preview" className="h-full w-full object-cover" />
                ) : (
                  <div className="text-center text-muted-foreground">
                    <ImageIcon className="mx-auto h-10 w-10" />
                    <div className="mt-2 text-sm">Clique para escolher uma foto</div>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFile(e.target.files?.[0])}
                />
              </div>
            </label>
            {file && (
              <p className="mt-3 text-xs text-muted-foreground">{file.name} · {(file.size / 1024).toFixed(0)} KB</p>
            )}
          </div>

          <div className="space-y-5">
            <Field label="Título do setup">
              <input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Cantinho dev em apê 40m²"
                className="h-12 w-full rounded-2xl border border-border bg-card px-4 text-sm focus:border-primary focus:outline-none" />
            </Field>
            <Field label="Cidade / UF">
              <input required value={city} onChange={(e) => setCity(e.target.value)} placeholder="Ex: São Paulo, SP"
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
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full accent-primary" />
            </Field>
            <Button type="submit" disabled={!file || !title || !city || picked.length === 0}
              className="h-12 w-full gap-2 bg-gradient-hero text-base shadow-elegant disabled:opacity-50">
              <Upload className="h-4 w-4" /> Publicar setup
            </Button>
            <p className="text-xs text-muted-foreground">
              Ao postar, você concorda com nossos termos. Sua foto vai pra moderação antes de aparecer.
            </p>
          </div>
        </form>
      </main>
      <Footer />
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
