import type { CarbonIconType } from "@carbon/icons-react";
import {
  Checkmark,
  Chip,
  Construction,
  DeskAdjustable,
  Education,
  Home,
  Lightning,
  Medication,
  Sprout,
  Tools,
  Watch,
} from "@carbon/icons-react";

/**
 * Selection controls in the prototype's vocabulary.
 *
 * The prototype never draws a bare browser checkbox. A multi-select is a row
 * of tappable cards — a bordered control that turns green when chosen, with an
 * icon tile where the options have identities of their own — and a lone
 * boolean is a switch. These are the pieces that produce that.
 */

// ─── Group wrapper ──────────────────────────────────────────────────────────

export interface OptionGroupProps {
  label: string;
  required?: boolean;
  helpText?: string;
  children: React.ReactNode;
}

/** Field label over a grid of options, with the help line underneath. */
export function OptionGroup({ label, required, helpText, children }: OptionGroupProps) {
  return (
    <div className="flex flex-col gap-[6px] w-full">
      <p
        className="text-ifr-text-primary m-0"
        style={{
          fontFamily: "var(--ifr-font-body)",
          fontSize: "var(--ifr-fs-base)",
          fontWeight: "var(--ifr-fw-medium)",
          lineHeight: "24px",
        }}
      >
        {label}
        {required && <span style={{ color: "var(--ifr-red)" }}>{" *"}</span>}
      </p>
      {children}
      {helpText && (
        <p
          className="text-ifr-text-secondary m-0"
          style={{
            fontFamily: "var(--ifr-font-body)",
            fontSize: "var(--ifr-fs-base)",
            fontWeight: "var(--ifr-fw-regular)",
          }}
        >
          {helpText}
        </p>
      )}
    </div>
  );
}

/** Two options per row from `sm` up, as in the prototype; one on a phone. */
export function OptionGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">{children}</div>;
}

// ─── Checkable option ───────────────────────────────────────────────────────

export interface CheckOptionProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** Radios look identical here; only the semantics differ. */
  type?: "checkbox" | "radio";
  name?: string;
}

/**
 * One option as a full-height bordered control. The native input stays in the
 * DOM for keyboard and assistive tech but is visually replaced by a 16px box
 * that fills green when chosen.
 */
export function CheckOption({ label, checked, onChange, type = "checkbox", name }: CheckOptionProps) {
  return (
    <label
      className="flex items-center gap-3 bg-ifr-surface cursor-pointer select-none px-[13px] transition-colors hover:bg-ifr-hover-light focus-within:border-ifr-green"
      style={{
        minHeight: "var(--ifr-control-height)",
        borderRadius: "var(--ifr-radius-md)",
        border: `1px solid ${checked ? "var(--ifr-green)" : "var(--ifr-border)"}`,
        fontFamily: "var(--ifr-font-body)",
        fontSize: "var(--ifr-fs-base)",
        fontWeight: "var(--ifr-fw-medium)",
      }}
    >
      <span
        aria-hidden
        className={`flex items-center justify-center shrink-0 ${checked ? "bg-ifr-green" : "bg-ifr-surface"}`}
        style={{
          width: "16px",
          height: "16px",
          borderRadius: type === "radio" ? "var(--ifr-radius-full)" : "var(--ifr-radius-sm)",
          border: checked ? "none" : "1px solid var(--ifr-border)",
          boxShadow: "var(--ifr-shadow-sm)",
        }}
      >
        {checked && <Checkmark size={12} className="fill-white" />}
      </span>
      <input type={type} name={name} checked={checked} onChange={e => onChange(e.target.checked)} className="sr-only" />
      <span className="text-ifr-text-primary py-2">{label}</span>
    </label>
  );
}

// ─── Category card ──────────────────────────────────────────────────────────

export interface CategoryVisual {
  Icon: CarbonIconType;
  color: string;
  bg: string;
}

/**
 * Icon and tint per product category, taken from the prototype. Categories it
 * does not cover fall back to the neutral treatment it gives Tools.
 */
const neutralVisual: CategoryVisual = { Icon: Tools, color: "#6c707c", bg: "#f3f3f4" };

