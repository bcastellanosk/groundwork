import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { StepLayout, NavButtons } from "@/components/StepLayout";
import { Field, TextInput, NumberInput, Select } from "@/components/FormField";
import { useProject } from "@/lib/project-context";

export const Route = createFileRoute("/site-analysis")({ component: SitePage });

const STATES = ["IL", "IN", "NY", "CA", "TX", "FL", "WA", "MA", "OH", "PA", "MI", "GA", "NC", "CO", "AZ"];

function SitePage() {
  const { data, update } = useProject();
  const navigate = useNavigate();
  return (
    <StepLayout step={1}>
      <div className="mb-8">
        <p className="text-sm text-muted-foreground mb-1">Step 1 of 5</p>
        <h1 className="text-3xl font-semibold tracking-tight">Site Analysis</h1>
        <p className="text-muted-foreground mt-2">Tell us about the parcel you're evaluating.</p>
      </div>
      <div className="bg-surface border border-border rounded-2xl p-6 md:p-8 space-y-6">
        <Field label="Property Address">
          <TextInput value={data.address} onChange={e => update({ address: e.target.value })} placeholder="123 Main St" />
        </Field>
        <div className="grid md:grid-cols-2 gap-6">
          <Field label="City">
            <TextInput value={data.city} onChange={e => update({ city: e.target.value })} placeholder="Chicago" />
          </Field>
          <Field label="State">
            <Select value={data.state} onChange={e => update({ state: e.target.value })}>
              {STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </Select>
          </Field>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <Field label="Lot Size (SF)">
            <NumberInput value={data.lotSize || ""} onChange={e => update({ lotSize: Number(e.target.value) })} placeholder="20000" />
          </Field>
          <Field label="Zoning District">
            <TextInput value={data.zoning} onChange={e => update({ zoning: e.target.value })} placeholder="MF-2, C-1, etc." />
          </Field>
        </div>
        <Field label="Land Price per SF">
          <NumberInput prefix="$" value={data.landPricePerSF || ""} onChange={e => update({ landPricePerSF: Number(e.target.value) })} placeholder="50" />
        </Field>
      </div>
      <NavButtons onNext={() => navigate({ to: "/program" })} />
    </StepLayout>
  );
}
