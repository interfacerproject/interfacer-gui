import { Stack, Tabs } from "@bbtgnn/polaris-interfacer";
import { Cube, Events, ListBoxes, ParentChild, Purchase } from "@carbon/icons-react";
import ContributionsTable from "components/ContributionsTable";
import ContributorsTable from "components/ContributorsTable";
import { useProject } from "components/layout/FetchProjectLayout";
import ProjectDetailOverview from "components/ProjectDetailOverview";
import RelationshipTree from "components/RelationshipTree";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { useProjectTabs } from "pages/project/[id]";
import { useCallback, useEffect, useState } from "react";
import ProjectDpp from "./ProjectDpp";

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
            id: "dpp",
            content: (
              <span className="flex items-center gap-2">
                <Purchase />
                {t("DPP")}
              </span>
            ),
            accessibilityLabel: t("Digital Product Passport"),
            panelID: "dpp-content",
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
            panelID: "dpp-content",
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
        ]}
        selected={selected}
        onSelect={handleTabChange}
      />

      {selected == 0 && <ProjectDetailOverview project={project} />}
      {selected == 1 && <RelationshipTree project={project} />}
      {selected == 2 && <ProjectDpp id={project.id!} />}

      {selected == 3 && (
        <ContributorsTable
          contributors={project.metadata?.contributors}
          title={t("Contributors")}
          // @ts-ignore
          data={project.trace?.filter((t: any) => !!t.hasPointInTime)[0].hasPointInTime}
        />
      )}
      {selected == 4 && <ContributionsTable id={String(id)} title={t("Contributions")} />}
    </Stack>
  );
};

export default ProjectTabs;
