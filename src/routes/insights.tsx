import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Stethoscope, FileText, Clock } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

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
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user) navigate({ to: "/login" });
  }, [user, isLoading, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 backdrop-blur-md bg-background/80 border-b border-border/60">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Stethoscope className="w-4.5 h-4.5 text-primary-foreground" strokeWidth={2.5} />
            </div>
            <span className="font-bold tracking-tight">Prescripto<span className="text-primary"> AI</span></span>
          </Link>
          <nav className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link to="/app" className="hover:text-foreground transition">Dashboard</Link>
            <Link to="/insights" className="text-foreground font-medium">History</Link>
            <Link to="/settings" className="hover:text-foreground transition">Settings</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold tracking-tight">History</h1>
        <p className="text-muted-foreground mt-1.5">Your prescription analyses and saved items.</p>

        <div className="mt-10 p-12 rounded-2xl border border-dashed border-border bg-card/40 text-center">
          <div className="w-12 h-12 rounded-xl bg-accent/60 flex items-center justify-center mx-auto mb-4">
            <Clock className="w-6 h-6 text-primary" />
          </div>
          <h3 className="font-semibold">No analyses yet</h3>
          <p className="text-sm text-muted-foreground mt-1.5 max-w-md mx-auto">
            Prescription analysis is rolling out in the next phase. Once available, every analysis you run will appear here.
          </p>
          <Link to="/app" className="inline-flex items-center gap-2 mt-6 bg-primary text-primary-foreground font-semibold px-4 py-2.5 rounded-lg hover:opacity-90 transition text-sm">
            <FileText className="w-4 h-4" /> Go to dashboard
          </Link>
        </div>
      </main>
    </div>
  );
}