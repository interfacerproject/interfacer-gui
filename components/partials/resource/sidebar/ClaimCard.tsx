import { Button, Card, Icon, Stack } from "@bbtgnn/polaris-interfacer";
import { LinkMinor } from "@shopify/polaris-icons";
import { useProject } from "components/layout/FetchProjectLayout";
import { useAuth } from "hooks/useAuth";
import { useTranslation } from "next-i18next";
import router from "next/router";

const ClaimCard = () => {
  const { project } = useProject();
  const { t } = useTranslation("common");
  const { user } = useAuth();
  const handleClaim = () => router.push(`/resource/${project.id}/claim`);
  return (
    <Card sectioned>
      <Stack vertical>
        {user && (
          <Button primary size="large" fullWidth onClick={handleClaim}>
            {t("Import")}
          </Button>
        )}
        {project.repo && (
          <Button url={project.repo} icon={<Icon source={LinkMinor} />} fullWidth size="large">
            {t("Project data")}
          </Button>
        )}
      </Stack>
    </Card>
  );
};

export default ClaimCard;
