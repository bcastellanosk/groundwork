import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, FormEvent } from "react";
import { useAuth } from "@/lib/auth-context";
import { Building2 } from "lucide-react";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
});

function AuthPage() {
  const { user, ready, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"signup" | "login">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (ready && user) navigate({ to: "/site-analysis" });
  }, [ready, user, navigate]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) return setError("Email and password are required");
    if (tab === "signup" && password !== confirm) return setError("Passwords do not match");
    if (password.length < 6) return setError("Password must be at least 6 characters");
    setLoading(true);
    try {
      if (tab === "signup") await signUp(email, password);
      else await signIn(email, password);
      navigate({ to: "/site-analysis" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full h-12 px-4 rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all";

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <Building2 className="w-5 h-5 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Groundwork</h1>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-6 md:p-8">
          <div className="grid grid-cols-2 gap-1 p-1 bg-background rounded-lg mb-6">
            {(["signup", "login"] as const).map(t => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(""); }}
                className={`h-10 rounded-md text-sm font-medium transition-colors ${
                  tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t === "signup" ? "Sign Up" : "Log In"}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} className={inputCls} placeholder="you@example.com" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <input type="password" autoComplete={tab === "signup" ? "new-password" : "current-password"} value={password} onChange={e => setPassword(e.target.value)} className={inputCls} placeholder="••••••••" />
            </div>
            {tab === "signup" && (
              <div>
                <label className="block text-sm font-medium mb-2">Confirm password</label>
                <input type="password" autoComplete="new-password" value={confirm} onChange={e => setConfirm(e.target.value)} className={inputCls} placeholder="••••••••" />
              </div>
            )}
            {tab === "login" && (
              <div className="text-right">
                <button type="button" className="text-sm text-muted-foreground hover:text-foreground">Forgot password?</button>
              </div>
            )}
            {error && (
              <div className="text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-lg px-3 py-2">{error}</div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {loading ? "Please wait..." : tab === "signup" ? "Create Account" : "Sign In"}
            </button>
          </form>
        </div>
        <p className="text-center text-xs text-muted-foreground mt-6">
          Real estate development feasibility, in minutes.
        </p>
      </div>
    </div>
  );
}
