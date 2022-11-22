// Functionality
import { useTranslation } from "next-i18next";

import { Button, TextField } from "@bbtgnn/polaris-interfacer";

// Form imports
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm, Controller } from "react-hook-form";
import * as yup from "yup";

// Components
import { ChildrenComponent as CC } from "components/brickroom/types";
import { isRequired } from "../../../lib/isFieldRequired";

//

export namespace EnterEmailNS {
  export interface Props {
    onSubmit: (data: FormValues) => void;
  }

  export interface FormValues {
    email: string;
  }
}

//

export default function EnterEmail(props: CC<EnterEmailNS.Props>) {
  const { onSubmit } = props;
  const { t } = useTranslation("signInProps");

  /* Form setup */

  const defaultValues: EnterEmailNS.FormValues = {
    email: "",
  };

  const schema = yup
    .object({
      email: yup.string().email().required(),
    })
    .required();

  // Creating form
  const form = useForm<EnterEmailNS.FormValues>({
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
      <p className="mt-2 mb-6">{t("")}</p>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Email field */}
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, name, value } }) => (
            <TextField
              type="email"
              id={name}
              name={name}
              value={value}
              autoComplete="off"
              onChange={onChange}
              onBlur={onBlur}
              label={t("Your email&#x3a;")}
              placeholder={t("alice@email&#46;com")}
              error={errors.email?.message}
              requiredIndicator={isRequired(schema, name)}
            />
          )}
        />

        {/* Slot for errors */}
        {props.children}

        {/* Submit button */}
        <Button size="large" primary fullWidth submit disabled={!isValid} id="submit" data-test="submit">
          {t("Next step")}
        </Button>
      </form>
    </div>
  );
}
