import { Button, Card, Icon, Stack, Text } from "@bbtgnn/polaris-interfacer";
import { LinkMinor } from "@shopify/polaris-icons";
import DetailMap from "components/DetailMap";
import BrUserDisplay from "components/brickroom/BrUserDisplay";
import { useProject } from "components/layout/FetchProjectLayout";
import { useAuth } from "hooks/useAuth";
import { useTranslation } from "next-i18next";

const SocialCard = () => {
  const { authenticated } = useAuth();
  const { project } = useProject();
  const { t } = useTranslation("common");
  return (
    <Card sectioned>
      <Stack vertical>
        {project.repo && (
          <Button primary url={project.repo} icon={<Icon source={LinkMinor} />} fullWidth size="large">
            {t("Project data")}
          </Button>
        )}
        <div className="space-y-4">
          {project.currentLocation && (
            <div>
              <Text as="p" variant="bodyMd">
                {t("Project location:")}
              </Text>
              <div className="mt-1">
                <DetailMap location={project.currentLocation} height={180} />
              </div>
            </div>
          )}
          {authenticated && (
            <div>
              <Text as="p" variant="bodyMd">
                {t("Project by:")}
              </Text>
              <BrUserDisplay userId={project.primaryAccountable!.id} />
            </div>
          )}
        </div>
      </Stack>
    </Card>
  );
};

export default SocialCard;
