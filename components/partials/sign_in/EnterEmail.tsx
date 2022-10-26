// Functionality
import { useAuth } from "hooks/useAuth";
import { useTranslation } from "next-i18next";

// Form imports
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import * as yup from "yup";

// Components
import BrInput from "components/brickroom/BrInput";

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

export default function EnterEmail(props: EnterEmailNS.Props) {
  const { onSubmit } = props;
  const { t } = useTranslation("signInProps", { keyPrefix: "enterEmail" });
  const { register } = useAuth();

  /* Form setup */

  const defaultValues: EnterEmailNS.FormValues = {
    email: "",
  };

  const schema = yup
    .object({
      email: yup
        .string()
        .email()
        .required()
        .test("email-exists", t("notRegistered"), async (value, testContext) => {
          return await testEmail(value!);
        }),
    })
    .required();

  // This function checks if the provided email exists
  async function testEmail(email: string) {
    const result = await register(email, false);
    return result?.keypairoomServer ? true : false;
  }

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
      <h2>{t("title")}</h2>
      <p className="mt-2 mb-6">{t("description")}</p>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Email field */}
        <BrInput
          {...form.register("email")}
          type="email"
          label={t("label")}
          error={errors.email?.message}
          placeholder={t("placeholder")}
          testID="email"
        />

        {/* Submit button */}
        <button className="btn btn-block btn-primary" type="submit" data-test="submit" disabled={!isValid}>
          {t("button")}
        </button>
      </form>
    </div>
  );
}
