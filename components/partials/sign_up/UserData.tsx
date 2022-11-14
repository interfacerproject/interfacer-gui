// Functionality
import { useAuth } from "hooks/useAuth";
import { useTranslation } from "next-i18next";
<<<<<<< HEAD:components/EmailVerificationForm.tsx
import { ChangeEvent } from "react";
import { useAuth } from "../hooks/useAuth";
=======
>>>>>>> e94c280 (Sign up in rework #143 (#244)):components/partials/sign_up/UserData.tsx

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
        .test("email-exists", t("email.invalid"), async (value, testContext) => {
          return await testEmail(value!);
        }),
    })
    .required();

  // This function checks if the provided email exists
  async function testEmail(email: string) {
    const result = await register(email, true);
<<<<<<< HEAD:components/EmailVerificationForm.tsx
    return !!result?.keypairoomServer;
=======
    return Boolean(result?.keypairoomServer);
>>>>>>> e94c280 (Sign up in rework #143 (#244)):components/partials/sign_up/UserData.tsx
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
<<<<<<< HEAD:components/EmailVerificationForm.tsx
    <>
      <h2>{t("Sign up")}</h2>
      <p className="mt-4 mb-6">
        {t(
          "The sign up process generates your private keys which are never communicate to the server&#46 Keep a copy of your passphrase&#46"
        )}
      </p>
=======
    <div>
      {/* Info */}
      <h2>{t("title")}</h2>
      <p>{t("description")}</p>

>>>>>>> e94c280 (Sign up in rework #143 (#244)):components/partials/sign_up/UserData.tsx
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
          onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
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
          onChange={(e: ChangeEvent<HTMLInputElement>) => setUser(e.target.value)}
          error={errors.user?.message}
          testID="user"
        />
        {/* Submit button */}
<<<<<<< HEAD:components/EmailVerificationForm.tsx
        <button className={`my-6 btn btn-block btn-primary ${isButtonEnabled}`} type="submit" disabled={!isValid}>
          {t("Next step")}
        </button>
      </form>

      {/* Link alla registrazione */}
      <p className="flex flex-row items-center">
        <span>{t("👌 You already have an account?")}</span>
        <Link href={"/sign_in"}>
          <a className="flex flex-row font-semibold">
            <LinkIcon className="w-5 h-5 mx-2" />
            {t("Login")}
          </a>
        </Link>
      </p>
    </>
=======
        <button className="btn btn-block btn-primary" type="submit" disabled={!isValid} data-test="submit">
          {t("button")}
        </button>
      </form>
    </div>
>>>>>>> e94c280 (Sign up in rework #143 (#244)):components/partials/sign_up/UserData.tsx
  );
}
