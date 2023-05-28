import { Card, Stack, Text } from "@bbtgnn/polaris-interfacer";
import LoshImportedData from "components/brickroom/LoshImportedData";
import { useProject } from "components/layout/FetchProjectLayout";
import LicenseDisplay from "components/LicenseDisplay";
import { useTranslation } from "next-i18next";

const TechnicalInfoCard = () => {
  const { t } = useTranslation("common");
  const { project } = useProject();
  const license = project?.metadata?.license;

  if (!license) return null;

  return (
    <Card sectioned>
      <Stack vertical spacing="loose">
        <LoshImportedData projectId={project.id!} />
        <Text as="h3" variant="headingMd">
          {t("Licenses")}
        </Text>
        <div className="pt-3">
          <LicenseDisplay licenseId={license} label={"Main"} />
          <span className="italic text-primary">
            {t("by")} {project?.metadata?.licensor}
          </span>
        </div>
      </Stack>
    </Card>
  );
};

export default TechnicalInfoCard;
