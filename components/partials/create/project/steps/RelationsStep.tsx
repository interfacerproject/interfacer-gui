// Logic
import { useTranslation } from "next-i18next";

// Components
import { Stack, Text } from "@bbtgnn/polaris-interfacer";
import ProjectDisplay from "components/ProjectDisplay";
import SearchProjects from "components/SearchProjects";
import PCardWithAction from "components/polaris/PCardWithAction";
import PTitleSubtitle from "components/polaris/PTitleSubtitle";
import { ProjectType } from "components/types";
import { formSetValueOptions } from "lib/formSetValueOptions";
import { EconomicResource } from "lib/types";
import { useFormContext } from "react-hook-form";
import { CreateProjectValues, useProjectType } from "../CreateProjectForm";

export { type RelationsStepValues, relationsStepSchema, relationsStepDefaultValues } from "./RelationsStep.schema";

//

export default function RelationsStep() {
  const { t } = useTranslation("createProjectProps");
  const projectType = useProjectType();
  const isMachine = projectType === ProjectType.MACHINE;
  const { watch, setValue } = useFormContext<CreateProjectValues>();

  const RELATIONS_FORM_KEY = "relations";
  const relations = watch(RELATIONS_FORM_KEY);

  function handleSelect(value: Partial<EconomicResource>) {
    setValue(RELATIONS_FORM_KEY, [...relations, value.id!], formSetValueOptions);
  }
  function handleRemove(id: string) {
    setValue(
      RELATIONS_FORM_KEY,
      relations.filter(item => item !== id),
      formSetValueOptions
    );
  }

  //

  return (
    <Stack vertical spacing="extraLoose">
      <PTitleSubtitle
        title={t("Included")}
        subtitle={
          isMachine
            ? t(
                "Link this machine to related projects within our community. Connect it to projects that use this machine or are otherwise associated with it."
              )
            : t(
                "Connect your open source hardware projects to related projects within our community, creating a network of interlinked designs and ideas. You can link to other projects that are similar in design or concept, or that complement your own work."
              )
        }
      />

      <SearchProjects
        id="add-related-projects-search"
        onSelect={handleSelect}
        excludeIDs={relations}
        label={isMachine ? t("Add related project") : t("Include")}
      />

      {relations.length && (
        <Stack vertical spacing="tight">
          <Text variant="bodyMd" as="p">
            {t("Selected projects")}
          </Text>
          {relations.map(projectId => (
            <PCardWithAction
              key={projectId}
              onClick={() => {
                handleRemove(projectId);
              }}
            >
              <ProjectDisplay projectId={projectId} />
            </PCardWithAction>
          ))}
        </Stack>
      )}
    </Stack>
  );
}
