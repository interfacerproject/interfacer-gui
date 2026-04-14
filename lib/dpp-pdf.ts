import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { DppDocument } from "./dpp-types";

// --- Helpers (mirrored from the page) ---

function prettifyKey(key: string): string {
  return key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .replace(/^./, first => first.toUpperCase());
}

function getFieldValue(value: unknown): string | null {
  if (value == null) return null;
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) {
    if (value.length === 0) return null;
    return value.map(getFieldValue).filter(Boolean).join(", ") || null;
  }
  if (typeof value === "object") {
    const tv = value as { value?: unknown; units?: unknown };
    if (Object.prototype.hasOwnProperty.call(tv, "value")) {
      const scalar = getFieldValue(tv.value);
      if (!scalar) return null;
      const units = typeof tv.units === "string" ? tv.units : null;
      return units ? `${scalar} ${units}` : scalar;
    }
  }
  return null;
}

function sectionFields(section: unknown): Array<{ label: string; value: string }> {
  if (!section || typeof section !== "object" || Array.isArray(section)) return [];
  return Object.entries(section)
    .map(([key, raw]) => {
      const value = getFieldValue(raw);
      if (!value) return null;
      return { label: prettifyKey(key), value };
    })
    .filter((f): f is { label: string; value: string } => f !== null);
}

// --- Section configuration (same order & colors as UI) ---

const sectionConfig: Array<{ key: keyof DppDocument; title: string; subtitle: string; color: string }> = [
  {
    key: "productOverview",
    title: "DPP Overview",
    subtitle: "Basic product information and identification",
    color: "#E87C1E",
  },
  {
    key: "complianceAndStandards",
    title: "Compliance & Standards",
    subtitle: "Regulatory compliance information",
    color: "#2E7D32",
  },
  {
    key: "reparability",
    title: "Reparability",
    subtitle: "Repair instructions and spare parts availability",
    color: "#1565C0",
  },
  {
    key: "environmentalImpact",
    title: "Environmental Impact",
    subtitle: "Resource consumption and emissions data",
    color: "#558B2F",
  },
  {
    key: "certificates",
    title: "Certificates",
    subtitle: "Environmental and quality certifications",
    color: "#6A1B9A",
  },
  {
    key: "recyclability",
    title: "Recyclability",
    subtitle: "Material composition and recycling information",
    color: "#00838F",
  },
  {
    key: "energyUseAndEfficiency",
    title: "Energy Use & Efficiency",
    subtitle: "Battery and power specifications",
    color: "#EF6C00",
  },
  {
    key: "economicOperator",
    title: "Economic Operator",
    subtitle: "Manufacturer and company information",
    color: "#4E342E",
  },
  {
    key: "repairInformation",
    title: "Information about the Repair",
    subtitle: "Repair events and documentation",
    color: "#1565C0",
  },
  {
    key: "refurbishmentInformation",
    title: "Information about the Refurbishment",
    subtitle: "Refurbishment events and processes",
    color: "#00695C",
  },
  {
    key: "recyclingInformation",
    title: "Information on the Recycling",
    subtitle: "End-of-life recycling data",
    color: "#37474F",
  },
  {
    key: "consumerInformation",
    title: "Consumer Information",
    subtitle: "Product usage and safety details",
    color: "#AD1457",
  },
  {
    key: "dosageInstructions",
    title: "Dosage Instructions",
    subtitle: "Application and dosage guidance",
    color: "#C62828",
  },
  { key: "ingredients", title: "Ingredients", subtitle: "Ingredient and substance listing", color: "#283593" },
  { key: "packaging", title: "Packaging", subtitle: "Packaging materials and specifications", color: "#795548" },
];

// --- Color helpers ---

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbAlpha(hex: string, alpha: number): [number, number, number] {
  const [r, g, b] = hexToRgb(hex);
  return [
    Math.round(r * alpha + 255 * (1 - alpha)),
    Math.round(g * alpha + 255 * (1 - alpha)),
    Math.round(b * alpha + 255 * (1 - alpha)),
  ];
}

