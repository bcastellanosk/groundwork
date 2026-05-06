import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { StepLayout, NavButtons } from "@/components/StepLayout";
import { useProject } from "@/lib/project-context";
import { computeCosts, computeFinancials, fmtPct } from "@/lib/calculations";
import { generateProjectPDF } from "@/lib/pdf-export";

export const Route = createFileRoute("/sensitivity")({ component: SensitivityPage });

const COST_VARIANCES = [-20, -10, 0, 10, 20, 30];
const CAP_RATES = [4.5, 5.0, 5.5, 6.0, 6.5, 7.0, 7.5];

function cellTone(p: number) {
  if (p >= 12) return "bg-success/80";
  if (p >= 5) return "bg-warning/70";
  return "bg-destructive/70";
}

function SensitivityPage() {
  const { data, reset } = useProject();
  const navigate = useNavigate();
  const baseCosts = computeCosts(data);
  const baseF = computeFinancials(data, baseCosts.tdc);

  // For break-even analysis
  const variableCosts = baseCosts.tdc - baseCosts.landCost;
  // Profit = stabilizedValue - tdc. Solve cost overrun where profit = 0.
  // newTdc = baseCosts.landCost + variableCosts*(1+x). profit=0 => x = (stabilized - landCost - variableCosts)/variableCosts
  const breakEvenOverrun = variableCosts > 0
    ? ((baseF.stabilizedValue - baseCosts.landCost - variableCosts) / variableCosts) * 100
    : 0;
  // Break-even cap rate where stabilized = tdc -> cap = noi/tdc
  const breakEvenCap = baseCosts.tdc > 0 ? (baseF.noi / baseCosts.tdc) * 100 : 0;

  const profitAt = (variancePct: number, cap: number) => {
    const newTdc = baseCosts.landCost + variableCosts * (1 + variancePct / 100);
    const stab = cap > 0 ? baseF.noi / (cap / 100) : 0;
    return newTdc > 0 ? ((stab - newTdc) / newTdc) * 100 : 0;
  };

  const exportPDF = () => generateProjectPDF(data);
  const saveProject = () => {
    try {
      localStorage.setItem("groundwork:saved:" + Date.now(), JSON.stringify(data));
      alert("Project saved to your browser.");
    } catch { alert("Could not save project."); }
  };
  const newProject = () => {
    if (confirm("Start a new project? Current data will be cleared.")) {
      reset();
      navigate({ to: "/site-analysis" });
    }
  };

  return (
    <StepLayout step={5}>
      <div className="mb-8">
        <p className="text-sm text-muted-foreground mb-1">Step 5 of 5</p>
        <h1 className="text-3xl font-semibold tracking-tight">Sensitivity Analysis</h1>
        <p className="text-muted-foreground mt-2">Profit on Cost at different scenarios.</p>
      </div>

      <div className="bg-surface border border-border rounded-2xl p-4 md:p-6 mb-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="text-left text-xs uppercase tracking-wider text-muted-foreground p-2">Cap Rate \ Cost</th>
              {COST_VARIANCES.map(v => (
                <th key={v} className="text-xs uppercase tracking-wider text-muted-foreground p-2 text-center">
                  {v > 0 ? `+${v}%` : `${v}%`}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {CAP_RATES.map(cap => (
              <tr key={cap}>
                <td className="p-2 text-xs uppercase tracking-wider text-muted-foreground">{cap.toFixed(1)}%</td>
                {COST_VARIANCES.map(v => {
                  const p = profitAt(v, cap);
                  return (
                    <td key={v} className="p-1">
                      <div className={`${cellTone(p)} text-white text-center py-3 rounded-md font-medium tabular-nums`}>
                        {p.toFixed(1)}%
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-muted-foreground">
          <Legend color="bg-success/80" label="≥ 12% (Strong)" />
          <Legend color="bg-warning/70" label="5–12% (Marginal)" />
          <Legend color="bg-destructive/70" label="< 5% (Weak)" />
        </div>
      </div>

      <div className="bg-surface border border-border rounded-2xl p-6 md:p-8 mb-6">
        <h2 className="font-semibold mb-4">Break-even Analysis</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-background border border-border rounded-xl p-5">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Cost overrun tolerance</div>
            <div className="text-2xl font-semibold mt-1 tabular-nums">{fmtPct(breakEvenOverrun)}</div>
            <p className="text-xs text-muted-foreground mt-2">This deal breaks at {fmtPct(breakEvenOverrun)} cost overrun.</p>
          </div>
          <div className="bg-background border border-border rounded-xl p-5">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Break-even cap rate</div>
            <div className="text-2xl font-semibold mt-1 tabular-nums">{fmtPct(breakEvenCap, 2)}</div>
            <p className="text-xs text-muted-foreground mt-2">Or breaks at a {fmtPct(breakEvenCap, 2)} exit cap rate.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <button onClick={exportPDF} className="h-12 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors">Download PDF Report</button>
        <button onClick={saveProject} className="h-12 rounded-lg border border-border hover:bg-surface transition-colors">Save Project</button>
        <button onClick={newProject} className="h-12 rounded-lg border border-border hover:bg-surface transition-colors">Start New Project</button>
      </div>

      <NavButtons onBack={() => navigate({ to: "/financial-summary" })} />
    </StepLayout>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return <span className="flex items-center gap-2"><span className={`w-3 h-3 rounded ${color}`} />{label}</span>;
}
