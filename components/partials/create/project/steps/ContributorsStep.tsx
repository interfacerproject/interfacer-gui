// Logic
import { useTranslation } from "next-i18next";

// Components
import { Stack, Text } from "@bbtgnn/polaris-interfacer";
import BrUserDisplay from "components/brickroom/BrUserDisplay";
import PCardWithAction from "components/polaris/PCardWithAction";
import PTitleSubtitle from "components/polaris/PTitleSubtitle";
import SearchUsers from "components/SearchUsers";
import { Agent } from "lib/types";
import { useFormContext } from "react-hook-form";
import * as yup from "yup";
import { CreateProjectValues } from "../CreateProjectForm";

//

export type ContributorsStepValues = Array<string>;
export const contributorsStepSchema = yup.array().of(yup.string().required());
export const contributorsStepDefaultValues: ContributorsStepValues = [];

//

export default function ContributorsStep() {
  const { t } = useTranslation();
  const { setValue, getValues } = useFormContext<CreateProjectValues>();

  const CONTRIBUTORS_FORM_KEY = "contributors";
  const contributors = getValues(CONTRIBUTORS_FORM_KEY);

  function handleSelect(option: Partial<Agent>) {
    setValue("contributors", [...contributors, option.id!]);
  }
  function handleRemove(contributorId: string) {
    setValue(
      CONTRIBUTORS_FORM_KEY,
      contributors.filter(id => id !== contributorId)
    );
  }

  //

  return (
    <Stack vertical spacing="extraLoose">
      <PTitleSubtitle title={t("Contributors")} subtitle={t("Tell us who contributed to this project.")} />

      <SearchUsers onSelect={handleSelect} excludeIDs={contributors} />

      {contributors.length && (
        <Stack vertical spacing="tight">
          <Text variant="bodyMd" as="p">
            {t("Selected contributors")}
          </Text>
          {contributors.map(contributorId => (
            <PCardWithAction
              key={contributorId}
              onClick={() => {
                handleRemove(contributorId);
              }}
            >
              <BrUserDisplay userId={contributorId} />
            </PCardWithAction>
          ))}
        </Stack>
      )}
    </Stack>
  );
}
