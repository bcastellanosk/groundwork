import { ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import { useEffect } from "react";
import { StepSidebar } from "./StepSidebar";

export function StepLayout({ step, children }: { step: 1 | 2 | 3 | 4 | 5; children: ReactNode }) {
  const { user, ready } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (ready && !user) navigate({ to: "/auth" });
  }, [ready, user, navigate]);
  if (!ready || !user) return null;
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background">
      <StepSidebar current={step} />
      <main className="flex-1 p-6 md:p-10 max-w-5xl w-full mx-auto">{children}</main>
    </div>
  );
}

export function NavButtons({ onBack, onNext, nextLabel = "Next", loading }: {
  onBack?: () => void; onNext?: () => void; nextLabel?: string; loading?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 pt-8 mt-8 border-t border-border">
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          className="h-12 px-6 rounded-lg border border-border text-foreground hover:bg-surface transition-colors"
        >Back</button>
      ) : <span />}
      {onNext && (
        <button
          type="button"
          onClick={onNext}
          disabled={loading}
          className="h-12 px-8 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >{loading ? "..." : nextLabel}</button>
      )}
    </div>
  );
}
