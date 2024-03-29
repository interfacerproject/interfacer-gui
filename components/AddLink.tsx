import { useTranslation } from "next-i18next";
import prependHttp from "prepend-http";

// Form
import { yupResolver } from "@hookform/resolvers/yup";
import { isRequired } from "lib/isFieldRequired";
import { url } from "lib/regex";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";

// Components
import { Button, Card, Icon, Stack, TextField } from "@bbtgnn/polaris-interfacer";
import { CancelMinor, PlusMinor } from "@shopify/polaris-icons";
import useYupLocaleObject from "hooks/useYupLocaleObject";

//

export interface Link {
  url: string;
  label: string;
}

export interface Props {
  onSubmit?: (value: Link) => void;
  onDiscard?: () => void;
  textLabel?: string;
  urlLabel?: string;
  addButtonLabel?: string;
}

//

export default function AddLink(props: Props) {
  const { t } = useTranslation("common");
  const {
    onSubmit = () => {},
    onDiscard = () => {},
    textLabel = t("Link title"),
    urlLabel = t("External data"),
    addButtonLabel = t("Add link"),
  } = props;

  const defaultValues: Link = {
    url: "",
    label: "",
  };

  const yupLocaleObject = useYupLocaleObject();

  yup.setLocale(yupLocaleObject);

  const schema = (() =>
    yup.object().shape({
      url: yup.string().matches(url, t("URL shape is not valid")).required(),
      label: yup.string().required(),
    }))();

  const form = useForm<Link>({
    mode: "all",
    resolver: yupResolver(schema),
    defaultValues,
  });

  const { formState, control, watch, reset } = form;
  const { isValid, errors, isSubmitting } = formState;

  function submit() {
    onSubmit({ label: watch("label"), url: prependHttp(watch("url")) });
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
              label={textLabel}
              autoComplete="off"
              onChange={onChange}
              onBlur={onBlur}
              value={value}
              error={errors[name]?.message}
              requiredIndicator={isRequired(schema, name)}
            />
          )}
        />

        <Controller
          control={control}
          name="url"
          render={({ field: { onChange, onBlur, name, value } }) => (
            <TextField
              label={urlLabel}
              helpText={t(
                "Add here a link to the repository or page where the projects files are contained. The link will be visible in the project page."
              )}
              autoComplete="off"
              value={value}
              onBlur={onBlur}
              onChange={onChange}
              error={errors[name]?.message}
              requiredIndicator={isRequired(schema, name)}
            />
          )}
        />

        <div className="flex justify-end pt-4 space-x-2">
          <Button onClick={onDiscard} icon={<Icon source={CancelMinor} />}>
            {t("Discard")}
          </Button>
          <Button onClick={submit} disabled={!isValid || isSubmitting} icon={<Icon source={PlusMinor} />}>
            {addButtonLabel}
          </Button>
        </div>
      </Stack>
    </Card>
  );
}
