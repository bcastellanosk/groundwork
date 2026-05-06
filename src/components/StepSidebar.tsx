import { Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import { LogOut, Building2, Check } from "lucide-react";

const STEPS = [
  { n: 1, label: "Site Analysis", to: "/site-analysis" as const },
  { n: 2, label: "Program Builder", to: "/program" as const },
  { n: 3, label: "Construction Costs", to: "/construction-costs" as const },
  { n: 4, label: "Financial Summary", to: "/financial-summary" as const },
  { n: 5, label: "Sensitivity", to: "/sensitivity" as const },
];

export function StepSidebar({ current }: { current: 1 | 2 | 3 | 4 | 5 }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <aside className="w-full lg:w-72 lg:min-h-screen border-b lg:border-b-0 lg:border-r border-border bg-surface/50 p-6 flex lg:flex-col justify-between">
      <div className="flex-1 lg:flex-initial">
        <Link to="/site-analysis" className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Building2 className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-semibold tracking-tight">Groundwork</span>
        </Link>
        <div className="hidden lg:block">
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-4">
            Step {current} of 5
          </p>
          <ol className="space-y-2">
            {STEPS.map(s => {
              const done = s.n < current;
              const active = s.n === current;
              return (
                <li key={s.n}>
                  <Link
                    to={s.to}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                      active ? "bg-primary/15 text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-surface"
                    }`}
                  >
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium border ${
                      active ? "bg-primary border-primary text-primary-foreground"
                      : done ? "bg-success/20 border-success/40 text-success"
                      : "border-border"
                    }`}>
                      {done ? <Check className="w-3 h-3" /> : s.n}
                    </span>
                    {s.label}
                  </Link>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
      <div className="hidden lg:block pt-6 border-t border-border">
        <p className="text-xs text-muted-foreground mb-2 truncate">{user?.email}</p>
        <button
          onClick={() => { signOut(); navigate({ to: "/auth" }); }}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <LogOut className="w-4 h-4" /> Sign out
        </button>
      </div>
      <button
        onClick={() => { signOut(); navigate({ to: "/auth" }); }}
        className="lg:hidden text-sm text-muted-foreground hover:text-foreground"
      >
        <LogOut className="w-5 h-5" />
      </button>
    </aside>
  );
}
