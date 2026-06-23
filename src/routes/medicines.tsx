import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Loader2, Pill, Bookmark, ArrowLeft, AlertTriangle, Tag, Info } from "lucide-react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { AppShell } from "@/components/app-shell";
import { searchMedicine, saveMedicine, type MedicineSummary } from "@/lib/medicines.functions";

export const Route = createFileRoute("/medicines")({
  component: MedicinesPage,
  head: () => ({
    meta: [
      { title: "Search medicines — Prescripto AI" },
      { name: "description", content: "Look up any medicine — uses, dosage, side effects, interactions, and alternatives, backed by OpenFDA and RxNorm." },
      { property: "og:title", content: "Search medicines — Prescripto AI" },
      { property: "og:description", content: "Look up any medicine — uses, dosage, side effects, interactions, and alternatives." },
      { property: "og:url", content: "https://prescriptoo-ai.lovable.app/medicines" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://prescriptoo-ai.lovable.app/medicines" }],
  }),
});

function MedicinesPage() {
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<MedicineSummary | null>(null);
  const search = useServerFn(searchMedicine);
  const save = useServerFn(saveMedicine);

  const onSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim().length < 2) return;
    setBusy(true);
    setResult(null);
    try {
      const out = await search({ data: { query: q } });
      setResult(out);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Search failed");
    } finally {
      setBusy(false);
    }
  };

  const onSave = async () => {
    if (!result) return;
    try {
      await save({ data: { name: result.name, generic_name: result.generic_name, data: result } });
      toast.success("Saved to your library");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    }
  };

  return (
    <AppShell>
      <Link to="/app" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to dashboard
      </Link>
      <h1 className="text-3xl font-bold tracking-tight">Search medicines</h1>
      <p className="text-muted-foreground mt-1.5">Look up any medicine — uses, dosage, side effects, interactions, alternatives.</p>

      <form onSubmit={onSearch} className="mt-6 flex gap-2 max-w-2xl">
        <div className="flex-1 flex items-center gap-2 px-4 py-3 rounded-xl border border-border bg-card">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="e.g. Amoxicillin, Dolo 650, Metformin"
            aria-label="Medicine name"
            className="bg-transparent outline-none flex-1 text-sm"
          />
        </div>
        <button disabled={busy || q.trim().length < 2} className="bg-primary text-primary-foreground font-semibold px-5 rounded-xl hover:opacity-90 transition disabled:opacity-50">
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : "Search"}
        </button>
      </form>

      {result && (
        <div className="mt-8 max-w-3xl rounded-2xl border border-border bg-card p-6 space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent/60 flex items-center justify-center">
                {result.kind === "category" ? <Tag className="w-5 h-5 text-primary" /> : <Pill className="w-5 h-5 text-primary" />}
              </div>
              <div>
                <div className="font-semibold text-lg">{result.name}</div>
                <div className="mt-1 flex items-center gap-2">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${result.kind === "specific" ? "border-primary/40 text-primary bg-primary/10" : result.kind === "category" ? "border-amber-500/40 text-amber-600 bg-amber-500/10" : "border-border text-muted-foreground"}`}>
                    Type: {result.kind === "specific" ? "Specific Medicine" : result.kind === "category" ? (result.category_label || "Drug Class / Medicine Category") : "Unknown"}
                  </span>
                  {result.kind === "specific" && result.generic_name && (
                    <span className="text-xs text-muted-foreground">Generic: {result.generic_name}</span>
                  )}
                </div>
              </div>
            </div>
            {result.kind !== "unknown" && (
              <button onClick={onSave} className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-border hover:bg-accent/40 transition">
                <Bookmark className="w-3.5 h-3.5" /> Save
              </button>
            )}
          </div>

          {result.kind === "specific" && (
            <>
              <Field label="Uses">{result.uses}</Field>
              <Field label="Dosage">{result.dosage}</Field>
              <ListField label="Common side effects" items={result.side_effects} />
              <ListField label="Warnings" items={result.warnings} />
              <ListField label="Interactions" items={result.interactions} />
              <ListField label="Alternatives" items={result.alternatives} />
            </>
          )}

          {result.kind === "category" && (
            <>
              <Field label="Description">{result.description}</Field>
              <Field label="General purpose">{result.general_purpose}</Field>
              <ListField label="Examples in this category" items={result.examples} />
              <ListField label="General precautions" items={result.general_precautions} />
              {result.variability_note && (
                <p className="text-sm rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300 p-3 flex items-start gap-2">
                  <Info className="w-4 h-4 mt-0.5 shrink-0" /> {result.variability_note}
                </p>
              )}
            </>
          )}

          {result.kind === "unknown" && (
            <p className="text-sm text-muted-foreground">Information unavailable. Please consult a healthcare professional or official prescribing information.</p>
          )}

          <p className="text-xs text-muted-foreground italic flex items-start gap-1.5 pt-2 border-t border-border">
            <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" /> {result.disclaimer}
          </p>
        </div>
      )}
    </AppShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs font-bold uppercase tracking-wider text-primary mb-1">{label}</div>
      <div className="text-sm">{children}</div>
    </div>
  );
}

function ListField({ label, items }: { label: string; items?: string[] }) {
  if (!items?.length) return null;
  return (
    <div>
      <div className="text-xs font-bold uppercase tracking-wider text-primary mb-2">{label}</div>
      <ul className="text-sm space-y-1">
        {items.map((it, i) => <li key={i} className="flex gap-2"><span className="text-primary">•</span> {it}</li>)}
      </ul>
    </div>
  );
}