// --- PDF generation ---

const BRAND = "#E87C1E";
const PAGE_LEFT = 20;
const PAGE_RIGHT = 190;
const CONTENT_WIDTH = PAGE_RIGHT - PAGE_LEFT;

export function generateDppPdf(dpp: DppDocument): void {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const productName = dpp.productOverview?.productName?.value || dpp.batchId || dpp.id;
  const status = (dpp.status || "draft").charAt(0).toUpperCase() + (dpp.status || "draft").slice(1);
  const createdAt = dpp.createdAt ? new Date(dpp.createdAt).toLocaleDateString() : "-";

  let y = 20;

  // ── Header band ──
  doc.setFillColor(...hexToRgb(BRAND));
  doc.rect(0, 0, 210, 38, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Digital Product Passport", PAGE_LEFT, 14);

  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text(String(productName), PAGE_LEFT, 26);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  const statusText = `Status: ${status}`;
  const dateText = `Published: ${createdAt}`;
  const idText = `ID: ${dpp.id}`;
  doc.text([statusText, dateText, idText].join("   •   "), PAGE_LEFT, 34);

  y = 46;

  // Batch row
  if (dpp.batchId) {
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(9);
    doc.text(`Batch: ${dpp.batchId}`, PAGE_LEFT, y);
    y += 6;
  }

  // Product link
  if (dpp.productId) {
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(9);
    doc.text(`Product: ${dpp.productId}`, PAGE_LEFT, y);
    y += 6;
  }

  y += 4;

  // ── Sections ──
  const populatedSections = sectionConfig
    .map(cfg => {
      const fields = sectionFields(dpp[cfg.key]);
      if (fields.length === 0) return null;
      return { ...cfg, fields };
    })
    .filter(Boolean) as Array<(typeof sectionConfig)[number] & { fields: Array<{ label: string; value: string }> }>;

  for (const section of populatedSections) {
    // Check if we have room for at least the section header + a few rows
    if (y > 255) {
      doc.addPage();
      y = 20;
    }

    // Section header bar
    const [bgR, bgG, bgB] = rgbAlpha(section.color, 0.1);
    doc.setFillColor(bgR, bgG, bgB);
    doc.roundedRect(PAGE_LEFT, y, CONTENT_WIDTH, 12, 2, 2, "F");

    // Colored dot
    doc.setFillColor(...hexToRgb(section.color));
    doc.circle(PAGE_LEFT + 6, y + 6, 2.5, "F");

    // Section title
    doc.setTextColor(...hexToRgb(section.color));
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(section.title, PAGE_LEFT + 12, y + 5.5);

    // Section subtitle
    doc.setTextColor(120, 120, 120);
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.text(section.subtitle, PAGE_LEFT + 12, y + 10);

    y += 16;

    // Field table
    autoTable(doc, {
      startY: y,
      margin: { left: PAGE_LEFT, right: 210 - PAGE_RIGHT },
      head: [["Field", "Value"]],
      body: section.fields.map(f => [f.label, f.value]),
      theme: "grid",
      styles: {
        fontSize: 8.5,
        cellPadding: 3,
        lineColor: [220, 220, 220],
        lineWidth: 0.3,
        textColor: [50, 50, 50],
      },
      headStyles: {
        fillColor: hexToRgb(section.color),
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 8.5,
      },
      alternateRowStyles: {
        fillColor: [248, 248, 248],
      },
      columnStyles: {
        0: { cellWidth: 60, fontStyle: "bold", textColor: [80, 80, 80] },
      },
    });

    // Advance y past the table
    y = (doc as any).lastAutoTable.finalY + 10;
  }

  // ── Footer on every page ──
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(160, 160, 160);
    doc.text(`Digital Product Passport — ${String(productName)}`, PAGE_LEFT, 290);
    doc.text(`Page ${i} of ${pageCount}`, PAGE_RIGHT, 290, { align: "right" });
  }

  // Trigger download
  doc.save(`DPP-${dpp.id}.pdf`);
}
