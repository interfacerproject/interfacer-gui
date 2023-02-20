import { Stack, Text } from "@bbtgnn/polaris-interfacer";
import PCardWithAction from "components/polaris/PCardWithAction";
import PTitleSubtitle from "components/polaris/PTitleSubtitle";
import ProjectDisplay from "components/ProjectDisplay";
import SearchProjects from "components/SearchProjects";
import { ProjectType } from "components/types";
import { EconomicResource } from "lib/types";
import { useTranslation } from "next-i18next";
import { useFormContext } from "react-hook-form";
import * as yup from "yup";
import { CreateProjectValues } from "../CreateProjectForm";

//

export type LinkDesignStepValues = string;
export const linkDesignStepSchema = yup.string();
export const linkDesignStepDefaultValues: LinkDesignStepValues = "";

//

export default function LinkDesign() {
  const { t } = useTranslation();

  const { setValue, watch } = useFormContext<CreateProjectValues>();
  const selected = watch("linkedDesign");

  function handleSelect(value: Partial<EconomicResource>) {
    setValue("linkedDesign", value.id!, { shouldValidate: true });
  }
  function handleRemove() {
    setValue("linkedDesign", "", { shouldValidate: true });
  }

  //

  return (
    <Stack vertical spacing="extraLoose">
      <PTitleSubtitle title={t("Design source")} subtitle={t("Tell us from which design your product is based on.")} />

      <SearchProjects label="Search for a design" conformsTo={[ProjectType.DESIGN]} onSelect={handleSelect} />

      {selected && (
        <Stack vertical spacing="extraTight">
          <Text as="p" variant="bodyMd">
            {t("Linked design")}
          </Text>
          <PCardWithAction onClick={handleRemove}>
            <ProjectDisplay projectId={selected} />
          </PCardWithAction>
        </Stack>
      )}
    </Stack>
  );
}
