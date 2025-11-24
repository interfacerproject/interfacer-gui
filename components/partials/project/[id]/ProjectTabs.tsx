import { Stack, Tabs } from "@bbtgnn/polaris-interfacer";
import { Cube, Events, ListBoxes, ParentChild, Purchase } from "@carbon/icons-react";
import { useProject } from "components/layout/FetchProjectLayout";
import ProjectDetailOverview from "components/ProjectDetailOverview";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { useProjectTabs } from "pages/project/[id]";
import { useCallback } from "react";
import dynamic from "next/dynamic";

const DynamicProjectDpp = dynamic(() => import("./ProjectDpp"), { ssr: false });
const RelationshipTree = dynamic(() => import("components/RelationshipTree"), { ssr: false });
const ContributorsTable = dynamic(() => import("components/ContributorsTable"), { ssr: false });
const ContributionsTable = dynamic(() => import("components/ContributionsTable"), { ssr: false });
const DynamicGC1DPP = dynamic(() => import("./GC1DPP"), { ssr: false });

const ProjectTabs = () => {
  const { project } = useProject();
  const { selected, setSelected } = useProjectTabs();
  const router = useRouter();
  const { t } = useTranslation("common");
  const { id } = router.query;

  const handleTabChange = useCallback((selectedTabIndex: number) => setSelected(selectedTabIndex), [setSelected]);

  return (
    <Stack vertical spacing="loose">
      <Tabs
        tabs={[
          {
            id: "overview",
            content: (
              <span className="flex items-center gap-2">
                <Cube />
                {t("Overview")}
              </span>
            ),
            accessibilityLabel: t("Project overview"),
            panelID: "overview-content",
          },
          {
            id: "relationships",
            content: (
              <span className="flex items-center gap-2">
                <ParentChild />
                {t("Included")}
              </span>
            ),
            accessibilityLabel: t("Relationship tree"),
            panelID: "relationships-content",
          },
          {
            id: "graph",
            content: (
              <span className="flex items-center gap-2">
                <Purchase />
                {t("Graph")}
              </span>
            ),
            accessibilityLabel: t("Digital Product Passport"),
            panelID: "graph-content",
          },
          {
            id: "Contributors",
            content: (
              <span className="flex items-center gap-2">
                <Events />
                {t("Contributors")}
              </span>
            ),
            accessibilityLabel: t("Contributors"),
            panelID: "contributors-content",
          },
          {
            id: "Contributions",
            content: (
              <span className="flex items-center gap-2">
                <ListBoxes />
                {t("Contributions")}
              </span>
            ),
            accessibilityLabel: t("Contributions"),
            panelID: "contributions-content",
          },
          {
            id: "dpp",
            content: (
              <span className="flex items-center gap-2">
                <Purchase />
                {t("DPP")}
              </span>
            ),
            accessibilityLabel: t("Digital Product Passport"),
            panelID: "dpp-content",
          }
        ]}
        selected={selected}
        onSelect={handleTabChange}
      />

      {selected == 0 && <ProjectDetailOverview project={project} />}
      {selected == 1 && <RelationshipTree project={project} />}
      {selected == 2 && <DynamicProjectDpp id={project.id!} />}

      {selected == 3 && (
        <ContributorsTable
          contributors={project.metadata?.contributors}
          title={t("Contributors")}
          // @ts-ignore
          data={project.trace?.filter((t: any) => !!t.hasPointInTime)[0].hasPointInTime}
        />
      )}
      {selected == 4 && <ContributionsTable id={String(id)} title={t("Contributions")} />}
      {selected == 5 && <DynamicGC1DPP ulid={project.metadata?.dpp} />}
    </Stack>
  );
};

export default ProjectTabs;
