import { createContext } from "react";

/**
 * Set by the surface that draws a form section card (see FormSection). Inside
 * one, PTitleSubtitle grows the prototype's chrome — a tinted marker and the
 * rule that separates the header from the fields — while every other caller
 * keeps the plain stacked heading.
 *
 * Lives in its own module so FormShell and PTitleSubtitle can both reach it
 * without importing each other.
 */
export interface FormSectionStyle {
  /** Background of the marker beside a section heading, tinted per entity type. */
  accent: string;
}

export const FormSectionContext = createContext<FormSectionStyle | null>(null);

/** Marker tints, one per entity the creation flows produce. */
export const formAccents = {
  design: "var(--ifr-green-bg)",
  product: "var(--ifr-type-product-bg)",
  service: "var(--ifr-type-service-bg)",
  dpp: "var(--ifr-type-dpp-bg)",
} as const;
