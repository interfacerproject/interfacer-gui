import { Stack, Text } from "@bbtgnn/polaris-interfacer";
import BrBreadcrumb from "components/brickroom/BrBreadcrumb";
import { useProject } from "components/layout/FetchProjectLayout";
import ProjectTypeChip from "components/ProjectTypeChip";
import { useTranslation } from "next-i18next";

const ProjectHeader = () => {
  const { project } = useProject();
  const { t } = useTranslation("common");
  return (
    <Stack vertical spacing="tight">
      <BrBreadcrumb
        crumbs={[
          { name: t("Projects"), href: "/projects" },
          { name: project.conformsTo!.name, href: `/projects?conformTo=${project.conformsTo!.id}` },
        ]}
      />
      <ProjectTypeChip project={project} />
      <Text as="h1" variant="heading2xl" id="project-title">
        {project.name}
      </Text>
      <p className="text-primary font-mono">
        {t("ID:")} {project.id}
      </p>
    </Stack>
  );
};

export default ProjectHeader;
