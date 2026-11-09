// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Dyne.org foundation <foundation@dyne.org>.
//
// Marketplace building blocks, drawn from the Claude Design canvas and the
// DTEC catalogue header: dark hero with yellow eyebrow, square cards, entity
// type chips, mono specs, fit chips and line drawings on a drafting grid.

import { CSSProperties, ReactNode } from "react";
import { useTranslation } from "next-i18next";
import type { FitCheck } from "lib/market/format";
import { initials } from "lib/market/format";

export const mono = { fontFamily: "var(--ifr-font-mono)" } as const;
export const heading = { fontFamily: "var(--ifr-font-heading)", fontWeight: 700 } as const;

export type MarketEntity = "design" | "product" | "service" | "build";

const ENTITY_COLOR: Record<MarketEntity, string> = {
  design: "var(--ifr-green)",
  build: "var(--ifr-green)",
  product: "var(--ifr-type-product)",
  service: "var(--ifr-type-service)",
};

export function MarketHero({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <section className="bg-ifr-dark text-ifr-text-inverse">
      <div className="max-w-[1280px] mx-auto px-4 md:px-10 pt-8 md:pt-11">
        <p
          className="m-0 uppercase text-ifr-yellow text-[15px] leading-[24px] tracking-[0.08em]"
          style={{ fontFamily: "var(--ifr-font-heading)", fontWeight: 500 }}
        >
          {eyebrow}
        </p>
        <h1
          className="m-0 mt-2 text-[30px] leading-[36px] md:text-[42px] md:leading-[48px] max-w-[26ch]"
          style={{ ...heading, textWrap: "balance" } as CSSProperties}
        >
          {title}
        </h1>
        {description ? (
          <p className="m-0 mt-3 max-w-[62ch] text-[16px] leading-[26px] md:text-[17px] text-ifr-text-inverse-secondary">
            {description}
          </p>
        ) : null}
        <div className={children ? "mt-8" : "pb-9"}>{children}</div>
      </div>
    </section>
  );
}

// Big two-path switch that sits on the hero's bottom edge; the active tab takes
// the page background so it reads as a folder tab opening onto the results.
export function PathTab({
  active,
  onClick,
  title,
  subtitle,
  count,
  icon,
  testid,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  subtitle: string;
  count?: number;
  icon: ReactNode;
  testid?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      data-testid={testid}
      className="text-left flex flex-col gap-1 px-5 pt-4 pb-5 min-w-0 flex-[0_1_360px] border border-b-0 transition-colors"
      style={{
        background: active ? "var(--ifr-bg-profile)" : "transparent",
        color: active ? "var(--ifr-text-primary)" : "var(--ifr-text-inverse)",
        borderColor: active ? "var(--ifr-bg-profile)" : "var(--ifr-border-on-dark)",
      }}
    >
      <span className="flex items-center gap-2.5 text-[19px]" style={heading}>
        {icon}
        {title}
        {count !== undefined ? (
          <span
            className="ml-auto text-[13px] font-medium"
            style={{ ...mono, color: active ? "var(--ifr-text-secondary)" : "var(--ifr-text-inverse-secondary)" }}
          >
            {count}
          </span>
        ) : null}
      </span>
      <span
        className="text-[14px]"
        style={{ color: active ? "var(--ifr-text-secondary)" : "var(--ifr-text-inverse-secondary)" }}
      >
        {subtitle}
      </span>
    </button>
  );
}

export function TypeChip({ type, label }: { type: MarketEntity; label: string }) {
  return (
    <span
      className="inline-block px-2 py-[3px] text-[11px] font-semibold tracking-[0.06em] uppercase text-white"
      style={{ background: ENTITY_COLOR[type] }}
    >
      {label}
    </span>
  );
}

// A project image when there is one; otherwise a line drawing on a drafting
// grid (green for designs, blue for products), with an optional spec caption.
export function Drawing({
  type,
  image,
  alt,
  caption,
  chip,
  height = 196,
}: {
  type: "design" | "product";
  image?: string | null;
  alt: string;
  caption?: string;
  chip?: ReactNode;
  height?: number | string;
}) {
  const accent = type === "design" ? "var(--ifr-green)" : "var(--ifr-type-product)";
  return (
    <div
      className="relative flex items-center justify-center overflow-hidden border-b border-ifr"
      style={{
        height,
        backgroundColor: type === "design" ? "#eef3f0" : "#efeeea",
        backgroundImage: `radial-gradient(${type === "design" ? "#cbd8d1" : "#d3d1c9"} 1px, transparent 1px)`,
        backgroundSize: "14px 14px",
      }}
    >
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt={alt} className="absolute inset-0 w-full h-full object-cover" />
      ) : type === "design" ? (
        <svg width="132" height="104" viewBox="0 0 132 104" fill="none" aria-hidden="true">
          <path d="M28 8h56l20 20v68H28z" stroke="#0b1324" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M84 8v20h20" stroke="#0b1324" strokeWidth="1.5" strokeLinejoin="round" />
          <rect
            x="42"
            y="40"
            width="48"
            height="30"
            fill={accent}
            fillOpacity="0.14"
            stroke={accent}
            strokeWidth="1.5"
          />
          <path d="M42 82h48M42 78v8M90 78v8" stroke="#565a64" strokeWidth="1" />
        </svg>
      ) : (
        <svg width="132" height="104" viewBox="0 0 132 104" fill="none" aria-hidden="true">
          <path d="M66 10l44 22v42L66 96 22 74V32z" stroke="#0b1324" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M22 32l44 22 44-22M66 54v42" stroke="#0b1324" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M66 10l44 22-44 22-44-22z" fill={accent} fillOpacity="0.12" stroke={accent} strokeWidth="1.5" />
        </svg>
      )}
      {chip ? <span className="absolute top-3 left-3">{chip}</span> : null}
      {caption ? (
        <span
          className="absolute right-3 bottom-2 px-1 text-[11px]"
          style={{ ...mono, color: "#565a64", background: image ? "rgba(255,255,255,0.85)" : "transparent" }}
        >
          {caption}
        </span>
      ) : null}
    </div>
  );
}

