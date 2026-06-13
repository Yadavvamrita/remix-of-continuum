import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { FileText, Clock, Pill } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { AppShell } from "@/components/app-shell";
import { listPrescriptions } from "@/lib/prescriptions.functions";
import { listSavedMedicines } from "@/lib/medicines.functions";

export const Route = createFileRoute("/insights")({
  component: HistoryPage,
  head: () => ({
    meta: [
      { title: "History — Prescripto AI" },
      { name: "description", content: "Your past prescription analyses and saved items." },
    ],
  }),
});

function HistoryPage() {
  type Rx = { id: string; title: string; created_at: string; analysis: unknown };
  type Med = { id: string; name: string; generic_name: string | null; created_at: string };
  const [rx, setRx] = useState<Rx[]>([]);
  const [meds, setMeds] = useState<Med[]>([]);
  const [loading, setLoading] = useState(true);
  const fetchRx = useServerFn(listPrescriptions);
  const fetchMeds = useServerFn(listSavedMedicines);

  useEffect(() => {
    (async () => {
      try {
        const [a, b] = await Promise.all([fetchRx({ data: undefined }), fetchMeds({ data: undefined })]);
        setRx(a as Rx[]);
        setMeds(b as Med[]);
      } catch { /* ignore */ }
      finally { setLoading(false); }
    })();
  }, [fetchRx, fetchMeds]);

  return (
    <AppShell>
      <h1 className="text-3xl font-bold tracking-tight">History</h1>
      <p className="text-muted-foreground mt-1.5">Your prescription analyses and saved medicines.</p>

      <section className="mt-8">
        <h2 className="text-xs font-bold uppercase tracking-wider text-primary mb-3">Prescriptions</h2>
        {loading ? (
          <div className="text-sm text-muted-foreground">Loading…</div>
        ) : rx.length === 0 ? (
          <EmptyState icon={<Clock className="w-6 h-6 text-primary" />} title="No analyses yet" desc="Upload a prescription to get started." cta={{ to: "/analyze", label: "Analyze a prescription" }} />
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {rx.map((r) => {
              const a = (r.analysis ?? {}) as { patient_summary?: string; medicines?: Array<{ name: string }> };
              return (
                <div key={r.id} className="p-4 rounded-xl border border-border bg-card">
                  <div className="font-medium text-sm flex items-center gap-2"><FileText className="w-4 h-4 text-primary" /> {r.title}</div>
                  <div className="text-xs text-muted-foreground mt-1">{new Date(r.created_at).toLocaleString()}</div>
                  {a.patient_summary && <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{a.patient_summary}</p>}
                  {a.medicines && a.medicines.length > 0 && (
                    <div className="text-xs mt-2 text-foreground">{a.medicines.map((m) => m.name).join(", ")}</div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-xs font-bold uppercase tracking-wider text-primary mb-3">Saved medicines</h2>
        {loading ? null : meds.length === 0 ? (
          <EmptyState icon={<Pill className="w-6 h-6 text-primary" />} title="No saved medicines" desc="Search and save medicines to build your library." cta={{ to: "/medicines", label: "Search medicines" }} />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {meds.map((m) => (
              <div key={m.id} className="p-4 rounded-xl border border-border bg-card">
                <div className="font-medium text-sm flex items-center gap-2"><Pill className="w-4 h-4 text-primary" /> {m.name}</div>
                {m.generic_name && <div className="text-xs text-muted-foreground mt-1">{m.generic_name}</div>}
              </div>
            ))}
          </div>
        )}
      </section>
    </AppShell>
  );
}

function EmptyState({ icon, title, desc, cta }: { icon: React.ReactNode; title: string; desc: string; cta: { to: "/analyze" | "/medicines" | "/doctors"; label: string } }) {
  return (
    <div className="p-10 rounded-2xl border border-dashed border-border bg-card/40 text-center">
      <div className="w-12 h-12 rounded-xl bg-accent/60 flex items-center justify-center mx-auto mb-4">{icon}</div>
      <h3 className="font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1.5 max-w-md mx-auto">{desc}</p>
      <Link to={cta.to} className="inline-flex items-center gap-2 mt-4 bg-primary text-primary-foreground font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition text-sm">
        {cta.label}
      </Link>
    </div>
  );
}