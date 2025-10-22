import { useCallback, useState } from "react";

export interface SectionState {
  [key: string]: boolean;
}

const SECTION_KEYS = [
  "overview",
  "repairability",
  "environmental",
  "compliance",
  "certificates",
  "recyclability",
  "energy",
  "component",
  "economicOperator",
  "repairInfo",
  "refurbishmentInfo",
  "recyclingInfo",
] as const;

export type SectionKey = (typeof SECTION_KEYS)[number];

export const useSectionStates = (initialOpen: SectionKey = "overview") => {
  const [sections, setSections] = useState<SectionState>(() =>
    SECTION_KEYS.reduce((acc, key) => {
      acc[key] = key === initialOpen;
      return acc;
    }, {} as SectionState)
  );

  const toggleSection = useCallback((key: SectionKey) => {
    setSections(prev => ({ ...prev, [key]: !prev[key] }));
  }, []);

  return { sections, toggleSection };
};
