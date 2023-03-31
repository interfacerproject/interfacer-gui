import { useQuery } from "@apollo/client";
import { Button, Card, Stack, Text } from "@bbtgnn/polaris-interfacer";
import { ListBoxes, MagicWand } from "@carbon/icons-react";
import { useProject } from "components/layout/FetchProjectLayout";
import ProjectContributors from "components/ProjectContributors";
import { QUERY_RESOURCE_PROPOSAlS } from "lib/QueryAndMutation";
import { ResourceProposalsQuery, ResourceProposalsQueryVariables } from "lib/types";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { useProjectTabs } from "pages/project/[id]";
import QRCode from "react-qr-code";

const ContributionsCard = () => {
  const { project } = useProject();
  const { setSelected } = useProjectTabs();
  const { t } = useTranslation("common");
  const router = useRouter();
  const { id } = router.query;

  const { data: contributions } = useQuery<ResourceProposalsQuery, ResourceProposalsQueryVariables>(
    QUERY_RESOURCE_PROPOSAlS,
    {
      variables: { id: id as string },
    }
  );

  return (
    <Card sectioned>
      <Stack vertical>
        <Text as="h2" variant="headingMd">
          {t("Contributions")}
        </Text>
        <Text color="success" as="p" variant="bodyMd" id="sidebar-contributors">
          {t("{{contributors}} contributors", { contributors: project.metadata?.contributors?.length || 0 })}
        </Text>
        {project.metadata?.contributors?.length && <ProjectContributors projectNode={project} />}
        <Text color="success" as="p" variant="bodyMd">
          {t("{{contributions}} contributions", { contributions: contributions?.proposals.edges.length })}
        </Text>
        <Button
          id="contribute"
          icon={<MagicWand />}
          size="large"
          fullWidth
          primary
          onClick={() => router.push(`/create/contribution/${project.id}`)}
        >
          {t("Make a contribution")}
        </Button>
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
        <Text as="h2" variant="headingMd">
          {t("Dpp Qr-Code")}
        </Text>
        <QRCode size={128} value={project.id || ""} />
      </Stack>
    </Card>
  );
};

export default ContributionsCard;
