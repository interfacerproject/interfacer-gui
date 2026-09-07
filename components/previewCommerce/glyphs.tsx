// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2022-2023 Dyne.org foundation <foundation@dyne.org>.
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

/**
 * Small stroke icons matching the design prototype (1.8–2.4 stroke). Kept local
 * to the preview so the whole feature stays deletable in one folder.
 */

interface GlyphProps {
  size?: number;
  stroke?: string;
}

export function CartGlyph({ size = 18, stroke = "currentColor" }: GlyphProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={stroke}
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <path d="M3 4h2l2.3 11a2 2 0 002 1.6h8.4a2 2 0 002-1.6L21 8H6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="9.5" cy="20" r="1.4" />
      <circle cx="17.5" cy="20" r="1.4" />
    </svg>
  );
}

export function ClipboardGlyph({ size = 13, stroke = "currentColor" }: GlyphProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" aria-hidden="true">
      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" strokeLinecap="round" />
      <rect x="9" y="3" width="6" height="4" rx="1" />
    </svg>
  );
}

export function CheckGlyph({ size = 26, stroke = "#036a53" }: GlyphProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={stroke}
      strokeWidth="2.4"
      aria-hidden="true"
    >
      <path d="M5 13l4 4 10-10" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ShieldGlyph({ size = 16, stroke = "#036a53" }: GlyphProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={stroke}
      strokeWidth="2"
      aria-hidden="true"
      style={{ flex: "none", marginTop: "1px" }}
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinejoin="round" />
    </svg>
  );
}

export function InfoGlyph({ size = 18, stroke = "#916a00" }: GlyphProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={stroke}
      strokeWidth="2"
      aria-hidden="true"
      style={{ flex: "none", marginTop: "1px" }}
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v5M12 16h.01" strokeLinecap="round" />
    </svg>
  );
}

export function ChevronRightGlyph({ size = 18, stroke = "#6c707c" }: GlyphProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke={stroke} strokeWidth="2" aria-hidden="true">
      <path d="M8 5l5 5-5 5" strokeLinecap="round" />
    </svg>
  );
}

export function CubeGlyph({ size = 16, stroke = "#fff" }: GlyphProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2" aria-hidden="true">
      <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z" strokeLinejoin="round" />
    </svg>
  );
}
