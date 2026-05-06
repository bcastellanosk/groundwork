import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { StepLayout, NavButtons } from "@/components/StepLayout";
import { Select } from "@/components/FormField";
import { useProject } from "@/lib/project-context";
import { computeCosts, computeUnitTotals, fmt$, LOCATIONS, BUILDING_TYPES } from "@/lib/calculations";

export const Route = createFileRoute("/construction-costs")({ component: CostsPage });

function CostsPage() {
  const { data, update } = useProject();
  const navigate = useNavigate();
  const c = computeCosts(data);
  const totals = computeUnitTotals(data);
  const bt = BUILDING_TYPES.find(b => b.id === data.buildingType);

  return (
    <StepLayout step={3}>
      <div className="mb-8">
        <p className="text-sm text-muted-foreground mb-1">Step 3 of 5</p>
        <h1 className="text-3xl font-semibold tracking-tight">Construction Costs</h1>
        <p className="text-muted-foreground mt-2">Real-time cost stack based on your program.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Mini label="Building" value={bt?.label || "—"} />
        <Mini label="Units" value={String(totals.totalUnits)} />
        <Mini label="Gross SF" value={totals.grossSF.toLocaleString()} />
        <Mini label="Lot Size" value={`${data.lotSize.toLocaleString()} SF`} />
      </div>

      <div className="bg-surface border border-border rounded-2xl p-6 md:p-8 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <h2 className="font-semibold">Cost Stack</h2>
          <div className="md:w-64">
            <Select value={data.locationKey} onChange={e => {
              const loc = LOCATIONS.find(l => l.key === e.target.value)!;
              update({ locationKey: loc.key, locationMultiplier: loc.mult, monthlyRent: loc.rent });
            }}>
              {LOCATIONS.map(l => <option key={l.key} value={l.key}>{l.label} ({l.mult.toFixed(2)}×)</option>)}
            </Select>
          </div>
        </div>

        <Section title="Hard Costs">
          <Row label="Structure" value={c.hard.structure} />
          <Row label="MEP Systems" value={c.hard.mep} />
          <Row label="Exterior" value={c.hard.exterior} />
          <Row label="Interiors" value={c.hard.interiors} />
          <Row label="Sitework" value={c.hard.sitework} />
          <Row label="Parking" value={c.hard.parking} />
          <Row label="General Conditions (8%)" value={c.hard.gc} muted />
          <Row label="Contractor Fee (6%)" value={c.hard.fee} muted />
          <Row label="Hard Costs Subtotal" value={c.hard.subtotal} bold />
        </Section>

        <Section title="Soft Costs">
          <Row label="A&E Fees (8%)" value={c.soft.ae} />
          <Row label="Permits" value={c.soft.permits} />
          <Row label="Reports" value={c.soft.reports} />
          <Row label="Legal & Title" value={c.soft.legal} />
          <Row label="Developer Fee (3%)" value={c.soft.developer} />
          <Row label="Contingency (7%)" value={c.soft.contingency} />
          <Row label="Soft Costs Subtotal" value={c.soft.subtotal} bold />
        </Section>

        <Section title="Land">
          <Row label="Land Cost" value={c.landCost} />
        </Section>

        <div className="mt-6 pt-6 border-t border-border space-y-3">
          <Row label="Total Development Cost" value={c.tdc} bold large />
          <Row label="Cost per Unit" value={c.costPerUnit} muted />
          <Row label="Cost per Gross SF" value={c.costPerSF} muted />
        </div>
      </div>

      <NavButtons onBack={() => navigate({ to: "/program" })} onNext={() => navigate({ to: "/financial-summary" })} />
    </StepLayout>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-3">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Row({ label, value, bold, muted, large }: { label: string; value: number; bold?: boolean; muted?: boolean; large?: boolean }) {
  return (
    <div className={`flex items-center justify-between py-1.5 ${bold ? "border-t border-border pt-3 mt-1" : ""}`}>
      <span className={`${muted ? "text-muted-foreground" : ""} ${large ? "text-base" : "text-sm"}`}>{label}</span>
      <span className={`tabular-nums ${bold ? "font-semibold" : ""} ${large ? "text-2xl" : ""}`}>{fmt$(value)}</span>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-surface border border-border rounded-xl p-3">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-sm font-medium mt-0.5 truncate">{value}</div>
    </div>
  );
}
