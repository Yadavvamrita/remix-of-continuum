import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Stethoscope, ScanLine, Search, MapPin, FileText, Pill, UserCircle, LogOut, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/app")({
  component: DashboardPage,
  head: () => ({
    meta: [
      { title: "Dashboard — Prescripto AI" },
      { name: "description", content: "Analyze prescriptions, search medicines, and find doctors." },
    ],
  }),
});

function DashboardPage() {
  const { user, isLoading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user) navigate({ to: "/login" });
  }, [user, isLoading, navigate]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-sm text-muted-foreground">Loading…</div>
      </div>
    );
  }

  const tiles = [
    { icon: ScanLine, title: "Analyze prescription", desc: "Upload a photo or PDF — AI extracts and explains.", to: "/app", soon: "Phase 2" },
    { icon: Search, title: "Search medicines", desc: "Lookup any medicine: uses, dosage, interactions.", to: "/app", soon: "Phase 3" },
    { icon: MapPin, title: "Find doctors", desc: "Search by name, city, or specialization.", to: "/app", soon: "Phase 4" },
    { icon: FileText, title: "History", desc: "Past analyses, saved medicines & doctors.", to: "/insights", soon: null },
  ];

  return (
    <div className="min-h-screen bg-background">
      <DashHeader email={user.email ?? ""} onSignOut={() => { signOut(); navigate({ to: "/" }); }} />
      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
          <p className="text-muted-foreground mt-1.5">What would you like to do today?</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          {tiles.map((t) => (
            <Link key={t.title} to={t.to} className="group p-6 rounded-2xl border border-border bg-card hover:shadow-lg hover:-translate-y-0.5 transition relative overflow-hidden">
              <div className="w-11 h-11 rounded-xl bg-accent/60 flex items-center justify-center">
                <t.icon className="w-5 h-5 text-primary" strokeWidth={2.25} />
              </div>
              <h3 className="font-semibold text-lg mt-4">{t.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{t.desc}</p>
              <div className="flex items-center gap-1.5 text-primary text-sm font-medium mt-4 opacity-0 group-hover:opacity-100 transition">
                Open <ArrowRight className="w-3.5 h-3.5" />
              </div>
              {t.soon && (
                <span className="absolute top-4 right-4 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-secondary text-muted-foreground">
                  {t.soon}
                </span>
              )}
            </Link>
          ))}
        </div>

        <div className="mt-12 p-6 rounded-2xl border border-border bg-gradient-to-br from-accent/40 to-card">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Pill className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Prescripto AI is rolling out in phases</h3>
              <p className="text-sm text-muted-foreground mt-1.5 max-w-2xl">
                You're on the foundation release — auth, dashboard, and the backend schema are live. Prescription analysis, medicine search, and the doctor finder are coming next.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function DashHeader({ email, onSignOut }: { email: string; onSignOut: () => void }) {
  return (
    <header className="sticky top-0 z-30 backdrop-blur-md bg-background/80 border-b border-border/60">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Stethoscope className="w-4.5 h-4.5 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <span className="font-bold tracking-tight">Prescripto<span className="text-primary"> AI</span></span>
        </Link>
        <nav className="hidden sm:flex items-center gap-6 text-sm text-muted-foreground">
          <Link to="/app" className="hover:text-foreground transition">Dashboard</Link>
          <Link to="/insights" className="hover:text-foreground transition">History</Link>
          <Link to="/settings" className="hover:text-foreground transition">Settings</Link>
        </nav>
        <div className="flex items-center gap-2">
          <Link to="/settings" className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-accent/40 transition text-sm">
            <UserCircle className="w-5 h-5 text-muted-foreground" />
            <span className="hidden sm:inline text-muted-foreground truncate max-w-[160px]">{email}</span>
          </Link>
          <button onClick={onSignOut} className="p-2 rounded-lg hover:bg-accent/40 transition" aria-label="Sign out">
            <LogOut className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>
    </header>
  );
}