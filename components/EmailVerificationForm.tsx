import { LinkIcon } from "@heroicons/react/solid";
import { useTranslation } from "next-i18next";
import Link from "next/link";
import { ChangeEvent, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import BrInput from "./brickroom/BrInput";

type SignUpProps = {
  HMAC: string;
  setHMAC: (HMAC: string) => void;
  onSubmit?: (e: { preventDefault: () => void }) => void;
  email: string;
  setEmail: (email: string) => void;
  name: string;
  setName: (name: string) => void;
  user: string;
  setUser: (user: string) => void;
};

const EmailVerificationForm = ({ HMAC, setHMAC, onSubmit, setEmail, setName, setUser }: SignUpProps) => {
  const [yetRegisteredEmail, setYetRegisteredEmail] = useState("");
  const [emailValid, setEmailValid] = useState("");
  const { t } = useTranslation("signUpProps");

  const { register } = useAuth();

  async function verifyEmail({ email }: { email: string }) {
    const result = await register(email, true);
    if (result?.keypairoomServer) {
      setYetRegisteredEmail("");
      if (email.includes("@")) {
        setEmailValid(t("✅ your email free"));
      } else {
        setEmailValid("");
      }
      setEmail(email);
      setHMAC(result.keypairoomServer);
    } else {
      setEmailValid("");
      setYetRegisteredEmail(result);
    }
  }
  const isButtonEnabled = HMAC === "" ? "btn-disabled" : "";

  return (
    <>
      <h2>{t("Sign up")}</h2>
      <p className="mt-4 mb-6">
        {t(
          "The sign up process generates your private keys which are never communicate to the server&#46 Keep a copy of your passphrase&#46"
        )}
      </p>
      <form onSubmit={onSubmit}>
        <BrInput
          name="email"
          type="email"
          error={yetRegisteredEmail}
          hint={emailValid}
          placeholder={t("alice@email&#46com")}
          label={t("Your email")}
          help={t("Your email address that will be used for your login")}
          onBlur={(e: ChangeEvent<HTMLInputElement>) => verifyEmail({ email: e.target.value })}
        />
        <BrInput
          name="name"
          type="text"
          label={t("Your name")}
          help={t("Your name is shown and visible to everyone")}
          placeholder={t("Type your name")}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
        />
        <BrInput
          name="username"
          type="text"
          placeholder={t("Type your visible username")}
          label={t("Choose a username")}
          help={t("Your username is used to identify you in the system")}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setUser(e.target.value)}
        />
        <button className={`my-6 btn btn-block btn-primary ${isButtonEnabled}`} type="submit">
          {t("Next step")}
        </button>
      </form>
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
