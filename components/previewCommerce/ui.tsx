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

import { ButtonHTMLAttributes, CSSProperties, ReactNode } from "react";

/** Shared display primitives for the commerce preview pages. */

export function PreviewHeading({
  children,
  size = "2xl",
  style,
}: {
  children: ReactNode;
  size?: "lg" | "xl" | "2xl";
  style?: CSSProperties;
}) {
  const fs = size === "2xl" ? "30px" : size === "xl" ? "24px" : "20px";
  return (
    <h1
      style={{
        margin: 0,
        fontFamily: "var(--ifr-font-heading)",
        fontSize: fs,
        fontWeight: 700,
        lineHeight: 1.2,
        color: "var(--ifr-text-primary)",
        ...style,
      }}
    >
      {children}
    </h1>
  );
}

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & { fullWidth?: boolean };

const baseBtn = (fullWidth?: boolean): CSSProperties => ({
  height: "48px",
  borderRadius: "8px",
  fontFamily: "var(--ifr-font-body)",
  fontSize: "16px",
  fontWeight: 600,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  width: fullWidth ? "100%" : undefined,
});

export function PrimaryButton({ fullWidth, style, children, ...rest }: BtnProps) {
  return (
    <button
      type="button"
      {...rest}
      style={{ ...baseBtn(fullWidth), border: "none", background: "#036a53", color: "#fff", ...style }}
    >
      {children}
    </button>
  );
}

export function OutlineButton({ fullWidth, style, children, ...rest }: BtnProps) {
  return (
    <button
      type="button"
      {...rest}
      style={{
        ...baseBtn(fullWidth),
        border: "1px solid #c9cccf",
        background: "#fff",
        color: "var(--ifr-text-primary)",
        ...style,
      }}
    >
      {children}
    </button>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div
      style={{
        border: "1px solid #c9cccf",
        borderRadius: "6px",
        background: "#fff",
        fontFamily: "var(--ifr-font-body)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function HRule() {
  return <hr style={{ border: "none", borderTop: "1px solid #c9cccf", margin: 0 }} />;
}
