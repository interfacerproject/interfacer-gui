import { useTranslation } from "next-i18next";

// Form imports
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import * as yup from "yup";

// Components
import BrInput from "components/brickroom/BrInput";

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
  const { t } = useTranslation("signInProps", { keyPrefix: "viaPassphrase" });

  /* Form setup */

  const defaultValues: ViaPassphraseNS.FormValues = {
    passphrase: "",
  };

  const schema = yup
    .object({
      passphrase: yup
        .string()
        .required()
        .test("name", t("field.error"), value => value?.split(" ").length == 12),
    })
    .required();

  // Creating form
  const form = useForm<ViaPassphraseNS.FormValues>({
    mode: "all",
    resolver: yupResolver(schema),
    defaultValues,
  });

  // Getting data from the form
  const { formState, handleSubmit } = form;
  const { errors, isValid } = formState;

  //

  return (
    <div>
      {/* Intro */}
      <h2>{t("title")}</h2>
      <p className="mt-2 mb-6">{t("description")}</p>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Email field */}
        <BrInput
          {...form.register("passphrase")}
          type="text"
          label={t("field.label")}
          error={errors.passphrase?.message}
          placeholder={t("field.placeholder")}
          testID="passphrase"
        />

        {/* Submit button */}
        <button className="btn btn-block btn-primary" type="submit" data-test="submit" disabled={!isValid}>
          {t("loginButton")}
        </button>
      </form>
    </div>
  );
}
