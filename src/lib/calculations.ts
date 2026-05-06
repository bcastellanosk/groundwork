import type { ProjectData, BuildingType, ParkingType } from "./project-context";

export const BUILDING_TYPES: { id: BuildingType; label: string; sub: string; structure: number; exterior: number }[] = [
  { id: "vb", label: "Type V-B", sub: "Wood frame, 3-story", structure: 25, exterior: 15 },
  { id: "va", label: "Type V-A", sub: "Wood frame, 4-story", structure: 35, exterior: 18 },
  { id: "podium", label: "5-over-1 Podium", sub: "Wood over concrete", structure: 65, exterior: 22 },
  { id: "midrise", label: "Mid-rise Concrete", sub: "Concrete, 6+ stories", structure: 85, exterior: 25 },
  { id: "townhomes", label: "Townhomes", sub: "For-sale or rental", structure: 28, exterior: 17 },
  { id: "mixed", label: "Mixed-use", sub: "Retail + residential", structure: 70, exterior: 22 },
];

const PARKING_COST: Record<ParkingType, number> = {
  none: 0, surface: 5000, structured: 25000, underground: 45000,
};

export const LOCATIONS = [
  { key: "chicago", label: "Chicago", mult: 1.15, rent: 2000 },
  { key: "indianapolis", label: "Indianapolis", mult: 0.95, rent: 1400 },
  { key: "southbend", label: "South Bend", mult: 0.9, rent: 1100 },
  { key: "newyork", label: "New York", mult: 1.6, rent: 3200 },
  { key: "other", label: "Other", mult: 1.0, rent: 1800 },
];

export function computeUnitTotals(d: ProjectData) {
  const u = d.units;
  const totalUnits = u.studio.count + u.br1.count + u.br2.count + u.br3.count;
  const residentialSF =
    u.studio.count * u.studio.sf +
    u.br1.count * u.br1.sf +
    u.br2.count * u.br2.sf +
    u.br3.count * u.br3.sf;
  const grossSF = Math.round(residentialSF * 1.3);
  return { totalUnits, residentialSF, grossSF };
}

export interface CostBreakdown {
  hard: {
    structure: number; mep: number; exterior: number; interiors: number;
    sitework: number; gc: number; fee: number; parking: number; subtotal: number;
  };
  soft: {
    ae: number; permits: number; reports: number; legal: number;
    developer: number; contingency: number; subtotal: number;
  };
  landCost: number;
  tdc: number;
  costPerUnit: number;
  costPerSF: number;
}

export function computeCosts(d: ProjectData): CostBreakdown {
  const { totalUnits, grossSF } = computeUnitTotals(d);
  const bt = BUILDING_TYPES.find(b => b.id === d.buildingType);
  const mult = d.locationMultiplier;

  const structure = (bt?.structure || 0) * grossSF * mult;
  const mep = 40 * grossSF * mult;
  const exterior = (bt?.exterior || 0) * grossSF * mult;
  const interiors = 35 * grossSF * mult;
  const sitework = (150000 + 5 * d.lotSize) * mult;
  const stalls = d.parking === "none" ? 0 : Math.ceil(totalUnits * d.stallsPerUnit);
  const parking = stalls * PARKING_COST[d.parking] * mult;

  const preSubtotal = structure + mep + exterior + interiors + sitework + parking;
  const gc = preSubtotal * 0.08;
  const fee = preSubtotal * 0.06;
  const hardSubtotal = preSubtotal + gc + fee;

  const ae = hardSubtotal * 0.08;
  const permits = 50000 + hardSubtotal * 0.005;
  const reports = 35000;
  const legal = 25000;
  const contingency = hardSubtotal * 0.07;
  const preDev = hardSubtotal + ae + permits + reports + legal + contingency;
  const developer = preDev * 0.03;
  const softSubtotal = ae + permits + reports + legal + contingency + developer;

  const landCost = d.landPricePerSF * d.lotSize;
  const tdc = hardSubtotal + softSubtotal + landCost;

  return {
    hard: { structure, mep, exterior, interiors, sitework, gc, fee, parking, subtotal: hardSubtotal },
    soft: { ae, permits, reports, legal, developer, contingency, subtotal: softSubtotal },
    landCost,
    tdc,
    costPerUnit: totalUnits ? tdc / totalUnits : 0,
    costPerSF: grossSF ? tdc / grossSF : 0,
  };
}

export interface Financials {
  gpr: number; vacancyLoss: number; egi: number; opexAmt: number; noi: number;
  stabilizedValue: number; profit: number; profitOnCost: number; yieldOnCost: number;
  spreadBps: number; loan: number; equity: number; interestCarry: number;
}

export function computeFinancials(d: ProjectData, tdc: number): Financials {
  const { totalUnits } = computeUnitTotals(d);
  const gpr = totalUnits * d.monthlyRent * 12;
  const vacancyLoss = gpr * (d.vacancy / 100);
  const egi = gpr - vacancyLoss;
  const opexAmt = egi * (d.opex / 100);
  const noi = egi - opexAmt;
  const stabilizedValue = d.capRate > 0 ? noi / (d.capRate / 100) : 0;
  const profit = stabilizedValue - tdc;
  const profitOnCost = tdc > 0 ? (profit / tdc) * 100 : 0;
  const yieldOnCost = tdc > 0 ? (noi / tdc) * 100 : 0;
  const spreadBps = (yieldOnCost - d.capRate) * 100;
  const loan = tdc * (d.ltc / 100);
  const equity = tdc - loan;
  const interestCarry = (loan * (d.loanRate / 100) * (d.constructionMonths / 12)) / 2;
  return { gpr, vacancyLoss, egi, opexAmt, noi, stabilizedValue, profit, profitOnCost, yieldOnCost, spreadBps, loan, equity, interestCarry };
}

export const fmt$ = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
export const fmtPct = (n: number, d = 1) => `${n.toFixed(d)}%`;
export const fmtNum = (n: number) => n.toLocaleString("en-US");
