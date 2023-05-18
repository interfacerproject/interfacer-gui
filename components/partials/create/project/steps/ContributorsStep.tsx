// Logic
import { useTranslation } from "next-i18next";

// Components
import { Stack, Text } from "@bbtgnn/polaris-interfacer";
import SearchUsers from "components/SearchUsers";
import BrUserDisplay from "components/brickroom/BrUserDisplay";
import PCardWithAction from "components/polaris/PCardWithAction";
import PTitleSubtitle from "components/polaris/PTitleSubtitle";
import { useAuth } from "hooks/useAuth";
import { formSetValueOptions } from "lib/formSetValueOptions";
import { PersonWithFileEssential } from "lib/types/extensions";
import { useFormContext } from "react-hook-form";
import * as yup from "yup";
import { CreateProjectValues } from "../CreateProjectForm";

//

export type ContributorsStepValues = Array<string>;
export const contributorsStepSchema = () => yup.array().of(yup.string().required());
export const contributorsStepDefaultValues: ContributorsStepValues = [];

//

export default function ContributorsStep() {
  const { t } = useTranslation("createProjectProps");
  const { setValue, watch } = useFormContext<CreateProjectValues>();
  const { user } = useAuth();

  const CONTRIBUTORS_FORM_KEY = "contributors";
  const contributors = watch(CONTRIBUTORS_FORM_KEY);

  function handleSelect(option: Partial<PersonWithFileEssential>) {
    setValue(CONTRIBUTORS_FORM_KEY, [...contributors, option.id!], formSetValueOptions);
  }
  function handleRemove(contributorId: string) {
    setValue(
      CONTRIBUTORS_FORM_KEY,
      contributors.filter(id => id !== contributorId),
      formSetValueOptions
    );
  }

  //

  return (
    <Stack vertical spacing="extraLoose">
      <PTitleSubtitle
        title={t("Add contributors")}
        subtitle={t(
          "Add the users who contributed to the project. You can also add contributors and modofy the project later."
        )}
      />
      <SearchUsers
        id="add-contributors-search"
        onSelect={handleSelect}
        excludeIDs={[...contributors, user?.ulid!]}
        label={t("Search for contributors")}
      />
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
