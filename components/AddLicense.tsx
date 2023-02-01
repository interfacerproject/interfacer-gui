import { useTranslation } from "next-i18next";

// Form
import { yupResolver } from "@hookform/resolvers/yup";
import { isRequired } from "lib/isFieldRequired";
import { url } from "lib/regex";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";

// Components
import { Button, Card, Icon, Stack, TextField } from "@bbtgnn/polaris-interfacer";
import { CancelMinor, PlusMinor } from "@shopify/polaris-icons";
import { License } from "lib/licenses/types";
import SearchLicense from "./SearchLicense";

//

interface ScopedLicense {
  scope: string;
  license: License;
}

export interface Props {
  onSubmit?: (value: ScopedLicense) => void;
  onDiscard?: () => void;
}

//

export default function AddLicense(props: Props) {
  const { t } = useTranslation();
  const { onSubmit = () => {}, onDiscard = () => {} } = props;

  const defaultValues = {
    url: "",
    label: "",
  };

  const schema = yup.object().shape({
    url: yup.string().matches(url, t("URL shape is not valid")).required(),
    label: yup.string().required(),
  });

  const form = useForm({
    mode: "all",
    resolver: yupResolver(schema),
    defaultValues,
  });

  const { formState, control, watch, reset } = form;
  const { isValid, errors, isSubmitting } = formState;

  function submit() {
    // onSubmit();
    reset();
  }

  //

  return (
    <Card sectioned>
      <Stack vertical spacing="loose">
        <Controller
          control={control}
          name="label"
          render={({ field: { onChange, onBlur, name, value } }) => (
            <TextField
              label={t("Link title")}
              autoComplete="off"
              onChange={onChange}
              onBlur={onBlur}
              value={value}
              error={errors[name]?.message}
              requiredIndicator={isRequired(schema, name)}
            />
          )}
        />

        <SearchLicense></SearchLicense>

        <div className="flex justify-end pt-4 space-x-2">
          <Button onClick={onDiscard} icon={<Icon source={CancelMinor} />}>
            {t("Discard")}
          </Button>
          <Button onClick={submit} disabled={!isValid || isSubmitting} icon={<Icon source={PlusMinor} />}>
            {t("Add license")}
          </Button>
        </div>
      </Stack>
    </Card>
  );
}
