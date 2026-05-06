import { createContext, useContext, useState, ReactNode, useEffect } from "react";

export type BuildingType = "vb" | "va" | "podium" | "midrise" | "townhomes" | "mixed";
export type ParkingType = "none" | "surface" | "structured" | "underground";

export interface UnitRow { count: number; sf: number; }

export interface ProjectData {
  // Site
  address: string;
  city: string;
  state: string;
  lotSize: number;
  zoning: string;
  landPricePerSF: number;
  // Program
  buildingType: BuildingType | null;
  units: { studio: UnitRow; br1: UnitRow; br2: UnitRow; br3: UnitRow };
  parking: ParkingType;
  stallsPerUnit: number;
  // Costs
  locationMultiplier: number;
  locationKey: string;
  // Financials
  monthlyRent: number;
  vacancy: number;
  opex: number;
  capRate: number;
  ltc: number;
  loanRate: number;
  constructionMonths: number;
}

const defaults: ProjectData = {
  address: "", city: "", state: "IL", lotSize: 0, zoning: "", landPricePerSF: 0,
  buildingType: null,
  units: {
    studio: { count: 0, sf: 400 },
    br1: { count: 0, sf: 700 },
    br2: { count: 0, sf: 950 },
    br3: { count: 0, sf: 1200 },
  },
  parking: "none",
  stallsPerUnit: 1.25,
  locationMultiplier: 1.0,
  locationKey: "other",
  monthlyRent: 1800,
  vacancy: 5,
  opex: 40,
  capRate: 5.5,
  ltc: 65,
  loanRate: 7.5,
  constructionMonths: 18,
};

interface Ctx {
  data: ProjectData;
  update: (patch: Partial<ProjectData>) => void;
  updateUnit: (key: keyof ProjectData["units"], patch: Partial<UnitRow>) => void;
  reset: () => void;
}

const ProjectCtx = createContext<Ctx | null>(null);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<ProjectData>(() => {
    if (typeof window === "undefined") return defaults;
    try {
      const saved = localStorage.getItem("groundwork:project");
      return saved ? { ...defaults, ...JSON.parse(saved) } : defaults;
    } catch { return defaults; }
  });

  useEffect(() => {
    try { localStorage.setItem("groundwork:project", JSON.stringify(data)); } catch {}
  }, [data]);

  const update = (patch: Partial<ProjectData>) => setData(d => ({ ...d, ...patch }));
  const updateUnit = (key: keyof ProjectData["units"], patch: Partial<UnitRow>) =>
    setData(d => ({ ...d, units: { ...d.units, [key]: { ...d.units[key], ...patch } } }));
  const reset = () => { setData(defaults); try { localStorage.removeItem("groundwork:project"); } catch {} };

  return <ProjectCtx.Provider value={{ data, update, updateUnit, reset }}>{children}</ProjectCtx.Provider>;
}

export function useProject() {
  const ctx = useContext(ProjectCtx);
  if (!ctx) throw new Error("useProject must be used within ProjectProvider");
  return ctx;
}
