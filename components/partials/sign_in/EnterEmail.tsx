// Functionality
import { useTranslation } from "next-i18next";

// Form imports
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import * as yup from "yup";

// Components
import BrInput from "components/brickroom/BrInput";
import { ChildrenComponent as CC } from "components/brickroom/types";

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
  const { formState, handleSubmit } = form;
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
        <BrInput
          {...form.register("email")}
          type="email"
          label={t("Your email&#x3a;")}
          error={errors.email?.message}
          placeholder={t("alice@email&#46;com")}
          testID="email"
        />

        {/* Slot for errors */}
        {props.children}

        {/* Submit button */}
        <button className="btn btn-block btn-primary" type="submit" data-test="submit" disabled={!isValid}>
          {t("button")}
        </button>
      </form>
    </div>
  );
}
