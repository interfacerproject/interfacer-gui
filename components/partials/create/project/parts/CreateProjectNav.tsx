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
    <nav className="bg-ifr-surface border border-ifr rounded-ifr-md p-4 flex flex-col gap-1" aria-label={t("Sections")}>
      <p
        className="text-ifr-text-secondary m-0 mb-2 px-3"
        style={{
          fontFamily: "var(--ifr-font-body)",
          fontSize: "var(--ifr-fs-sm)",
          fontWeight: "var(--ifr-fw-semibold)",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        {t("Sections")}
      </p>
      {sections.map(section => {
        const isActive = activeId === section.id;
        const isRequired = section.required?.includes(projectType);

        return (
          <button
            key={section.id}
            type="button"
            onClick={() => scrollTo(section.id)}
            className={`text-left px-3 py-2 border-none cursor-pointer transition-colors rounded-sm ${
              isActive ? "bg-ifr-hover" : "bg-transparent hover:bg-ifr-hover/50"
            }`}
            style={{
              fontFamily: "var(--ifr-font-body)",
              fontSize: "var(--ifr-fs-base)",
              fontWeight: isActive ? "var(--ifr-fw-semibold)" : "var(--ifr-fw-medium)",
              color: isActive ? "var(--ifr-text-primary)" : "var(--ifr-text-secondary)",
              borderRadius: "var(--ifr-radius-sm)",
            }}
          >
            {section.navLabel}
            {isRequired && <span style={{ color: "var(--ifr-green)" }}>{" *"}</span>}
          </button>
        );
      })}
    </nav>
  );
}
