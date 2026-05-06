import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { StepLayout, NavButtons } from "@/components/StepLayout";
import { NumberInput } from "@/components/FormField";
import { useProject } from "@/lib/project-context";
import { computeCosts, computeFinancials, fmt$, fmtPct } from "@/lib/calculations";

export const Route = createFileRoute("/financial-summary")({ component: FinancialPage });

function FinancialPage() {
  const { data, update } = useProject();
  const navigate = useNavigate();
  const c = computeCosts(data);
  const f = computeFinancials(data, c.tdc);

  return (
    <StepLayout step={4}>
      <div className="mb-8">
        <p className="text-sm text-muted-foreground mb-1">Step 4 of 5</p>
        <h1 className="text-3xl font-semibold tracking-tight">Financial Summary</h1>
        <p className="text-muted-foreground mt-2">Underwriting and stabilized returns.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <KPI label="Total Development Cost" value={fmt$(c.tdc)} />
        <KPI label="Stabilized Value" value={fmt$(f.stabilizedValue)} />
        <KPI label="Profit on Cost" value={fmtPct(f.profitOnCost)}
          tone={f.profitOnCost >= 12 ? "success" : f.profitOnCost >= 5 ? "warning" : "destructive"} />
      </div>

      <section className="bg-surface border border-border rounded-2xl p-6 md:p-8 mb-6">
        <h2 className="font-semibold mb-4">Assumptions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Assumption label="Avg Monthly Rent / Unit" prefix="$" value={data.monthlyRent} onChange={v => update({ monthlyRent: v })} />
          <Assumption label="Vacancy Rate (%)" value={data.vacancy} onChange={v => update({ vacancy: v })} />
          <Assumption label="Operating Expenses (%)" value={data.opex} onChange={v => update({ opex: v })} />
          <Assumption label="Exit Cap Rate (%)" value={data.capRate} onChange={v => update({ capRate: v })} step="0.1" />
          <Assumption label="Construction Loan LTC (%)" value={data.ltc} onChange={v => update({ ltc: v })} />
          <Assumption label="Construction Loan Rate (%)" value={data.loanRate} onChange={v => update({ loanRate: v })} step="0.1" />
          <Assumption label="Construction Months" value={data.constructionMonths} onChange={v => update({ constructionMonths: v })} />
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card title="Income & Valuation">
          <Row label="Gross Potential Rent" value={fmt$(f.gpr)} />
          <Row label="Vacancy Loss" value={`-${fmt$(f.vacancyLoss)}`} />
          <Row label="Effective Gross Income" value={fmt$(f.egi)} />
          <Row label="Operating Expenses" value={`-${fmt$(f.opexAmt)}`} />
          <Row label="Net Operating Income" value={fmt$(f.noi)} bold />
          <Row label="Cap Rate" value={fmtPct(data.capRate)} muted />
          <Row label="Stabilized Value" value={fmt$(f.stabilizedValue)} bold />
        </Card>

        <Card title="Returns">
          <Row label="Profit" value={fmt$(f.profit)} />
          <Row label="Profit on Cost" value={fmtPct(f.profitOnCost)} bold />
          <Row label="Yield on Cost" value={fmtPct(f.yieldOnCost)} />
          <Row label="Development Spread" value={`${f.spreadBps.toFixed(0)} bps`} bold />
        </Card>
      </div>

      <Card title="Financing">
        <Row label={`Construction Loan (${fmtPct(data.ltc, 0)} LTC)`} value={fmt$(f.loan)} />
        <Row label="Equity Required" value={fmt$(f.equity)} bold />
        <Row label="Interest Carry (avg balance)" value={fmt$(f.interestCarry)} />
      </Card>

      <NavButtons onBack={() => navigate({ to: "/construction-costs" })} onNext={() => navigate({ to: "/sensitivity" })} />
    </StepLayout>
  );
}

function KPI({ label, value, tone }: { label: string; value: string; tone?: "success" | "warning" | "destructive" }) {
  const toneCls = tone === "success" ? "text-success" : tone === "warning" ? "text-warning" : tone === "destructive" ? "text-destructive" : "";
  return (
    <div className="bg-surface border border-border rounded-2xl p-6">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`text-3xl font-semibold mt-2 tabular-nums ${toneCls}`}>{value}</div>
    </div>
  );
}

function Assumption({ label, value, onChange, prefix, step }: { label: string; value: number; onChange: (v: number) => void; prefix?: string; step?: string }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-2">{label}</label>
      <NumberInput prefix={prefix} step={step} value={value} onChange={e => onChange(Number(e.target.value))} />
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-surface border border-border rounded-2xl p-6 md:p-8">
      <h2 className="font-semibold mb-4">{title}</h2>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Row({ label, value, bold, muted }: { label: string; value: string; bold?: boolean; muted?: boolean }) {
  return (
    <div className={`flex items-center justify-between py-1.5 text-sm ${bold ? "border-t border-border pt-3 mt-1" : ""}`}>
      <span className={muted ? "text-muted-foreground" : ""}>{label}</span>
      <span className={`tabular-nums ${bold ? "font-semibold text-base" : ""}`}>{value}</span>
    </div>
  );
}
