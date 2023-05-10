import { useTranslation } from "next-i18next";

// Form
import { yupResolver } from "@hookform/resolvers/yup";
import { isRequired } from "lib/isFieldRequired";
import { License } from "lib/licenses/types";
import { getLicenseById, licensesIDs } from "lib/licenses/utils";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";

// Components
import { Button, Card, Icon, Stack, TextField } from "@bbtgnn/polaris-interfacer";
import { CancelMinor, PlusMinor } from "@shopify/polaris-icons";
import useYupLocaleObject from "hooks/useYupLocaleObject";
import SearchLicense from "./SearchLicense";

//

export interface ScopedLicense {
  scope: string;
  license: License;
}

export interface Props {
  onAdd?: (value: ScopedLicense) => void;
  onDiscard?: () => void;
}

//

export default function AddLicense(props: Props) {
  const { t } = useTranslation("createProjectProps");
  const { onAdd = () => {}, onDiscard = () => {} } = props;

  const defaultValues = {
    scope: "",
    licenseID: "",
  };

  const schema = (() =>
    yup.object().shape({
      scope: yup.string().required(),
      licenseID: yup.string().oneOf(licensesIDs).required(),
    }))();

  const yupLocaleObject = useYupLocaleObject();

  yup.setLocale(yupLocaleObject);

  const form = useForm({
    mode: "all",
    resolver: yupResolver(schema),
    defaultValues,
  });

  const { formState, control, reset } = form;
  const { isValid, errors } = formState;

  function handleAdd() {
    onAdd({ scope: form.getValues("scope"), license: getLicenseById(form.getValues("licenseID"))! });
    reset();
  }

  function handleDiscard() {
    onDiscard();
    reset();
  }

  //

  return (
    <Card sectioned>
      <Stack vertical spacing="loose">
        <Controller
          control={control}
          name="scope"
          render={({ field: { onChange, onBlur, name, value } }) => (
            <TextField
              id="license-scope"
              label={t("License scope")}
              autoComplete="off"
              onChange={onChange}
              onBlur={onBlur}
              value={value}
              error={errors[name]?.message}
              requiredIndicator={isRequired(schema, name)}
              placeholder={t("Documentation, code, hardware, etc.")}
            />
          )}
        />

        <Controller
          control={control}
          name="licenseID"
          render={({ field: { onChange, onBlur, name, value } }) => (
            <SearchLicense
              id="license-id"
              onSelect={onChange}
              requiredIndicator={isRequired(schema, name)}
              error={errors[name]?.message}
            />
          )}
        />

        <div className="flex justify-end pt-4 space-x-2">
          <Button onClick={handleDiscard} icon={<Icon source={CancelMinor} />}>
            {t("Discard")}
          </Button>
          <Button
            id="add-license-submit-button"
            onClick={handleAdd}
            disabled={!isValid}
            icon={<Icon source={PlusMinor} />}
          >
            {t("Add license")}
          </Button>
        </div>
      </Stack>
    </Card>
  );
}
