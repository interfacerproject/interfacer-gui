// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Dyne.org foundation <foundation@dyne.org>.
//
// Project images for the marketplace showcase: technical-drawing "plates"
// (line drawing on a drafting grid, dimensions, title block), in the same
// visual language as the marketplace UI. Plain SVG, uploaded to Zenflows.

type Kind = "design" | "product" | "service";

const PALETTE: Record<Kind, { ground: string; dots: string; accent: string }> = {
  design: { ground: "#eef3f0", dots: "#cbd8d1", accent: "#036a53" },
  product: { ground: "#efeeea", dots: "#d3d1c9", accent: "#143bb5" },
  service: { ground: "#f2eff6", dots: "#d9d1e4", accent: "#8200db" },
};

// Line drawings in a 200 × 140 box; `A` marks the accent element.
const DRAWINGS: Record<string, string> = {
  lampshade: `<line x1="100" y1="6" x2="100" y2="30"/><rect x="92" y="26" width="16" height="6"/>
    <path d="M78 32h44l28 70H50z"/><path d="M90 32l-10 70M110 32l10 70" stroke-width="0.6"/>
    <path d="M70 52h60M63 70h74M56 88h88" stroke-width="0.6" stroke-dasharray="2 2"/>
    <ellipse A cx="100" cy="102" rx="50" ry="7"/>`,
  phonemount: `<path d="M20 100h160M20 110h160"/><path d="M88 100a12 12 0 0 1 24 0"/>
    <line x1="100" y1="80" x2="100" y2="88"/><rect A x="72" y="14" width="56" height="66" rx="6"/>
    <path d="M92 20h16" stroke-width="0.6"/><path d="M72 30h-6v34h6M128 30h6v34h-6"/>`,
  cableclip: `<path d="M70 100V70a30 30 0 0 1 60 0v30"/><path d="M80 100V70a20 20 0 0 1 40 0v30"/>
    <path d="M60 100h80v8H60z"/><circle A cx="100" cy="72" r="11"/>
    <path d="M24 72h65M111 72h65" stroke-dasharray="3 3"/>`,
  seedtray: `<path d="M30 60l70-30 70 30-70 30z"/><path d="M30 60v16l70 30 70-30V60"/><line x1="100" y1="90" x2="100" y2="106"/>
    <path A d="M82.5 37.5L100 30l35 15-17.5 7.5z"/>
    <path d="M47.5 52.5l70 30M65 45l70 30M82.5 37.5l70 30M65 75l70-30" stroke-width="0.6"/>`,
  enclosure: `<path d="M58 24h84v84H58z"/><rect A x="70" y="44" width="60" height="40"/>
    <circle cx="66" cy="32" r="3"/><circle cx="134" cy="32" r="3"/><circle cx="66" cy="100" r="3"/><circle cx="134" cy="100" r="3"/>
    <path d="M78 94h44M78 90h44" stroke-width="0.6"/>`,
  stool: `<ellipse A cx="100" cy="36" rx="52" ry="14"/><path d="M48 36v6c0 8 104 8 104 0v-6"/>
    <line x1="70" y1="52" x2="56" y2="124"/><line x1="130" y1="52" x2="144" y2="124"/><line x1="100" y1="56" x2="100" y2="130"/>
    <line x1="64" y1="88" x2="136" y2="88" stroke-width="0.6"/>`,
  picase: `<rect x="48" y="40" width="104" height="66" rx="8"/><rect A x="60" y="52" width="80" height="42" rx="4"/>
    <path d="M152 56h6v10h-6M152 74h6v10h-6M48 60h-6v8h6"/><path d="M70 106v6M90 106v6M110 106v6M130 106v6" stroke-width="0.6"/>
    <circle cx="58" cy="50" r="2"/><circle cx="142" cy="50" r="2"/>`,
  printer: `<rect x="58" y="14" width="84" height="100"/><line x1="58" y1="44" x2="142" y2="44"/>
    <line x1="62" y1="18" x2="62" y2="110" stroke-width="0.6"/><line x1="138" y1="18" x2="138" y2="110" stroke-width="0.6"/>
    <rect A x="92" y="40" width="16" height="12"/><line x1="100" y1="52" x2="100" y2="58"/>
    <line x1="66" y1="88" x2="134" y2="88"/><rect x="84" y="78" width="32" height="10"/><rect x="52" y="114" width="96" height="8"/>`,
  lasercutter: `<path d="M40 70h120v42H40z"/><path d="M40 70l12-34h96l12 34"/><path A d="M62 42h76l6 20H56z"/>
    <line x1="52" y1="92" x2="148" y2="92"/><circle cx="140" cy="102" r="4"/><path d="M40 112v8M160 112v8"/>`,
  spareparts: `<path d="M44 40l6-10h12l6 10-6 10H50z"/><path d="M51 50h10v56H51z"/>
    <path d="M51 60l10 4M51 70l10 4M51 80l10 4M51 90l10 4" stroke-width="0.6"/>
    <path d="M96 92l7-12h14l7 12-7 12h-14z"/><circle cx="110" cy="92" r="5"/>
    <circle A cx="152" cy="56" r="24"/><circle cx="152" cy="56" r="11"/>`,
  cnc: `<rect x="24" y="96" width="152" height="18"/><path d="M40 96V40h120v56"/><rect x="34" y="34" width="132" height="12"/>
    <rect A x="88" y="46" width="24" height="30"/><path d="M100 76v12"/><path d="M96 88h8l-4 6z"/>
    <path d="M30 120h140" stroke-width="0.6"/>`,
};

const DIM = "#565a64";

function escapeXml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export interface Plate {
  kind: Kind;
  drawing: keyof typeof DRAWINGS;
  title: string;
  subtitle: string; // second line of the title block (author / maker / place)
  dims?: string; // overall dimension label under the drawing
  sheet: string; // licence or place, bottom-right cell
}

export function plate(p: Plate): string {
  const c = PALETTE[p.kind];
  const body = DRAWINGS[p.drawing].replace(/<(\w+) A /g, `<$1 fill="${c.accent}" fill-opacity="0.14" stroke="${c.accent}" `);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 900" width="1200" height="900">
<defs><pattern id="g" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="1.5" cy="1.5" r="1.5" fill="${c.dots}"/></pattern></defs>
<rect width="1200" height="900" fill="${c.ground}"/><rect width="1200" height="900" fill="url(#g)"/>
<rect x="36" y="36" width="1128" height="828" fill="none" stroke="#0b1324" stroke-width="2"/>
<g transform="translate(200 90) scale(4)" fill="none" stroke="#0b1324" stroke-width="1.2" stroke-linejoin="round" stroke-linecap="round">${body}</g>
${
  p.dims
    ? `<g stroke="${DIM}" stroke-width="2"><path d="M300 720h600M300 708v24M900 708v24"/></g>
<text x="600" y="760" text-anchor="middle" font-family="ui-monospace, Menlo, monospace" font-size="26" fill="${DIM}">${escapeXml(p.dims)}</text>`
    : ""
}
<g font-family="ui-sans-serif, Helvetica, Arial, sans-serif">
<rect x="744" y="772" width="420" height="92" fill="#fff" stroke="#0b1324" stroke-width="2"/>
<text x="764" y="808" font-size="26" font-weight="700" fill="#0b1324">${escapeXml(p.title)}</text>
<text x="764" y="844" font-size="20" fill="${DIM}">${escapeXml(p.subtitle)}</text>
<text x="1148" y="844" text-anchor="end" font-family="ui-monospace, Menlo, monospace" font-size="18" fill="${DIM}">${escapeXml(p.sheet)}</text>
</g>
</svg>`;
}
