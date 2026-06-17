import { Link, useNavigate, useLocation } from "@tanstack/react-router";
import { Stethoscope, LogOut, UserCircle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, type ReactNode } from "react";

export function AppShell({ children }: { children: ReactNode }) {
  const { user, isLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading && !user) navigate({ to: "/login" });
  }, [user, isLoading, navigate]);

  if (isLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">Loading…</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 backdrop-blur-md bg-background/80 border-b border-border/60">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Stethoscope className="w-4 h-4 text-primary-foreground" strokeWidth={2.5} />
            </div>
            <span className="font-bold tracking-tight">Prescripto<span className="text-primary"> AI</span></span>
          </Link>
          <nav className="hidden sm:flex items-center gap-6 text-sm text-muted-foreground">
            <Link to="/app" className="hover:text-foreground transition" activeProps={{ className: "text-foreground font-medium" }}>Dashboard</Link>
            <Link to="/analyze" className="hover:text-foreground transition" activeProps={{ className: "text-foreground font-medium" }}>Analyze</Link>
            <Link to="/medicines" className="hover:text-foreground transition" activeProps={{ className: "text-foreground font-medium" }}>Medicines</Link>
            <Link to="/doctors" className="hover:text-foreground transition" activeProps={{ className: "text-foreground font-medium" }}>Doctors</Link>
            <Link to="/insights" className="hover:text-foreground transition" activeProps={{ className: "text-foreground font-medium" }}>History</Link>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/settings" className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-accent/40 transition text-sm">
              <UserCircle className="w-5 h-5 text-muted-foreground" />
              <span className="hidden sm:inline text-muted-foreground truncate max-w-[140px]">{user.email}</span>
            </Link>
            <button onClick={async () => { await signOut(); navigate({ to: "/" }); }} className="p-2 rounded-lg hover:bg-accent/40 transition" aria-label="Sign out">
              <LogOut className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>
      </header>
      <main key={location.pathname} className="max-w-6xl mx-auto px-6 py-10 animate-page-enter">{children}</main>
    </div>
  );
}