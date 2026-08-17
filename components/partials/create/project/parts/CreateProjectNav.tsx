import { getSectionsByProjectType } from "components/partials/project/projectSections";
import { ProjectType } from "components/types";
import { useTranslation } from "next-i18next";
import { useCallback, useEffect, useState } from "react";

export interface Props {
  projectType: ProjectType;
}

export default function CreateProjectNav(props: Props) {
  const { t } = useTranslation("createProjectProps");
  const { projectType } = props;
  const [activeId, setActiveId] = useState<string>("");

  const sections = getSectionsByProjectType(projectType);

  // Scroll-spy: track which section is in view
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: 0 }
    );

    for (const section of sections) {
      const el = document.getElementById(section.id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [sections]);

  const scrollTo = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  return (
    // A long form needs its jump list on a phone more than on a desktop, so
    // instead of dropping it the rail lies down into a scrollable strip.
    <nav
      className="bg-ifr-surface border border-ifr flex flex-row lg:flex-col gap-3 lg:gap-2 overflow-x-auto lg:overflow-visible overscroll-x-contain p-3 lg:p-6"
      style={{ borderRadius: "var(--ifr-radius-md)" }}
      aria-label={t("Sections")}
    >
      {sections
        .filter(section => !section.hideInNavByType?.[projectType])
        .map(section => {
          const isActive = activeId === section.id;
          const isRequired = section.required?.includes(projectType);

          return (
            <button
              key={section.id}
              type="button"
              onClick={() => scrollTo(section.id)}
              className="text-left shrink-0 whitespace-nowrap border-none cursor-pointer transition-colors bg-transparent hover:opacity-70 py-1 lg:py-1"
              style={{
                fontFamily: "var(--ifr-font-body)",
                fontSize: "var(--ifr-fs-base)",
                fontWeight: isActive ? "var(--ifr-fw-semibold)" : "var(--ifr-fw-medium)",
                color: "var(--ifr-text-primary)",
              }}
            >
              {section.navLabelByType?.[projectType] || section.navLabel}
              {isRequired && <span style={{ color: "var(--ifr-red)" }}>{" *"}</span>}
            </button>
          );
        })}
    </nav>
  );
}
