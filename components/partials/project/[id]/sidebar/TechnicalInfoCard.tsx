import { Card, Stack, Text } from "@bbtgnn/polaris-interfacer";
import { Renew, Tools } from "@carbon/icons-react";
import { useProject } from "components/layout/FetchProjectLayout";
import ProjectDisplay from "components/ProjectDisplay";
import ProjectLicenses from "components/ProjectLicenses";
import { useTranslation } from "next-i18next";
import Link from "next/link";

const TechnicalInfoCard = () => {
  const { t } = useTranslation("common");
  const { project } = useProject();
  const declarations = project.metadata?.declarations;
  const haveDeclarations = declarations?.recyclable === "yes" || declarations?.repairable === "yes";
  const licenses = project.metadata?.licenses?.length > 0 && project?.metadata?.licenses;
  const design = project.metadata?.design;

  if (!(licenses || design || haveDeclarations)) return null;

  return (
    <Card sectioned>
      <Stack vertical spacing="loose">
        {licenses && <ProjectLicenses project={project} />}
        {design && (
          <div className="border rounded bg-surface-subdued p-1" id="linked-design">
            <Link href={`/project/${design}`}>
              <a>
                <ProjectDisplay projectId={design} isProductDesign />
              </a>
            </Link>
          </div>
        )}
        <Stack vertical spacing="tight">
          {" "}
          {declarations.recyclable === "yes" && (
            <div className="flex items-center space-x-2 text-primary">
              <Tools />
              <Text as="p" variant="bodyMd" fontWeight="medium" id="recycling-availability">
                {t("Available for recycling")}
              </Text>
            </div>
          )}
          {declarations.repairable === "yes" && (
            <div className="flex items-center space-x-2 text-primary">
              <Renew />
              <Text as="p" variant="bodyMd" fontWeight="medium" id="repairing-availability">
                {t("Available for repair")}
              </Text>
            </div>
          )}
        </Stack>
      </Stack>
    </Card>
  );
};

export default TechnicalInfoCard;
