import { gql, useQuery } from "@apollo/client";
import { Stack, Tabs } from "@bbtgnn/polaris-interfacer";
import { Cube, Events, ListBoxes, ParentChild, Purchase } from "@carbon/icons-react";
import { useProject } from "components/layout/FetchProjectLayout";
import ProjectDetailOverview from "components/ProjectDetailOverview";
import { useTranslation } from "next-i18next";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useProjectTabs } from "pages/project/[id]";
import { useCallback, useMemo } from "react";

const DynamicProjectDpp = dynamic(() => import("./ProjectDpp"), { ssr: false });
const RelationshipTree = dynamic(() => import("components/RelationshipTree"), { ssr: false });
const ContributorsTable = dynamic(() => import("components/ContributorsTable"), { ssr: false });
const ContributionsTable = dynamic(() => import("components/ContributionsTable"), { ssr: false });
const DynamicGC1DPP = dynamic(() => import("./GC1DPP"), { ssr: false });

// Query to get traceDpp for extracting DPP service ULID and machines
const QUERY_TRACE_DPP = gql`
  query getTraceDpp($id: ID!) {
    economicResource(id: $id) {
      traceDpp
    }
  }
`;

// Helper function to recursively find DPP service ULID and machines from traceDpp tree
function extractFromTraceDpp(traceDpp: any[]): { dppServiceUlid?: string; machines: any[] } {
  let dppServiceUlid: string | undefined;
  const machines: any[] = [];

  function traverse(node: any) {
    if (!node) return;

    // Check if this node is an EconomicResource with dppServiceUlid in metadata
    if (node.type === "EconomicResource" && node.node?.metadata?.dppServiceUlid) {
      dppServiceUlid = node.node.metadata.dppServiceUlid;
    }

    // Check if this is a machine resource (you could add machine detection logic here)
    // For now, we'll identify machines by their conformsTo or other properties

    // Traverse children
    if (node.children && Array.isArray(node.children)) {
      node.children.forEach(traverse);
    }
  }

  if (Array.isArray(traceDpp)) {
    traceDpp.forEach(traverse);
  }

  return { dppServiceUlid, machines };
}

const ProjectTabs = () => {
  const { project } = useProject();
  const { selected, setSelected } = useProjectTabs();
  const router = useRouter();
  const { t } = useTranslation("common");
  const { id } = router.query;

  // Query traceDpp to extract DPP service ULID
  const { data: traceDppData } = useQuery(QUERY_TRACE_DPP, {
    variables: { id: project?.id },
    skip: !project?.id,
  });

  // Extract dppServiceUlid and machines from traceDpp
  const { dppServiceUlid, machines } = useMemo(() => {
    if (!traceDppData?.economicResource?.traceDpp) {
      return { dppServiceUlid: undefined, machines: [] };
    }
    return extractFromTraceDpp(traceDppData.economicResource.traceDpp);
  }, [traceDppData]);

  // Fallback to legacy metadata.dpp if no cited DPP resource found
  const dppUlid = dppServiceUlid || project.metadata?.dpp;

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
          },
        ]}
        selected={selected}
        onSelect={handleTabChange}
      />

      {selected == 0 && <ProjectDetailOverview project={project} machines={machines} />}
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
      {selected == 5 && <DynamicGC1DPP ulid={dppUlid} />}
    </Stack>
  );
};

export default ProjectTabs;
