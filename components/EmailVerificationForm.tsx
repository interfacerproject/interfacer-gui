// Functionality
import { useTranslation } from "next-i18next";
import { ChangeEvent } from "react";
import { useAuth } from "../hooks/useAuth";

// Form imports
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import * as yup from "yup";

// Components
import { LinkIcon } from "@heroicons/react/solid";
import Link from "next/link";
import BrInput from "./brickroom/BrInput";

//

export interface SignUpFormValues {
  email: string;
  name: string;
  user: string;
}

type SignUpProps = {
  onSubmit: (data: SignUpFormValues) => void;
  // setEmail: (email: string) => void;
  // setName: (name: string) => void;
  // setUser: (user: string) => void;
  // setHMAC: (HMAC: string) => void;
};

//

const EmailVerificationForm = ({ onSubmit }: SignUpProps) => {
  // Loading translations
  const { t } = useTranslation("signUpProps");

  // Unpacking props
  // const { onSubmit, setEmail, setName, setUser, setHMAC } = props;

  // Getting function that checks for email
  const { register } = useAuth();

  /* Form setup */

  const defaultValues: SignUpFormValues = {
    email: "",
    name: "",
    user: "",
  };

  const schema = yup
    .object({
      name: yup.string().required(),
      user: yup.string().required(),
      email: yup
        .string()
        .email()
        .required()
        .test("email-exists", "Provided e-mail already exists", async (value, testContext) => {
          return await testEmail(value!);
        }),
    })
    .required();

  // This function checks if the provided email exists
  async function testEmail(email: string) {
    const result = await register(email, true);
    return !!result?.keypairoomServer;
  }

  // Creating form
  const form = useForm<SignUpFormValues>({
    mode: "all",
    resolver: yupResolver(schema),
    defaultValues,
  });

  // // Submit function
  // const onValid = async (data: SignUpFormValues) => {
  //   setEmail(data.email);
  //   setName(data.name);
  //   setUser(data.user);

  //   const result = await register(data.email, true);
  //   setHMAC(result.keypairoomServer);

  //   // Running the provided "onSubmit"
  //   onSubmit();
  // };

  // Getting data from the form
  const { formState, handleSubmit } = form;
  const { errors, isValid } = formState;

  const isButtonEnabled = !isValid ? "btn-disabled" : "";

  /* */

  return (
    <>
      <h2>{t("Sign up")}</h2>
      <p className="mt-4 mb-6">
        {t(
          "The sign up process generates your private keys which are never communicate to the server&#46 Keep a copy of your passphrase&#46"
        )}
      </p>
      {/* The form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Email */}
        <BrInput
          {...form.register("email")}
          type="email"
          placeholder={t("alice@email&#46com")}
          label={t("Your email")}
          help={t("Your email address that will be used for your login")}
          error={errors.email?.message}
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
        />
        {/* Submit button */}
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
  );
};

export default EmailVerificationForm;
