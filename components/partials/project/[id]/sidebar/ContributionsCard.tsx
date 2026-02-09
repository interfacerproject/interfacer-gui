import { gql, useQuery } from "@apollo/client";
import { Button, Card, Stack, Text } from "@bbtgnn/polaris-interfacer";
import { ListBoxes, MagicWand } from "@carbon/icons-react";
import { useProject } from "components/layout/FetchProjectLayout";
import ProjectContributors from "components/ProjectContributors";
import { useAuth } from "hooks/useAuth";
import { QUERY_RESOURCE_PROPOSAlS } from "lib/QueryAndMutation";
import { ResourceProposalsQuery, ResourceProposalsQueryVariables } from "lib/types";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { useProjectTabs } from "pages/project/[id]";
import { useMemo } from "react";
import QRCode from "react-qr-code";

// Query to get traceDpp for extracting DPP service ULID
const QUERY_TRACE_DPP = gql`
  query getTraceDpp($id: ID!) {
    economicResource(id: $id) {
      traceDpp
    }
  }
`;

// Helper function to recursively find DPP service ULID from traceDpp tree
function extractDppServiceUlid(traceDpp: any[]): string | undefined {
  let dppServiceUlid: string | undefined;

  function traverse(node: any) {
    if (!node || dppServiceUlid) return;

    if (node.type === "EconomicResource" && node.node?.metadata?.dppServiceUlid) {
      dppServiceUlid = node.node.metadata.dppServiceUlid;
      return;
    }

    if (node.children && Array.isArray(node.children)) {
      node.children.forEach(traverse);
    }
  }

  if (Array.isArray(traceDpp)) {
    traceDpp.forEach(traverse);
  }

  return dppServiceUlid;
}

const ContributionsCard = () => {
  const { project } = useProject();
  const { setSelected } = useProjectTabs();
  const { t } = useTranslation("common");
  const router = useRouter();
  const { id } = router.query;
  const { authenticated } = useAuth();

  const { data: contributions } = useQuery<ResourceProposalsQuery, ResourceProposalsQueryVariables>(
    QUERY_RESOURCE_PROPOSAlS,
    {
      variables: { id: id as string },
    }
  );
  const { data: traceDppData } = useQuery(QUERY_TRACE_DPP, {
    variables: { id: project?.id },
    skip: !project?.id,
  });
  const url = window.location.protocol + "//" + window.location.host + `/project/${project.id}?tab=gc1dpp`;
  const dppServiceUlid = useMemo(() => {
    if (!traceDppData?.economicResource?.traceDpp) return undefined;
    return extractDppServiceUlid(traceDppData.economicResource.traceDpp);
  }, [traceDppData]);
  const dppUlid = dppServiceUlid || project.metadata?.dpp;
  const showDppQr = project.conformsTo?.name === "Product" && !!dppUlid;

  const contributionsCount = contributions?.proposals.edges.length || 0;

  return (
    <Card sectioned>
      <Stack vertical>
        <Text as="h2" variant="headingMd">
          {t("Contributions")}
        </Text>
        {authenticated && (
          <>
            <Text color="success" as="p" variant="bodyMd" id="sidebar-contributors">
              {t("{{contributors}} contributors", { contributors: project.metadata?.contributors?.length || 0 })}
            </Text>
            {project.metadata?.contributors?.length && <ProjectContributors projectNode={project} />}
          </>
        )}
        {contributionsCount > 0 && (
          <>
            <Text color="success" as="p" variant="bodyMd">
              {t("{{contributions}} contributions", { contributions: contributionsCount })}
            </Text>
            <Button
              id="seeContributions"
              icon={<ListBoxes />}
              size="large"
              fullWidth
              monochrome
              onClick={() => setSelected(4)}
            >
              {t("All contributions")}
            </Button>
          </>
        )}
        <Button
          id="contribute"
          icon={<MagicWand />}
          size="large"
          fullWidth
          primary
          onClick={() => router.push(`/project/${project.id}/propose_contribution`)}
        >
          {t("Make a contribution")}
        </Button>
        {showDppQr && (
          <>
            <Text as="h2" variant="headingMd">
              {t("DPP QR-Code")}
            </Text>
            <QRCode size={128} value={url} />
          </>
        )}
      </Stack>
    </Card>
  );
};

export default ContributionsCard;
