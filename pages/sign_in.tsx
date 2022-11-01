import { LinkIcon } from "@heroicons/react/solid";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Link from "next/link";
import { useRouter } from "next/router";
import { ChangeEvent, ReactElement, useState } from "react";
import BrInput from "../components/brickroom/BrInput";
import KeyringGeneration from "../components/KeyringGeneration";
import NRULayout from "../components/layout/NRULayout";
import VerifySeed from "../components/VerifySeed";
import { useAuth } from "../hooks/useAuth";
import devLog from "../lib/devLog";
import { NextPageWithLayout } from "./_app";

export async function getStaticProps({ locale }: any) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["signInProps", "signUpProps"])),
    },
  };
}

const Sign_in: NextPageWithLayout = () => {
  const [isPassprhase, setIsPassphrase] = useState(false);
  const [step, setStep] = useState(0);
  const [email, setEmail] = useState("");
  const [pdfk, setPdfk] = useState("");
  const [isMailExisting, setIsMailExising] = useState(true);

  const { register, login } = useAuth();

  const errorMail = isMailExisting ? undefined : "this email doesn't exists";
  const viaPassphrase = () => {
    setIsPassphrase(true);
    setStep(1);
  };

  const viaQuestions = () => {
    setIsPassphrase(false);
    setStep(1);
  };
  const toNextStep = async (step: number) => {
    const result = await register(email, false);
    if (result["keypairoomServer"]) {
      setPdfk(result["keypairoomServer"]);
      setStep(step);
      devLog(result);
    } else {
      setIsMailExising(false);
      devLog(result);
    }
  };

  const router = useRouter();
  const { t } = useTranslation("signInProps");

  async function onSubmit(e: { preventDefault: () => void }) {
    e.preventDefault();
  }

  return (
    <div className="grid h-full grid-cols-6">
      <div className="col-span-6 p-2 md:col-span-4 md:col-start-2 md:col-end-6">
        <div className="w-full h-full pt-56">
          {(step === 0 || step === 1) && (
            <div>
              <h2>{t("Login")}</h2>
              <p className="mt-2 mb-6">{t("")}</p>

              {step === 0 && (
                <>
                  <button className="btn btn-block btn-primary" type="button" onClick={() => viaPassphrase()}>
                    {t("Login via passphrase 🔑")}
                  </button>
                  <button className="mt-4 btn btn-block btn-primary" type="button" onClick={() => viaQuestions()}>
                    {t("Login answering the signup questions 💬")}
                  </button>
                </>
              )}

              {step === 1 && (
                <>
                  <BrInput
                    name="email"
                    type="email"
                    label={t("Your email&#x3a;")}
                    error={errorMail}
                    placeholder={t("alice@email&#46;com")}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                  />
                  <p className="text-[#8A8E96] mb-6">
                    {t("Input the email address provided during the signup process&#46;")}
                  </p>
                  <button
                    className="btn btn-block btn-primary"
                    type="button"
                    onClick={() => toNextStep(isPassprhase ? 3 : 2)}
                  >
                    {t("Continue")}
                  </button>
                </>
              )}

              <p className="flex flex-row items-center mt-6">
                <span>{t("✌️  You don't have an account yet?")}</span>
                <Link href={"/sign_up"}>
                  <a className="flex flex-row font-semibold">
                    <LinkIcon className="w-5 h-5 mx-2" />
                    {t("Sign up")}
                  </a>
                </Link>
              </p>
            </div>
          )}

          {step === 2 && (
            <>
              <h2>
                {t(
                  "Login by providing your generated passphrase or by answering the questions during your Signup proccess"
                )}
              </h2>
              <KeyringGeneration email={email} HMAC={pdfk} />
            </>
          )}

          {step === 3 && (
            <>
              <h2>{t("Input the passphrase that you kept generated during the signup process")}</h2>
              <VerifySeed email={email} HMAC={pdfk} />
            </>
          )}
        </div>
      </div>
    </div>
  );
};
Sign_in.getLayout = function getLayout(page: ReactElement) {
  return <NRULayout>{page}</NRULayout>;
};
Sign_in.publicPage = true;
export default Sign_in;
