import { Card, Link as PLink, Stack, Text } from "@bbtgnn/polaris-interfacer";
import { Renew, Tools } from "@carbon/icons-react";
import { Link as ILink } from "components/AddLink";
import ExternalLinkIcon from "components/brickroom/ExternalLinkIcon";
import { useProject } from "components/layout/FetchProjectLayout";
import ProjectDisplay from "components/ProjectDisplay";
import ProjectLicenses from "components/ProjectLicenses";
import { useTranslation } from "next-i18next";
import Link from "next/link";

const TechnicalInfoCard = () => {
  const { t } = useTranslation();
  const { project } = useProject();

  const declarations = project.metadata?.declarations;
  const haveDeclarations = declarations?.recyclable === "yes" || declarations?.repairable === "yes";
  const licenses = project.metadata?.licenses?.length && project?.metadata?.licenses;
  const design = project.metadata?.design;
  const certifications: Array<ILink> | undefined = project.metadata?.declarations?.certifications;

  if (!(licenses || design || haveDeclarations || certifications?.length)) return null;

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
          {declarations?.recyclable === "yes" && (
            <div className="flex items-center space-x-2 text-primary">
              <Tools />
              <Text as="p" variant="bodyMd" fontWeight="medium" id="recycling-availability">
                {t("Available for recycling")}
              </Text>
            </div>
          )}
          {declarations?.repairable === "yes" && (
            <div className="flex items-center space-x-2 text-primary">
              <Renew />
              <Text as="p" variant="bodyMd" fontWeight="medium" id="repairing-availability">
                {t("Available for repair")}
              </Text>
            </div>
          )}
        </Stack>

        {certifications?.length && (
          <div>
            <Text as="h3" variant="headingMd" fontWeight="bold">
              {t("Certifications")}
            </Text>
            <ul className="list-disc pl-4 space-y-1 mt-1">
              {certifications.map((c, i) => (
                <li key={c.url}>
                  <PLink>
                    <a className="flex items-center space-x-1" href={c.url} target="_blank" rel="noreferrer">
                      <Text as="p" variant="bodyMd">
                        {c.label}
                      </Text>
                      <ExternalLinkIcon className="w-3 h-3 fill-interactive" />
                    </a>
                  </PLink>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Stack>
    </Card>
  );
};

export default TechnicalInfoCard;