/** Exported so other surfaces (e.g. the homepage category chips) show the same icon per category. */
export const categoryVisuals: Record<string, CategoryVisual> = {
  Electronics: { Icon: Chip, color: "#f1bd4d", bg: "#fefaf0" },
  Tools: neutralVisual,
  Furniture: { Icon: DeskAdjustable, color: "#6c707c", bg: "#f3f3f4" },
  "Home renovation": { Icon: Construction, color: "#1447e6", bg: "rgba(200,212,229,0.25)" },
  Home: { Icon: Home, color: "#1447e6", bg: "rgba(200,212,229,0.25)" },
  Energy: { Icon: Lightning, color: "#f1bd4d", bg: "rgba(241,189,77,0.08)" },
  Wearables: { Icon: Watch, color: "#5da091", bg: "rgba(93,160,145,0.08)" },
  Medical: { Icon: Medication, color: "#c5281d", bg: "rgba(197,40,29,0.08)" },
  Sustainability: { Icon: Sprout, color: "#036a53", bg: "rgba(3,106,83,0.08)" },
  Education: { Icon: Education, color: "#1447e6", bg: "#f1f4f8" },
};

export interface CategoryOptionProps {
  /** Untranslated option, used to look the icon up. */
  value: string;
  label: string;
  selected: boolean;
  onToggle: () => void;
}

/** A category as the prototype's 65px card: tinted icon tile beside the name. */
export function CategoryOption({ value, label, selected, onToggle }: CategoryOptionProps) {
  const { Icon, color, bg } = categoryVisuals[value] ?? neutralVisual;

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={selected}
      className="flex items-center gap-3 bg-ifr-surface cursor-pointer min-w-[180px] flex-1 max-w-[220px] hover:bg-ifr-hover-light transition-colors"
      style={{
        height: "65px",
        borderRadius: "var(--ifr-radius-md)",
        border: selected ? "2px solid var(--ifr-green)" : "1px solid var(--ifr-border)",
        // Keep the label still when the border thickens on selection.
        padding: selected ? "12px 16px" : "13px 17px",
      }}
    >
      <span
        aria-hidden
        className="flex items-center justify-center shrink-0"
        style={{ width: "32px", height: "32px", borderRadius: "var(--ifr-radius-md)", backgroundColor: bg, color }}
      >
        <Icon size={16} />
      </span>
      <span
        className="text-ifr-text-primary text-left"
        style={{
          fontFamily: "var(--ifr-font-body)",
          fontSize: "var(--ifr-fs-base)",
          fontWeight: "var(--ifr-fw-medium)",
        }}
      >
        {label}
      </span>
    </button>
  );
}

/** Cards wrap and share the row, rather than sitting in fixed columns. */
export function CategoryGrid({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap gap-3 w-full">{children}</div>;
}

// ─── Switch ─────────────────────────────────────────────────────────────────

export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** Names the control for assistive tech when no visible label sits beside it. */
  ariaLabel?: string;
}

export function Toggle({ checked, onChange, ariaLabel }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={() => onChange(!checked)}
      className="relative shrink-0 cursor-pointer border-none p-0"
      style={{
        width: "32px",
        height: "18px",
        borderRadius: "var(--ifr-radius-full)",
        backgroundColor: checked ? "var(--ifr-switch-on)" : "var(--ifr-switch-off)",
        transition: "background-color 150ms ease",
      }}
    >
      <span
        className="absolute top-[1px] bg-white rounded-full"
        style={{
          width: "16px",
          height: "16px",
          left: checked ? "15px" : "1px",
          transition: "left 150ms ease",
          boxShadow: "var(--ifr-shadow-toggle)",
        }}
      />
    </button>
  );
}

export interface ToggleFieldProps extends ToggleProps {
  label: string;
  description?: string;
}

/** A lone boolean: name and explanation on the left, switch on the right. */
export function ToggleField({ label, description, checked, onChange }: ToggleFieldProps) {
  return (
    <div className="flex items-center justify-between gap-4 w-full">
      <div className="flex flex-col gap-1">
        <span
          className="text-ifr-text-primary"
          style={{
            fontFamily: "var(--ifr-font-body)",
            fontSize: "var(--ifr-fs-base)",
            fontWeight: "var(--ifr-fw-medium)",
            lineHeight: "21px",
          }}
        >
          {label}
        </span>
        {description && (
          <span
            className="text-ifr-text-secondary"
            style={{
              fontFamily: "var(--ifr-font-body)",
              fontSize: "var(--ifr-fs-sm)",
              fontWeight: "var(--ifr-fw-regular)",
              lineHeight: "18px",
            }}
          >
            {description}
          </span>
        )}
      </div>
      <Toggle checked={checked} onChange={onChange} ariaLabel={label} />
    </div>
  );
}
