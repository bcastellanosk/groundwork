import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { StepLayout, NavButtons } from "@/components/StepLayout";
import { NumberInput } from "@/components/FormField";
import { useProject } from "@/lib/project-context";
import { BUILDING_TYPES, computeUnitTotals, fmtNum } from "@/lib/calculations";

export const Route = createFileRoute("/program")({ component: ProgramPage });

const UNIT_KEYS = [
  { key: "studio" as const, label: "Studio" },
  { key: "br1" as const, label: "1BR" },
  { key: "br2" as const, label: "2BR" },
  { key: "br3" as const, label: "3BR" },
];

function ProgramPage() {
  const { data, update, updateUnit } = useProject();
  const navigate = useNavigate();
  const totals = computeUnitTotals(data);

  return (
    <StepLayout step={2}>
      <div className="mb-8">
        <p className="text-sm text-muted-foreground mb-1">Step 2 of 5</p>
        <h1 className="text-3xl font-semibold tracking-tight">Program Builder</h1>
        <p className="text-muted-foreground mt-2">Define the building type and unit mix.</p>
      </div>

      <section className="bg-surface border border-border rounded-2xl p-6 md:p-8 mb-6">
        <h2 className="font-semibold mb-4">Building Type</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {BUILDING_TYPES.map(b => {
            const active = data.buildingType === b.id;
            return (
              <button
                key={b.id}
                onClick={() => update({ buildingType: b.id })}
                className={`text-left p-4 rounded-xl border-2 transition-all ${
                  active ? "border-primary bg-primary/10" : "border-border hover:border-muted-foreground/40 bg-background"
                }`}
              >
                <div className="font-medium">{b.label}</div>
                <div className="text-xs text-muted-foreground mt-1">{b.sub}</div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="bg-surface border border-border rounded-2xl p-6 md:p-8 mb-6">
        <h2 className="font-semibold mb-4">Unit Mix</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground">
                <th className="pb-3 font-medium">Type</th>
                <th className="pb-3 font-medium">Count</th>
                <th className="pb-3 font-medium">Avg SF</th>
                <th className="pb-3 font-medium text-right">Total SF</th>
              </tr>
            </thead>
            <tbody>
              {UNIT_KEYS.map(({ key, label }) => {
                const u = data.units[key];
                return (
                  <tr key={key} className="border-t border-border">
                    <td className="py-3 font-medium">{label}</td>
                    <td className="py-3 pr-3">
                      <NumberInput value={u.count || ""} onChange={e => updateUnit(key, { count: Number(e.target.value) })} className="h-10" />
                    </td>
                    <td className="py-3 pr-3">
                      <NumberInput value={u.sf} onChange={e => updateUnit(key, { sf: Number(e.target.value) })} className="h-10" />
                    </td>
                    <td className="py-3 text-right tabular-nums text-muted-foreground">{fmtNum(u.count * u.sf)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-6">
          <Stat label="Total Units" value={fmtNum(totals.totalUnits)} />
          <Stat label="Residential SF" value={fmtNum(totals.residentialSF)} />
          <Stat label="Gross SF" value={fmtNum(totals.grossSF)} />
        </div>
      </section>

      <section className="bg-surface border border-border rounded-2xl p-6 md:p-8">
        <h2 className="font-semibold mb-4">Parking</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {(["none", "surface", "structured", "underground"] as const).map(p => {
            const active = data.parking === p;
            return (
              <button key={p} onClick={() => update({ parking: p })}
                className={`h-12 rounded-lg border-2 capitalize text-sm font-medium transition-all ${
                  active ? "border-primary bg-primary/10" : "border-border hover:border-muted-foreground/40 bg-background"
                }`}
              >{p}</button>
            );
          })}
        </div>
        {data.parking !== "none" && (
          <div className="mt-6 max-w-xs">
            <label className="block text-sm font-medium mb-2">Stalls per unit</label>
            <NumberInput step="0.05" value={data.stallsPerUnit} onChange={e => update({ stallsPerUnit: Number(e.target.value) })} />
          </div>
        )}
      </section>

      <NavButtons onBack={() => navigate({ to: "/site-analysis" })} onNext={() => navigate({ to: "/construction-costs" })} />
    </StepLayout>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-background border border-border rounded-xl p-4">
      <div className="text-xs text-muted-foreground uppercase tracking-wider">{label}</div>
      <div className="text-2xl font-semibold mt-1 tabular-nums">{value}</div>
    </div>
  );
}
