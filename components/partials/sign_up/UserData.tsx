// Functionality
import { useTranslation } from "next-i18next";
import { ChangeEvent } from "react";
import { useAuth } from "hooks/useAuth";

// Form imports
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";

// Components
import { Button, TextField } from "@bbtgnn/polaris-interfacer";
import { isRequired } from "../../../lib/isFieldRequired";

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
  const { t } = useTranslation("signUpProps");

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
  const { formState, handleSubmit, control } = form;
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
              label={t("Your email")}
              helpText={t("Your email address that will be used for your login")}
              placeholder={t("alice@email&#183;com")}
              error={errors.email?.message}
              requiredIndicator={isRequired(schema, name)}
            />
          )}
        />
        {/* Name */}
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, onBlur, name, value } }) => (
            <TextField
              type="text"
              id={name}
              name={name}
              value={value}
              autoComplete="off"
              onChange={onChange}
              onBlur={onBlur}
              label={t("Your name")}
              helpText={t("Your name is shown and visible to everyone")}
              placeholder={t("Type your name")}
              error={errors.name?.message}
              requiredIndicator={isRequired(schema, name)}
            />
          )}
        />
        {/* Username */}
        <Controller
          control={control}
          name="user"
          render={({ field: { onChange, onBlur, name, value } }) => (
            <TextField
              type="text"
              id={name}
              name={name}
              value={value}
              autoComplete="off"
              onChange={onChange}
              onBlur={onBlur}
              label={t("Choose a username")}
              helpText={t("Your username is used to identify you in the system")}
              placeholder={t("Type your visible username")}
              error={errors.user?.message}
              requiredIndicator={isRequired(schema, name)}
            />
          )}
        />
        {/* Submit button */}
        <Button size="large" primary fullWidth submit disabled={!isValid} id="submit">
          {t("Next step")}
        </Button>
      </form>
    </div>
  );
}
