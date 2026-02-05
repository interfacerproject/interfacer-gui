import { gql, useQuery } from "@apollo/client";
import { Stack, Tabs } from "@bbtgnn/polaris-interfacer";
import { Cube, Events, ListBoxes, Purchase } from "@carbon/icons-react";
import { useProject } from "components/layout/FetchProjectLayout";
import ProjectDetailOverview from "components/ProjectDetailOverview";
import { useAuth } from "hooks/useAuth";
import { useTranslation } from "next-i18next";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useProjectTabs } from "pages/project/[id]";
import { useCallback, useEffect, useMemo, useState } from "react";

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
  const [pageLoaded, setPageLoaded] = useState(false);
  const { authenticated } = useAuth();

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

  // Map tab IDs to their indices for URL parameter handling
  const allTabsMap: Record<string, number> = {
    overview: 0,
    relationships: 1,
    included: 1,
    graph: 2,
    contributors: 3,
    contributions: 4,
    dpp: 5,
    gc1dpp: 5,
  };

  // Mark page as loaded after client-side mount and check for tab parameter
  useEffect(() => {
    setPageLoaded(true);
    if (router.query.tab) {
      const tabParam = router.query.tab as string;
      const tabIndex = allTabsMap[tabParam.toLowerCase()];
      if (tabIndex !== undefined) {
        setSelected(tabIndex);
      }
    }
  }, [router.query.tab, setSelected]);

  // Determine which tabs have content
  const tabsContentMap = useMemo(
    () => ({
      overview: !!project?.note,
      relationships: !!project?.metadata?.relations?.length,
      graph: true,
      contributors: authenticated && !!project.metadata?.contributors?.length,
      contributions: false, // Always hide contributions tab for now
      dpp: !!dppUlid, // Has DPP ULID
    }),
    [project, dppUlid, authenticated]
  );

  const allTabs = [
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
    // Commented out until backend relations query is fixed
    // {
    //   id: "relationships",
    //   content: (
    //     <span className="flex items-center gap-2">
    //       <ParentChild />
    //       {t("Included")}
    //     </span>
    //   ),
    //   accessibilityLabel: t("Relationship tree"),
    //   panelID: "relationships-content",
    // },
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
  ];

  // Filter tabs based on content and page load
  const visibleTabs = useMemo(() => {
    if (!pageLoaded) {
      return allTabs.slice(0, 1); // Show only overview initially
    }
    return allTabs.filter(tab => {
      const contentKey = tab.id.toLowerCase();
      return tabsContentMap[contentKey as keyof typeof tabsContentMap] !== false;
    });
  }, [pageLoaded, tabsContentMap, allTabs, t]);

  // Adjust selected index if current selection is hidden
  const validSelectedIndex = useMemo(() => {
    const visibleTabIds = visibleTabs.map(tab => tab.id);
    const currentTabId = allTabs[selected]?.id;
    if (currentTabId && visibleTabIds.includes(currentTabId)) {
      return visibleTabs.findIndex(tab => tab.id === currentTabId);
    }
    return 0; // Default to first visible tab
  }, [selected, visibleTabs, allTabs]);

  const handleTabChange = useCallback(
    (selectedTabIndex: number) => {
      const selectedTabId = visibleTabs[selectedTabIndex]?.id;
      const allTabIndex = allTabs.findIndex(tab => tab.id === selectedTabId);
      setSelected(allTabIndex);
    },
    [visibleTabs, allTabs, setSelected]
  );

  return (
    <Stack vertical spacing="loose">
      <Tabs tabs={visibleTabs} selected={validSelectedIndex} onSelect={handleTabChange} />

      {selected == 0 && <ProjectDetailOverview project={project} machines={machines} />}
      {/* {selected == 1 && <RelationshipTree project={project} />} */}
      {selected == 1 && <DynamicProjectDpp id={project.id!} />}

      {selected == 2 && (
        <ContributorsTable
          contributors={project.metadata?.contributors}
          title={t("Contributors")}
          // @ts-ignore
          data={project.trace?.filter((t: any) => !!t.hasPointInTime)[0].hasPointInTime}
        />
      )}
      {selected == 3 && <ContributionsTable id={String(id)} title={t("Contributions")} />}
      {selected == 4 && dppUlid && <DynamicGC1DPP ulid={dppUlid} />}
    </Stack>
  );
};

export default ProjectTabs;
