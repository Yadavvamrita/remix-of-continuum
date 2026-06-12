import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Stethoscope, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

async function getSupabase() {
  const { supabase } = await import("@/integrations/supabase/client");
  return supabase;
}

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({
    meta: [
      { title: "Sign in — Prescripto AI" },
      { name: "description", content: "Sign in or create your Prescripto AI account." },
    ],
  }),
});

function LoginPage() {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const { lovable } = await import("@/integrations/lovable/index");
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: `${window.location.origin}/app`,
      });
      if (result.error) {
        toast.error(result.error instanceof Error ? result.error.message : "Google sign-in failed");
      } else if (!result.redirected) {
        navigate({ to: "/app" });
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Google sign-in failed");
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      toast.error("Please enter a valid email");
      return;
    }
    if (isSignUp) {
      if (!name.trim()) { toast.error("Please enter your name"); return; }
      if (password.length < 8) { toast.error("Password must be at least 8 characters"); return; }
      if (password !== confirm) { toast.error("Passwords do not match"); return; }
    }
    setLoading(true);
    try {
      const supabase = await getSupabase();
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email: trimmedEmail,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/app`,
            data: { full_name: name.trim() },
          },
        });
        if (error) {
          if (error.message.toLowerCase().includes("already")) {
            toast.error("An account with this email already exists.");
          } else {
            throw error;
          }
        } else {
          toast.success("Check your email to verify your account");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: trimmedEmail, password });
        if (error) throw error;
        navigate({ to: "/app" });
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-5 bg-[radial-gradient(ellipse_at_top,_var(--color-accent),_var(--color-background)_60%)]">
      <div className="max-w-sm w-full animate-fade-up-blur">
        <Link to="/" className="flex items-center justify-center gap-2 mb-8 hover:opacity-80 transition">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
            <Stethoscope className="w-5 h-5 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <span className="text-xl font-bold tracking-tight">Prescripto<span className="text-primary"> AI</span></span>
        </Link>

        <div className="bg-card rounded-2xl shadow-xl shadow-primary/[0.08] border border-border/60 p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-semibold tracking-tight">{isSignUp ? "Create your account" : "Welcome back"}</h1>
            <p className="text-sm text-muted-foreground mt-1.5">
              {isSignUp ? "Start understanding your prescriptions" : "Sign in to access your dashboard"}
            </p>
          </div>

          <button
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 rounded-xl border border-input bg-background py-3 text-sm font-medium hover:bg-accent/40 transition active:scale-[0.98] disabled:opacity-40"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            {googleLoading ? "Please wait…" : "Continue with Google"}
          </button>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {isSignUp && (
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full name"
                className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                maxLength={80}
              />
            )}
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full rounded-xl border border-input bg-background pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                required maxLength={254}
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full rounded-xl border border-input bg-background pl-11 pr-11 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                required minLength={isSignUp ? 8 : 6} maxLength={128}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {isSignUp && (
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Confirm password"
                  className="w-full rounded-xl border border-input bg-background pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  required minLength={8} maxLength={128}
                />
              </div>
            )}

            <button type="submit" disabled={loading} className="w-full rounded-xl bg-primary text-primary-foreground py-3.5 text-sm font-semibold hover:opacity-90 transition active:scale-[0.98] disabled:opacity-40 shadow-lg shadow-primary/20">
              {loading ? "Please wait…" : isSignUp ? "Create account" : "Sign in"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
          <button onClick={() => setIsSignUp(!isSignUp)} className="text-primary font-medium hover:underline">
            {isSignUp ? "Sign in" : "Sign up"}
          </button>
        </p>
      </div>
    </div>
  );
}