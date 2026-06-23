import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Stethoscope, LogOut, Mail, ShieldCheck } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
  head: () => ({
    meta: [
      { title: "Settings — Prescripto AI" },
      { name: "description", content: "Manage your Prescripto AI account, review your session, and sign out from this device." },
      { property: "og:title", content: "Settings — Prescripto AI" },
      { property: "og:description", content: "Manage your Prescripto AI account and preferences." },
      { property: "og:url", content: "https://prescriptoo-ai.lovable.app/settings" },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "https://prescriptoo-ai.lovable.app/settings" }],
  }),
});

function SettingsPage() {
  const { user, isLoading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user) navigate({ to: "/login" });
  }, [user, isLoading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out");
    navigate({ to: "/" });
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 backdrop-blur-md bg-background/80 border-b border-border/60">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Stethoscope className="w-4.5 h-4.5 text-primary-foreground" strokeWidth={2.5} />
            </div>
            <span className="font-bold tracking-tight">Prescripto<span className="text-primary"> AI</span></span>
          </Link>
          <nav className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link to="/app" className="hover:text-foreground transition">Dashboard</Link>
            <Link to="/insights" className="hover:text-foreground transition">History</Link>
            <Link to="/settings" className="text-foreground font-medium">Settings</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1.5">Account and preferences.</p>

        <section className="mt-8 p-6 rounded-2xl border border-border bg-card">
          <h2 className="font-semibold">Account</h2>
          <div className="mt-4 flex items-center gap-3 text-sm">
            <Mail className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Email</span>
            <span className="ml-auto font-medium">{user.email}</span>
          </div>
          <div className="mt-3 flex items-center gap-3 text-sm">
            <ShieldCheck className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Status</span>
            <span className="ml-auto font-medium text-success">Active</span>
          </div>
        </section>

        <section className="mt-5 p-6 rounded-2xl border border-border bg-card">
          <h2 className="font-semibold">Sign out</h2>
          <p className="text-sm text-muted-foreground mt-1.5">End your current session on this device.</p>
          <button onClick={handleSignOut} className="inline-flex items-center gap-2 mt-4 px-4 py-2.5 rounded-lg border border-border hover:bg-accent/40 transition text-sm font-medium">
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </section>
      </main>
    </div>
  );
}