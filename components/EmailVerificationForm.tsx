// Functionality
import { useTranslation } from "next-i18next";
import { ChangeEvent, useState } from "react";
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

type SignUpProps = {
  HMAC: string;
  setHMAC: (HMAC: string) => void;
  onSubmit: Function;
  email: string;
  setEmail: (email: string) => void;
  name: string;
  setName: (name: string) => void;
  user: string;
  setUser: (user: string) => void;
};

const EmailVerificationForm = (props: SignUpProps) => {
  const { HMAC, setHMAC, onSubmit, setEmail, setName, setUser } = props;

  const [yetRegisteredEmail, setYetRegisteredEmail] = useState("");
  const [emailValid, setEmailValid] = useState("");
  const { t } = useTranslation("signUpProps");

  const { register } = useAuth();

  // async function verifyEmail({ email }: { email: string }) {
  //   const result = await register(email, true);
  //   if (result?.keypairoomServer) {
  //     setYetRegisteredEmail("");
  //     if (email.includes("@")) {
  //       setEmailValid(t("email.valid"));
  //     } else {  //     }
  //     setHMAC(result.keypairoomServer);
  //   } else {
  //     setYetRegisteredEmail(result);
  //   }
  // }

  interface FormValues {
    email: string;
    name: string;
    user: string;
  }

  const defaultValues: FormValues = {
    email: "",
    name: "",
    user: "",
  };

  async function testEmail(email: string) {
    const result = await register(email, true);
    return result?.keypairoomServer ? true : false;
  }

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

  const form = useForm<FormValues>({
    mode: "all",
    resolver: yupResolver(schema),
    defaultValues,
  });

  const {
    formState: { errors, isValid },
  } = form;

  const onValid = async (data: FormValues) => {
    console.log(data);

    setEmail(data.email);
    setName(data.name);
    setUser(data.user);

    const result = await register(data.email, true);
    setHMAC(result.keypairoomServer);

    props.onSubmit();
  };

  const isButtonEnabled = !isValid ? "btn-disabled" : "";

  return (
    <>
      <h2>{t("Sign up")}</h2>
      <p className="mt-4 mb-6">
        {t(
          "The sign up process generates your private keys which are never communicate to the server&#46 Keep a copy of your passphrase&#46"
        )}
      </p>
      {/* The form */}
      <form onSubmit={form.handleSubmit(onValid)} className="space-y-8">
        {/* Email */}
        <BrInput
          {...form.register("email")}
          type="email"
          hint={emailValid}
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
        <button className={`my-6 btn btn-block btn-primary ${isButtonEnabled}`} type="submit">
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
