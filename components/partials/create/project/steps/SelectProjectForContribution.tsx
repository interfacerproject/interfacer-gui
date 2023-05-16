import { Stack, Text } from "@bbtgnn/polaris-interfacer";
import PCardWithAction from "components/polaris/PCardWithAction";
import ProjectDisplay from "components/ProjectDisplay";
import SearchProjects from "components/SearchProjects";
import { formSetValueOptions } from "lib/formSetValueOptions";
import { EconomicResource } from "lib/types";
import { useTranslation } from "next-i18next";
import { useFormContext } from "react-hook-form";
import * as yup from "yup";
import { FormValues } from "../../contribution/CreateContributionForm";
import { useAuth } from "hooks/useAuth";

//

export type SelectProjectForContributionValues = string;
export const selectProjectForContributionSchema = yup.string();
export const selectProjectForContributionDefaultValues: SelectProjectForContributionValues = "";

//

export default function SelectProjectForContribution() {
  const { t } = useTranslation("createProjectProps");
  const { user } = useAuth();

  const { setValue, watch } = useFormContext<FormValues>();
  const valueName = "project";
  const selected = watch(valueName);

  function handleSelect(value: Partial<EconomicResource>) {
    setValue(valueName, value.id!, formSetValueOptions);
  }
  function handleRemove() {
    setValue(valueName, "", formSetValueOptions);
  }

  //

  return (
    <Stack vertical spacing="extraLoose">
      <SearchProjects
        label={t("Search for a project")}
        // ownerId={user?.ulid}
        onSelect={handleSelect}
        id="search-project"
      />

      {selected && (
        <Stack vertical spacing="extraTight">
          <Text as="p" variant="bodyMd">
            {t("Selected source")}
          </Text>
          <PCardWithAction onClick={handleRemove}>
            <ProjectDisplay projectId={selected} />
          </PCardWithAction>
        </Stack>
      )}
    </Stack>
  );
}
