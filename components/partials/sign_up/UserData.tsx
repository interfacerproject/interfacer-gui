// Functionality
import { useTranslation } from "next-i18next";
import { ChangeEvent } from "react";
import { useAuth } from "hooks/useAuth";

// Form imports
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import * as yup from "yup";

// Components
import BrInput from "components/brickroom/BrInput";

//

export namespace UserDataNS {
  export interface FormValues {
    email: string;
    name: string;
    user: string;
  }

  export interface Props {
    onSubmit: (data: FormValues) => void;
  }
}

//

export default function UserData({ onSubmit }: UserDataNS.Props) {
  // Loading translations
  const { t } = useTranslation("signUpProps", { keyPrefix: "UserData" });

  // Getting function that checks for email
  const { register } = useAuth();

  /* Form setup */

  const defaultValues: UserDataNS.FormValues = {
    email: "",
    name: "",
    user: "",
  };

  const schema: yup.AnyObjectSchema = yup
    .object({
      name: yup.string().required(),
      user: yup.string().required(),
      email: yup
        .string()
        .email()
        .required()
        .test("email-exists", t("email is not valid"), async (value, testContext) => {
          return await testEmail(value!);
        }),
    })
    .required();

  // This function checks if the provided email exists
  async function testEmail(email: string) {
    const result = await register(email, true);
    return Boolean(result?.keypairoomServer);
  }

  // Creating form
  const form = useForm<UserDataNS.FormValues>({
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
      {/* Info */}
      <h2>{t("Sign up")}</h2>
      <p>
        {t(
          "The sign up process generates your private keys which are never communicate to the server&#46 Keep a copy of your passphrase&#46"
        )}
      </p>
      {/* The form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 mt-8">
        {/* Email */}
        <BrInput
          {...form.register("email")}
          type="email"
          placeholder={t("alice@email.com")}
          label={t("Your email")}
          help={t("Your email address that will be used for your login")}
          error={errors.email?.message}
          testID="email"
        />
        {/* Name */}
        <BrInput
          {...form.register("name")}
          type="text"
          label={t("Your name")}
          help={t("Your name is shown and visible to everyone")}
          placeholder={t("Type your name")}
          error={errors.name?.message}
          testID="name"
        />
        {/* Username */}
        <BrInput
          {...form.register("user")}
          type="text"
          placeholder={t("Type your visible username")}
          label={t("Choose a username")}
          help={t("Your username is used to identify you in the system")}
          error={errors.user?.message}
          testID="user"
        />
        {/* Submit button */}
        <button className="btn btn-block btn-primary" type="submit" disabled={!isValid} data-test="submit">
          {t("Next step")}
        </button>
      </form>
    </div>
  );
}
