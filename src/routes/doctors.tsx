import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Loader2, MapPin, Phone, Bookmark, ArrowLeft, ExternalLink, Star, Globe } from "lucide-react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { AppShell } from "@/components/app-shell";
import { searchDoctors, saveDoctor, type DoctorHit } from "@/lib/doctors.functions";

export const Route = createFileRoute("/doctors")({
  component: DoctorsPage,
  head: () => ({
    meta: [
      { title: "Find doctors — Prescripto AI" },
      { name: "description", content: "Search verified clinics, hospitals, and specialists near any city with maps, ratings, and contact info." },
      { property: "og:title", content: "Find doctors — Prescripto AI" },
      { property: "og:description", content: "Search verified clinics, hospitals, and specialists near any city with maps, ratings, and contact info." },
      { property: "og:url", content: "https://prescriptoo-ai.lovable.app/doctors" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://prescriptoo-ai.lovable.app/doctors" }],
  }),
});

function DoctorsPage() {
  const [location, setLocation] = useState("");
  const [spec, setSpec] = useState("");
  const [busy, setBusy] = useState(false);
  const [results, setResults] = useState<DoctorHit[]>([]);
  const [center, setCenter] = useState<{ lat: number; lng: number; name: string } | null>(null);
  const search = useServerFn(searchDoctors);
  const save = useServerFn(saveDoctor);

  const onSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (location.trim().length < 2) return;
    setBusy(true);
    try {
      const out = await search({ data: { location, specialization: spec } });
      setResults(out.results);
      setCenter(out.center);
      if (!out.results.length) toast.info("No doctors found within 5 km — try a broader location.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Search failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppShell>
      <Link to="/app" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to dashboard
      </Link>
      <h1 className="text-3xl font-bold tracking-tight">Find doctors</h1>
      <p className="text-muted-foreground mt-1.5">Search clinics, hospitals, and specialists near any location.</p>

      <form onSubmit={onSearch} className="mt-6 grid sm:grid-cols-[1fr_1fr_auto] gap-2 max-w-3xl">
        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="City or area (e.g. Delhi, Bengaluru)"
          aria-label="City or area"
          className="px-4 py-3 rounded-xl border border-border bg-card outline-none text-sm focus:border-primary"
        />
        <input
          value={spec}
          onChange={(e) => setSpec(e.target.value)}
          placeholder="Specialization (optional, e.g. cardiology)"
          aria-label="Specialization"
          className="px-4 py-3 rounded-xl border border-border bg-card outline-none text-sm focus:border-primary"
        />
        <button disabled={busy || location.trim().length < 2} className="bg-primary text-primary-foreground font-semibold px-5 rounded-xl hover:opacity-90 transition disabled:opacity-50">
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <span className="inline-flex items-center gap-1.5"><Search className="w-4 h-4" /> Search</span>}
        </button>
      </form>

      {center && (
        <p className="text-xs text-muted-foreground mt-3">Showing top matches near <b>{center.name}</b></p>
      )}

      <div className="mt-6 grid md:grid-cols-2 gap-4">
        {results.map((d) => (
          <div key={d.place_id} className="p-5 rounded-2xl border border-border bg-card">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-semibold flex items-center gap-2"><MapPin className="w-4 h-4 text-primary" /> {d.name}</div>
                {d.specialization && <div className="text-xs text-muted-foreground mt-1 capitalize">{d.specialization.replace(/_/g, " ")}</div>}
                {d.address && <div className="text-xs text-muted-foreground mt-1">{d.address}</div>}
                {typeof d.rating === "number" && (
                  <div className="text-xs text-muted-foreground mt-1 inline-flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span className="font-medium text-foreground">{d.rating.toFixed(1)}</span>
                    {d.user_ratings_total ? <span>({d.user_ratings_total})</span> : null}
                  </div>
                )}
                {d.phone && <a href={`tel:${d.phone}`} className="text-xs text-primary mt-1 inline-flex items-center gap-1"><Phone className="w-3 h-3" /> {d.phone}</a>}
              </div>
              <button
                onClick={async () => {
                  try { await save({ data: d }); toast.success("Saved"); }
                  catch (e) { toast.error(e instanceof Error ? e.message : "Save failed"); }
                }}
                className="p-2 rounded-lg hover:bg-accent/40 transition"
                aria-label="Save"
              >
                <Bookmark className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <div className="flex items-center gap-4 mt-3">
              <a
                target="_blank"
                rel="noreferrer"
                href={d.google_maps_uri || `https://www.google.com/maps/search/?api=1&query=${d.lat},${d.lng}&query_place_id=${d.place_id}`}
                className="text-xs text-primary inline-flex items-center gap-1"
              >
                View on Google Maps <ExternalLink className="w-3 h-3" />
              </a>
              {d.website && (
                <a target="_blank" rel="noreferrer" href={d.website} className="text-xs text-primary inline-flex items-center gap-1">
                  <Globe className="w-3 h-3" /> Website
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}