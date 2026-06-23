import { createFileRoute, Link } from "@tanstack/react-router";
import { ScanLine, Search, MapPin, FileText, Pill, ArrowRight } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Reveal } from "@/components/reveal";

export const Route = createFileRoute("/app")({
  component: DashboardPage,
  head: () => ({
    meta: [
      { title: "Dashboard — Prescripto AI" },
      { name: "description", content: "Analyze prescriptions, search medicines, and find doctors." },
      { property: "og:title", content: "Dashboard — Prescripto AI" },
      { property: "og:description", content: "Analyze prescriptions, search medicines, and find doctors." },
      { property: "og:url", content: "https://prescriptoo-ai.lovable.app/app" },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "https://prescriptoo-ai.lovable.app/app" }],
  }),
});

function DashboardPage() {
  const tiles = [
    { icon: ScanLine, title: "Analyze prescription", desc: "Upload a photo — AI extracts and explains each medicine.", to: "/analyze" as const },
    { icon: Search, title: "Search medicines", desc: "Lookup any medicine: uses, dosage, interactions.", to: "/medicines" as const },
    { icon: MapPin, title: "Find doctors", desc: "Search clinics & specialists by location.", to: "/doctors" as const },
    { icon: FileText, title: "History", desc: "Past analyses, saved medicines & doctors.", to: "/insights" as const },
  ];

  return (
    <AppShell>
      <div className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
          <p className="text-muted-foreground mt-1.5">What would you like to do today?</p>
      </div>

      <h2 className="sr-only">Quick actions</h2>
      <div className="grid sm:grid-cols-2 gap-5">
          {tiles.map((t, i) => (
            <Reveal key={t.title} delay={i * 90}>
            <Link to={t.to} className="group block p-6 rounded-2xl border border-border bg-card hover:shadow-lg hover:-translate-y-0.5 transition relative overflow-hidden">
              <div className="w-11 h-11 rounded-xl bg-accent/60 flex items-center justify-center">
                <t.icon className="w-5 h-5 text-primary" strokeWidth={2.25} />
              </div>
              <h3 className="font-semibold text-lg mt-4">{t.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{t.desc}</p>
              <div className="flex items-center gap-1.5 text-primary text-sm font-medium mt-4 opacity-0 group-hover:opacity-100 transition">
                Open <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>
            </Reveal>
          ))}
        </div>

        <Reveal delay={200} className="mt-12 p-6 rounded-2xl border border-border bg-gradient-to-br from-accent/40 to-card block">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Pill className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Tip: clearer photos = better OCR</h3>
              <p className="text-sm text-muted-foreground mt-1.5 max-w-2xl">
                Place the prescription on a flat surface in good light and capture it straight-on. The AI handles messy handwriting much better with a sharp, well-lit image.
              </p>
            </div>
          </div>
        </Reveal>
    </AppShell>
  );
}