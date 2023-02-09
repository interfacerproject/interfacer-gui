// Logic
import { useTranslation } from "next-i18next";

// Components
import { Stack, Text } from "@bbtgnn/polaris-interfacer";
import PCardWithAction from "components/polaris/PCardWithAction";
import PTitleSubtitle from "components/polaris/PTitleSubtitle";
import ProjectDisplay from "components/ProjectDisplay";
import SearchProjects from "components/SearchProjects";
import { EconomicResource } from "lib/types";
import { useFormContext } from "react-hook-form";
import * as yup from "yup";
import { CreateProjectValues } from "../CreateProjectForm";

//

export type RelationsStepValues = Array<string>;
export const relationsStepSchema = yup.array().of(yup.string().required());
export const relationsStepDefaultValues: RelationsStepValues = [];

//

export default function RelationsStep() {
  const { t } = useTranslation();
  const { watch, setValue } = useFormContext<CreateProjectValues>();

  const RELATIONS_FORM_KEY = "relations";
  const relations = watch(RELATIONS_FORM_KEY);

  function handleSelect(value: Partial<EconomicResource>) {
    setValue(RELATIONS_FORM_KEY, [...relations, value.id!]);
  }
  function handleRemove(id: string) {
    setValue(
      RELATIONS_FORM_KEY,
      relations.filter(item => item !== id)
    );
  }

  //

  return (
    <Stack vertical spacing="extraLoose">
      <PTitleSubtitle title={t("Relations")} subtitle={t("Please read our Documentation Guidelines.")} />

      <SearchProjects onSelect={handleSelect} excludeIDs={relations} />

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
