import { useTranslation } from "next-i18next";

// Form imports
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";

// Components
import { Button, TextField } from "@bbtgnn/polaris-interfacer";
import { isRequired } from "../../../lib/isFieldRequired";

//

export namespace ViaPassphraseNS {
  export interface Props {
    onSubmit?: (data: FormValues) => void;
  }

  export interface FormValues {
    passphrase: string;
  }
}

//

export default function ViaPassphrase(props: ViaPassphraseNS.Props) {
  const { onSubmit = () => {} } = props;
  const { t } = useTranslation("signInProps");

  /* Form setup */

  const defaultValues: ViaPassphraseNS.FormValues = {
    passphrase: "",
  };

  const schema = yup
    .object({
      passphrase: yup
        .string()
        .required()
        .test("name", t("Invalid passphrase"), value => value?.split(" ").length == 12),
    })
    .required();

  // Creating form
  const form = useForm<ViaPassphraseNS.FormValues>({
    mode: "all",
    resolver: yupResolver(schema),
    defaultValues,
  });

  // Getting data from the form
  const { formState, handleSubmit, control } = form;
  const { errors, isValid } = formState;

  //

  return (
    <div>
      {/* Intro */}
      <h2>{t("Login")}</h2>
      <p className="mt-2 mb-6">{t("Input the passphrase that you kept generated during the signup process")}</p>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Email field */}
        <Controller
          control={control}
          name="passphrase"
          render={({ field: { onChange, onBlur, name, value } }) => (
            <TextField
              type="text"
              id={name}
              name={name}
              value={value}
              autoComplete="off"
              onChange={onChange}
              onBlur={onBlur}
              label={t("Passphrase")}
              placeholder={t("penalty now before knife offer market drum flush advice frown claw hold")}
              error={errors.passphrase?.message}
              requiredIndicator={isRequired(schema, name)}
            />
          )}
        />

        {/* Submit button */}
        <Button size="large" primary fullWidth submit disabled={!isValid} id="submit">
          {t("Login")}
        </Button>
      </form>
    </div>
  );
}
