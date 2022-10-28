import BrInput from "./brickroom/BrInput";
import { ChangeEvent, useState } from "react";
import { useTranslation } from "next-i18next";
import { useAuth } from "../hooks/useAuth";
import Link from "next/link";
import { LinkIcon } from "@heroicons/react/solid";

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
        setEmailValid(t("email.valid"));
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
      <h2>{t("title")}</h2>
      <p className="mt-4 mb-6">{t("presentation")}</p>
      <form onSubmit={onSubmit}>
        <BrInput
          type="email"
          error={yetRegisteredEmail}
          hint={emailValid}
          placeholder={t("email.placeholder")}
          label={t("email.label")}
          help={t("email.help")}
          onBlur={(e: ChangeEvent<HTMLInputElement>) => verifyEmail({ email: e.target.value })}
        />
        <BrInput
          type="text"
          label={t("name.label")}
          help={t("name.help")}
          placeholder={t("name.placeholder")}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
        />
        <BrInput
          type="text"
          placeholder={t("user.placeholder")}
          label={t("user.label")}
          help={t("user.help")}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setUser(e.target.value)}
        />
        <button className={`my-6 btn btn-block btn-primary ${isButtonEnabled}`} type="submit">
          {t("button")}
        </button>
      </form>
      <p className="flex flex-row items-center">
        <span>{t("register.question")}</span>
        <Link href={"/sign_in"}>
          <a className="flex flex-row font-semibold">
            <LinkIcon className="w-5 h-5 mx-2" />
            {t("register.answer")}
          </a>
        </Link>
      </p>
    </>
  );
};

export default EmailVerificationForm;
