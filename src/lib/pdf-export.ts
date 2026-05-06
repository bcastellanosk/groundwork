import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { ProjectData } from "./project-context";
import { BUILDING_TYPES, LOCATIONS, computeCosts, computeFinancials, computeUnitTotals, fmt$, fmtPct } from "./calculations";

const GREEN: [number, number, number] = [26, 60, 42];
const DARK: [number, number, number] = [20, 20, 20];
const MUTED: [number, number, number] = [110, 110, 115];

export function generateProjectPDF(data: ProjectData) {
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 48;
  let y = margin;

  const totals = computeUnitTotals(data);
  const c = computeCosts(data);
  const f = computeFinancials(data, c.tdc);
  const bt = BUILDING_TYPES.find(b => b.id === data.buildingType);
  const loc = LOCATIONS.find(l => l.key === data.locationKey);

  // Header band
  doc.setFillColor(...GREEN);
  doc.rect(0, 0, pageW, 80, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("Groundwork", margin, 38);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text("Real Estate Development Feasibility Report", margin, 58);
  doc.setFontSize(9);
  doc.text(new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
    pageW - margin, 58, { align: "right" });
  y = 110;

  doc.setTextColor(...DARK);

  const sectionTitle = (label: string) => {
    if (y > 700) { doc.addPage(); y = margin; }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(...DARK);
    doc.text(label, margin, y);
    doc.setDrawColor(...GREEN);
    doc.setLineWidth(1.5);
    doc.line(margin, y + 4, margin + 40, y + 4);
    y += 18;
  };

  const kvTable = (rows: [string, string][]) => {
    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      body: rows,
      theme: "plain",
      styles: { font: "helvetica", fontSize: 10, cellPadding: { top: 4, bottom: 4, left: 0, right: 0 }, textColor: DARK },
      columnStyles: {
        0: { textColor: MUTED, cellWidth: 200 },
        1: { halign: "right", fontStyle: "bold" },
      },
      didDrawPage: (d) => { y = d.cursor?.y ?? y; },
    });
    y = (doc as any).lastAutoTable.finalY + 16;
  };

  // 1. Project Overview
  sectionTitle("Project Overview");
  kvTable([
    ["Property Address", data.address || "—"],
    ["City, State", `${data.city || "—"}, ${data.state}`],
    ["Lot Size", `${totals && data.lotSize ? data.lotSize.toLocaleString() : "0"} SF`],
    ["Zoning District", data.zoning || "—"],
    ["Land Price / SF", fmt$(data.landPricePerSF)],
    ["Land Cost", fmt$(c.landCost)],
    ["Location Market", `${loc?.label ?? "—"} (${loc?.mult.toFixed(2)}× cost multiplier)`],
  ]);

  // 2. Program
  sectionTitle("Building Program");
  kvTable([
    ["Building Type", bt ? `${bt.label} — ${bt.sub}` : "—"],
    ["Total Units", totals.totalUnits.toLocaleString()],
    ["Residential SF", totals.residentialSF.toLocaleString()],
    ["Gross SF (×1.3)", totals.grossSF.toLocaleString()],
    ["Parking", data.parking === "none" ? "None" : `${data.parking[0].toUpperCase()}${data.parking.slice(1)} — ${data.stallsPerUnit} stalls/unit`],
  ]);

  // Unit Mix table
  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [["Unit Type", "Count", "Avg SF", "Total SF"]],
    body: ([
      ["Studio", data.units.studio],
      ["1BR", data.units.br1],
      ["2BR", data.units.br2],
      ["3BR", data.units.br3],
    ] as const).map(([label, u]) => [
      label,
      u.count.toLocaleString(),
      u.sf.toLocaleString(),
      (u.count * u.sf).toLocaleString(),
    ]),
    foot: [["Total", totals.totalUnits.toLocaleString(), "", totals.residentialSF.toLocaleString()]],
    theme: "striped",
    headStyles: { fillColor: GREEN, textColor: 255, fontSize: 10 },
    footStyles: { fillColor: [240, 240, 240], textColor: DARK, fontStyle: "bold" },
    styles: { font: "helvetica", fontSize: 10 },
    columnStyles: { 1: { halign: "right" }, 2: { halign: "right" }, 3: { halign: "right" } },
  });
  y = (doc as any).lastAutoTable.finalY + 20;

  // 3. Construction Costs
  if (y > 600) { doc.addPage(); y = margin; }
  sectionTitle("Cost Breakdown");
  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [["Category", "Line Item", "Amount"]],
    body: [
      ["Hard Costs", "Structure", fmt$(c.hard.structure)],
      ["", "MEP Systems", fmt$(c.hard.mep)],
      ["", "Exterior", fmt$(c.hard.exterior)],
      ["", "Interiors", fmt$(c.hard.interiors)],
      ["", "Sitework", fmt$(c.hard.sitework)],
      ["", "Parking", fmt$(c.hard.parking)],
      ["", "General Conditions (8%)", fmt$(c.hard.gc)],
      ["", "Contractor Fee (6%)", fmt$(c.hard.fee)],
      ["", "Hard Costs Subtotal", fmt$(c.hard.subtotal)],
      ["Soft Costs", "A&E Fees (8%)", fmt$(c.soft.ae)],
      ["", "Permits", fmt$(c.soft.permits)],
      ["", "Reports", fmt$(c.soft.reports)],
      ["", "Legal & Title", fmt$(c.soft.legal)],
      ["", "Developer Fee (3%)", fmt$(c.soft.developer)],
      ["", "Contingency (7%)", fmt$(c.soft.contingency)],
      ["", "Soft Costs Subtotal", fmt$(c.soft.subtotal)],
      ["Land", "Land Cost", fmt$(c.landCost)],
    ],
    foot: [
      ["", "Total Development Cost", fmt$(c.tdc)],
      ["", "Cost per Unit", fmt$(c.costPerUnit)],
      ["", "Cost per Gross SF", fmt$(c.costPerSF)],
    ],
    theme: "striped",
    headStyles: { fillColor: GREEN, textColor: 255, fontSize: 10 },
    footStyles: { fillColor: [240, 240, 240], textColor: DARK, fontStyle: "bold" },
    styles: { font: "helvetica", fontSize: 9 },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 90, textColor: GREEN },
      2: { halign: "right" },
    },
    didParseCell: (h) => {
      const subtotalRows = ["Hard Costs Subtotal", "Soft Costs Subtotal"];
      const raw = h.row.raw as unknown as string[];
      if (h.section === "body" && Array.isArray(raw) && subtotalRows.includes(String(raw[1]))) {
        h.cell.styles.fontStyle = "bold";
        h.cell.styles.fillColor = [235, 235, 235];
      }
    },
  });
  y = (doc as any).lastAutoTable.finalY + 20;

  // 4. Financial Summary
  if (y > 550) { doc.addPage(); y = margin; }
  sectionTitle("Financial Summary");

  // KPI cards
  const cardW = (pageW - margin * 2 - 24) / 3;
  const cards: [string, string, [number, number, number]][] = [
    ["Total Development Cost", fmt$(c.tdc), DARK],
    ["Stabilized Value", fmt$(f.stabilizedValue), DARK],
    ["Profit on Cost", fmtPct(f.profitOnCost),
      f.profitOnCost >= 12 ? [52, 168, 83] : f.profitOnCost >= 5 ? [200, 150, 0] : [220, 60, 50]],
  ];
  cards.forEach(([label, val, color], i) => {
    const x = margin + i * (cardW + 12);
    doc.setFillColor(248, 248, 248);
    doc.roundedRect(x, y, cardW, 60, 6, 6, "F");
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.setFont("helvetica", "normal");
    doc.text(label.toUpperCase(), x + 12, y + 18);
    doc.setFontSize(16);
    doc.setTextColor(...color);
    doc.setFont("helvetica", "bold");
    doc.text(val, x + 12, y + 44);
  });
  y += 80;
  doc.setTextColor(...DARK);

  // Assumptions
  sectionTitle("Underwriting Assumptions");
  kvTable([
    ["Avg Monthly Rent / Unit", fmt$(data.monthlyRent)],
    ["Vacancy Rate", fmtPct(data.vacancy)],
    ["Operating Expenses", `${fmtPct(data.opex)} of EGI`],
    ["Exit Cap Rate", fmtPct(data.capRate)],
    ["Construction Loan LTC", fmtPct(data.ltc)],
    ["Construction Loan Rate", fmtPct(data.loanRate)],
    ["Construction Months", String(data.constructionMonths)],
  ]);

  // Income & Returns
  if (y > 550) { doc.addPage(); y = margin; }
  sectionTitle("Income, Valuation & Returns");
  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [["Metric", "Value"]],
    body: [
      ["Gross Potential Rent", fmt$(f.gpr)],
      ["Vacancy Loss", `-${fmt$(f.vacancyLoss)}`],
      ["Effective Gross Income", fmt$(f.egi)],
      ["Operating Expenses", `-${fmt$(f.opexAmt)}`],
      ["Net Operating Income (NOI)", fmt$(f.noi)],
      ["Stabilized Value (NOI ÷ Cap)", fmt$(f.stabilizedValue)],
      ["Profit", fmt$(f.profit)],
      ["Profit on Cost", fmtPct(f.profitOnCost)],
      ["Yield on Cost", fmtPct(f.yieldOnCost)],
      ["Development Spread", `${f.spreadBps.toFixed(0)} bps`],
    ],
    theme: "striped",
    headStyles: { fillColor: GREEN, textColor: 255, fontSize: 10 },
    styles: { font: "helvetica", fontSize: 10 },
    columnStyles: { 1: { halign: "right", fontStyle: "bold" } },
  });
  y = (doc as any).lastAutoTable.finalY + 20;

  // Financing
  if (y > 600) { doc.addPage(); y = margin; }
  sectionTitle("Financing");
  kvTable([
    [`Construction Loan (${fmtPct(data.ltc, 0)} LTC)`, fmt$(f.loan)],
    ["Equity Required", fmt$(f.equity)],
    ["Interest Carry (avg balance)", fmt$(f.interestCarry)],
  ]);

  // Sensitivity
  if (y > 450) { doc.addPage(); y = margin; }
  sectionTitle("Sensitivity — Profit on Cost");
  const variances = [-20, -10, 0, 10, 20, 30];
  const caps = [4.5, 5.0, 5.5, 6.0, 6.5, 7.0, 7.5];
  const variableCosts = c.tdc - c.landCost;
  const profitAt = (v: number, cap: number) => {
    const newTdc = c.landCost + variableCosts * (1 + v / 100);
    const stab = cap > 0 ? f.noi / (cap / 100) : 0;
    return newTdc > 0 ? ((stab - newTdc) / newTdc) * 100 : 0;
  };
  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [["Cap \\ Cost", ...variances.map(v => v > 0 ? `+${v}%` : `${v}%`)]],
    body: caps.map(cap => [
      `${cap.toFixed(1)}%`,
      ...variances.map(v => `${profitAt(v, cap).toFixed(1)}%`),
    ]),
    theme: "grid",
    headStyles: { fillColor: GREEN, textColor: 255, fontSize: 9, halign: "center" },
    styles: { font: "helvetica", fontSize: 9, halign: "center" },
    columnStyles: { 0: { fontStyle: "bold", fillColor: [240, 240, 240] } },
    didParseCell: (h) => {
      if (h.section === "body" && h.column.index > 0) {
        const p = parseFloat(String(h.cell.raw));
        if (p >= 12) h.cell.styles.fillColor = [200, 235, 210];
        else if (p >= 5) h.cell.styles.fillColor = [255, 240, 180];
        else h.cell.styles.fillColor = [250, 200, 195];
      }
    },
  });
  y = (doc as any).lastAutoTable.finalY + 16;

  // Break-even
  const breakEvenOverrun = variableCosts > 0
    ? ((f.stabilizedValue - c.landCost - variableCosts) / variableCosts) * 100 : 0;
  const breakEvenCap = c.tdc > 0 ? (f.noi / c.tdc) * 100 : 0;
  doc.setFontSize(10);
  doc.setTextColor(...DARK);
  doc.text(`Break-even cost overrun: ${fmtPct(breakEvenOverrun)}    •    Break-even cap rate: ${fmtPct(breakEvenCap, 2)}`,
    margin, y);

  // Footer page numbers
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text(`Groundwork Feasibility Report  •  ${data.address || "Untitled Project"}`,
      margin, doc.internal.pageSize.getHeight() - 20);
    doc.text(`Page ${i} of ${pages}`,
      pageW - margin, doc.internal.pageSize.getHeight() - 20, { align: "right" });
  }

  const filename = `Groundwork_${(data.address || "Project").replace(/[^a-z0-9]+/gi, "_")}.pdf`;
  doc.save(filename);
}
