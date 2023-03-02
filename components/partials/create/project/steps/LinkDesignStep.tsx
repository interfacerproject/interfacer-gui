import { Stack, Text } from "@bbtgnn/polaris-interfacer";
import PCardWithAction from "components/polaris/PCardWithAction";
import PTitleSubtitle from "components/polaris/PTitleSubtitle";
import ProjectDisplay from "components/ProjectDisplay";
import SearchProjects from "components/SearchProjects";
import { ProjectType } from "components/types";
import { formSetValueOptions } from "lib/formSetValueOptions";
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
  const { t } = useTranslation("createProjectProps");

  const { setValue, watch } = useFormContext<CreateProjectValues>();
  const selected = watch("linkedDesign");

  function handleSelect(value: Partial<EconomicResource>) {
    setValue("linkedDesign", value.id!, formSetValueOptions);
  }
  function handleRemove() {
    setValue("linkedDesign", "", formSetValueOptions);
  }

  //

  return (
    <Stack vertical spacing="extraLoose">
      <PTitleSubtitle
        title={t("Design source")}
        subtitle={t(
          "By linking your product to its design source, you can provide valuable information to others who may be interested in producing or modifying your product."
        )}
      />

      <SearchProjects label={t("Search for a design")} conformsTo={[ProjectType.DESIGN]} onSelect={handleSelect} />

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
