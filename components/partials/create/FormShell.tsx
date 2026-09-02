import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { FormSectionContext, formAccents } from "./formSectionContext";

/**
 * Shared chrome for every long form in the app — create a design, product,
 * service or machine; publish a DPP; propose a contribution; edit a project or
 * profile. They all draw the same page in the prototype: a heading over a
 * sticky section rail and a stack of section cards, closed by an action row.
 *
 * Each form used to re-derive that layout with its own paddings, radii and
 * sticky offsets, which is how they drifted apart. They now share these pieces.
 */

// ─── Heading ────────────────────────────────────────────────────────────────

export interface FormHeadingProps {
  title: string;
  subtitle?: string;
}

export function FormHeading({ title, subtitle }: FormHeadingProps) {
  return (
    <div className="mb-6">
      <h1
        className="text-ifr-text-primary m-0"
        style={{
          fontFamily: "var(--ifr-font-heading)",
          fontSize: "var(--ifr-fs-xl)",
          fontWeight: "var(--ifr-fw-bold)",
          lineHeight: "36px",
        }}
      >
        {title}
      </h1>
      {subtitle && (
        <p
          className="text-ifr-text-secondary m-0 mt-2 max-w-[791px]"
          style={{
            fontFamily: "var(--ifr-font-body)",
            fontSize: "var(--ifr-fs-base)",
            fontWeight: "var(--ifr-fw-regular)",
            lineHeight: "21px",
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}

// ─── Section rail ───────────────────────────────────────────────────────────

export interface FormNavItem {
  /** Anchor id for in-page rails, or any stable key for link rails. */
  id: string;
  label: React.ReactNode;
  /** Appends the red asterisk the prototype puts on mandatory sections. */
  required?: boolean;
  /** When set the entry navigates instead of scrolling (the edit flows). */
  href?: string;
}

export interface FormNavRailProps {
  items: FormNavItem[];
  activeId?: string;
  onSelect?: (id: string) => void;
  ariaLabel: string;
}

export function FormNavRail({ items, activeId, onSelect, ariaLabel }: FormNavRailProps) {
  return (
    // A long form needs its jump list on a phone more than on a desktop, so
    // instead of dropping it the rail lies down into a scrollable strip.
    <nav
      className="bg-ifr-surface border border-ifr flex flex-row lg:flex-col gap-3 lg:gap-4 overflow-x-auto lg:overflow-visible overscroll-x-contain p-3 lg:py-[33px] lg:px-[33px]"
      style={{ borderRadius: "var(--ifr-radius-lg)" }}
      aria-label={ariaLabel}
    >
      {items.map(item => {
        const isActive = activeId === item.id;
        const className = `text-left shrink-0 whitespace-nowrap border-none cursor-pointer transition-colors bg-transparent p-0 no-underline ${
          isActive ? "text-ifr-text-primary" : "text-ifr-text-secondary hover:text-ifr-text-primary"
        }`;
        const style = {
          fontFamily: "var(--ifr-font-body)",
          fontSize: "var(--ifr-fs-base)",
          fontWeight: isActive ? "var(--ifr-fw-medium)" : "var(--ifr-fw-regular)",
          lineHeight: "24px",
        };
        const label = (
          <>
            {item.label}
            {item.required && <span style={{ color: "var(--ifr-red)" }}>{" *"}</span>}
          </>
        );

        if (item.href) {
          return (
            <Link key={item.id} href={item.href}>
              <a className={className} style={style} aria-current={isActive ? "page" : undefined}>
                {label}
              </a>
            </Link>
          );
        }

        return (
          <button key={item.id} type="button" onClick={() => onSelect?.(item.id)} className={className} style={style}>
            {label}
          </button>
        );
      })}
    </nav>
  );
}

/**
 * Tracks which section is in view and scrolls to one on demand. Shared so the
 * rails all highlight at the same point in the scroll.
 */
export function useSectionScrollSpy(ids: string[]) {
  const [activeId, setActiveId] = useState<string>("");
  const key = ids.join("|");

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        }
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: 0 }
    );

    for (const id of key.split("|")) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [key]);

  const scrollTo = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  return { activeId, scrollTo };
}

// ─── Two-column body ────────────────────────────────────────────────────────

export interface FormColumnsProps {
  nav?: React.ReactNode;
  children: React.ReactNode;
}

export function FormColumns({ nav, children }: FormColumnsProps) {
  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {nav && (
        <div className="lg:shrink-0" style={{ width: "var(--ifr-form-sidebar-width)", maxWidth: "100%" }}>
          <div className="lg:sticky lg:top-6">{nav}</div>
        </div>
      )}
      <div className="flex-1 min-w-0 flex flex-col gap-6">{children}</div>
    </div>
  );
}

// ─── Section card ───────────────────────────────────────────────────────────

export interface FormSectionProps {
  id?: string;
  /** Marker tint; pick one from `formAccents`. Defaults to the design green. */
  accent?: string;
  children: React.ReactNode;
}

export function FormSection({ id, accent = formAccents.design, children }: FormSectionProps) {
  return (
    <section
      id={id}
      className="bg-ifr-surface border border-ifr scroll-mt-6"
      style={{ borderRadius: "var(--ifr-radius-lg)" }}
    >
      <div className="flex flex-col gap-10 items-start py-6 px-4 md:py-8 md:px-[33px]">
        <FormSectionContext.Provider value={{ accent }}>{children}</FormSectionContext.Provider>
      </div>
    </section>
  );
}

// ─── Action row ─────────────────────────────────────────────────────────────

export interface FormActionsProps {
  /** Rendered on the left, ahead of the primary action. */
  secondary?: React.ReactNode;
  children: React.ReactNode;
}

export function FormActions({ secondary, children }: FormActionsProps) {
  return (
    <div
      className="ifr-form-actions flex flex-wrap items-center justify-between gap-3 pt-4"
      style={{
        borderTop: "1px solid var(--ifr-border)",
        fontFamily: "var(--ifr-font-body)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      <div className="flex flex-wrap items-center gap-2 md:gap-3">{secondary}</div>
      <div className="flex flex-wrap items-center gap-2 md:gap-3">{children}</div>
    </div>
  );
}

/** The prototype's primary button: yellow, 36px, small radius. */
export const formPrimaryButtonStyle: React.CSSProperties = {
  minWidth: "241px",
  height: "var(--ifr-control-height)",
  borderRadius: "var(--ifr-radius-sm)",
  color: "var(--ifr-text-primary)",
  fontFamily: "var(--ifr-font-body)",
  fontSize: "var(--ifr-fs-base)",
  fontWeight: "var(--ifr-fw-medium)",
  lineHeight: "20px",
  padding: "0 24px",
};

export const formPrimaryButtonClass =
  "flex items-center justify-center gap-2 border-none cursor-pointer transition-colors bg-ifr-yellow hover:bg-ifr-yellow-hover disabled:opacity-50 disabled:cursor-not-allowed";

/** The prototype's plain outlined button, used for discard/cancel. */
export const formSecondaryButtonStyle: React.CSSProperties = {
  minWidth: "231px",
  height: "var(--ifr-control-height)",
  borderRadius: "var(--ifr-radius-sm)",
  border: "1px solid var(--ifr-border)",
  fontFamily: "var(--ifr-font-body)",
  fontSize: "var(--ifr-fs-base)",
  fontWeight: "var(--ifr-fw-medium)",
  lineHeight: "20px",
};

export const formSecondaryButtonClass =
  "flex items-center justify-center gap-2 bg-ifr-surface hover:bg-ifr-hover transition-colors text-ifr-text-primary cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";

export { FormSectionContext, formAccents };