export function Avatar({ name, size = 24 }: { name: string; size?: number }) {
  return (
    <span
      aria-hidden="true"
      className="inline-flex items-center justify-center rounded-full shrink-0 font-semibold"
      style={{
        width: size,
        height: size,
        fontSize: Math.max(10, Math.round(size * 0.38)),
        background: "var(--ifr-bg-avatar)",
        color: "var(--ifr-green-dark)",
      }}
    >
      {initials(name)}
    </span>
  );
}

const CHECK = (
  <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M2.5 6.5l2.2 2.2 4.8-5" />
  </svg>
);
const CROSS = (
  <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M3 3l6 6M9 3l-6 6" />
  </svg>
);

export function FitChips({ checks }: { checks: FitCheck[] }) {
  const { t } = useTranslation("common");
  return (
    <ul className="m-0 p-0 list-none flex flex-wrap gap-1.5" aria-label={t("Fit with the design")}>
      {checks.map(c => (
        <li
          key={c.key}
          className="inline-flex items-center gap-1 px-[7px] py-[2px] rounded-[4px] text-[11.5px]"
          style={{
            ...mono,
            background: c.ok ? "rgba(3, 106, 83, 0.08)" : "var(--ifr-red-hover-bg)",
            color: c.ok ? "#00704f" : "#9a1f16",
          }}
        >
          {c.ok ? CHECK : CROSS}
          <span>{c.label}</span>
          <span className="sr-only">{c.ok ? t("meets the requirement") : t("does not meet the requirement")}</span>
        </li>
      ))}
    </ul>
  );
}

export type StatusTone = "blue" | "amber" | "green" | "grey" | "red";

const TONES: Record<StatusTone, { background: string; color: string }> = {
  blue: { background: "rgba(43, 127, 255, 0.1)", color: "#1447e6" },
  amber: { background: "var(--ifr-yellow-bg)", color: "#7a5900" },
  green: { background: "rgba(3, 106, 83, 0.1)", color: "#00704f" },
  grey: { background: "rgba(200, 212, 229, 0.4)", color: "var(--ifr-text-secondary)" },
  red: { background: "var(--ifr-red-hover-bg)", color: "#9a1f16" },
};

export function StatusChip({ tone, children, testid }: { tone: StatusTone; children: ReactNode; testid?: string }) {
  return (
    <span
      className="inline-block whitespace-nowrap px-[9px] py-[3px] rounded-[4px] text-[12px] font-semibold"
      style={TONES[tone]}
      data-testid={testid}
    >
      {children}
    </span>
  );
}

export function SectionTitle({ children, sub }: { children: ReactNode; sub?: ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <h2 className="m-0 text-[22px] leading-[28px] text-ifr-text-primary" style={heading}>
        {children}
      </h2>
      {sub ? <p className="m-0 text-[14px] text-ifr-text-secondary">{sub}</p> : null}
    </div>
  );
}

export function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`bg-ifr-surface border border-ifr ${className}`}>{children}</div>;
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="m-0 text-[12px] font-semibold uppercase tracking-[0.08em] text-ifr-text-secondary">{children}</p>
  );
}

// Friendly page-level states: offline marketplace, sign-in needed, empty.
export function MarketNotice({
  tone = "neutral",
  title,
  children,
  action,
  testid,
}: {
  tone?: "neutral" | "error";
  title: string;
  children?: ReactNode;
  action?: ReactNode;
  testid?: string;
}) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      data-testid={testid}
      className="flex flex-col gap-2 p-5 border"
      style={{
        background: tone === "error" ? "var(--ifr-red-hover-bg)" : "var(--ifr-bg-surface)",
        borderColor: tone === "error" ? "rgba(197, 40, 29, 0.35)" : "var(--ifr-border)",
      }}
    >
      <strong className="text-[16px]" style={heading}>
        {title}
      </strong>
      {children ? <div className="text-[14px] text-ifr-text-secondary">{children}</div> : null}
      {action ? <div className="pt-1">{action}</div> : null}
    </div>
  );
}

export const primaryButton =
  "inline-flex items-center justify-center gap-2 h-12 px-5 rounded-[6px] bg-ifr-green text-white font-semibold text-[15px] hover:bg-ifr-green-hover disabled:opacity-60 disabled:cursor-not-allowed transition-colors";
export const secondaryButton =
  "inline-flex items-center justify-center gap-2 h-11 px-4 rounded-[6px] border border-ifr-text-primary text-ifr-text-primary font-semibold text-[14px] bg-transparent hover:bg-ifr-hover transition-colors";
