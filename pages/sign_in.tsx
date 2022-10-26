import { LinkIcon } from "@heroicons/react/solid";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Link from "next/link";
import { useRouter } from "next/router";
import { ReactElement, useState } from "react";
// import KeyringGeneration from "../components/KeyringGeneration";
import useStorage from "hooks/useStorage";
import NRULayout from "../components/layout/NRULayout";
import { useAuth } from "../hooks/useAuth";
import { NextPageWithLayout } from "./_app";

//

// Components
import Questions, { QuestionsNS } from "components/partials/auth/Questions";
import ChooseMode from "components/partials/sign_in/ChooseMode";
import EnterEmail, { EnterEmailNS } from "components/partials/sign_in/EnterEmail";
import ViaPassphrase, { ViaPassphraseNS } from "components/partials/sign_in/ViaPassphrase";
import ViaQuestions from "components/partials/sign_in/ViaQuestions";
// import { doLogin } from "lib/doLogIn";

//

export async function getStaticProps({ locale }: any) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["signInProps", "signUpProps"])),
    },
  };
}

const Sign_in: NextPageWithLayout = () => {
  const [isPassprhase, setIsPassphrase] = useState(false);
  const [isQuestions, setIsQuestions] = useState(false);
  const [step, setStep] = useState(0);

  const [email, setEmail] = useState("");
  const [pdfk, setPdfk] = useState("");
  const [seed, setSeed] = useState("");

  const { register, login } = useAuth();
  const { t } = useTranslation("signInProps");
  const { getItem, setItem } = useStorage();
  const router = useRouter();

  //

  const emailEntered = async (data: EnterEmailNS.FormValues) => {
    setEmail(data.email);
    // Setting HMAC
    const result = await register(email, false);
    const key = result.keypairoomServer;
    console.log(result, key);
    setPdfk(key);
    // if (key) setPdfk(key);
    //
    setStep(1);
  };

  const viaPassphrase = () => {
    setIsPassphrase(true);
    setIsQuestions(false);
    setStep(2);
  };

  const viaQuestions = () => {
    setIsPassphrase(false);
    setIsQuestions(true);
    setStep(2);
  };

  const passphraseEntered = (data: ViaPassphraseNS.FormValues) => {
    console.log(data);
    setSeed(data.passphrase);
    doLogin();
  };

  const questionsEntered = (data: QuestionsNS.FormValues) => {
    // setStep(3)
    console.log("questionsEntered");
  };

  async function doLogin() {
    console.log("seed:", seed);
    console.log("hmac:", pdfk);
    console.log("email:", email);
    // const zenData = `
    // {
    //     "seed": "${seed}",
    //     "seedServerSideShard.HMAC": "${pdfk}"
    // }`;

    // const { result } = await zencode_exec(keypairoomClientRecreateKeys, { data: zenData });
    // const res = JSON.parse(result);

    // setItem("eddsa_public_key", res.eddsa_public_key);
    // setItem("eddsa_key", res.keyring.eddsa);
    // setItem("ethereum_address", res.keyring.ethereum);
    // setItem("reflow", res.keyring.reflow);
    // setItem("schnorr", res.keyring.schnorr);
    // setItem("eddsa", res.keyring.eddsa);
    // setItem("seed", res.seed);

    // await login({ email });

    // router.push("/");
  }

  return (
    <div className="grid h-full grid-cols-6">
      <div className="col-span-6 p-2 md:col-span-4 md:col-start-2 md:col-end-6">
        <div className="w-full h-full pt-56">
          {/* Entering email */}
          {step === 0 && <EnterEmail onSubmit={emailEntered} />}

          {/* Choose login mode */}
          {step === 1 && <ChooseMode viaPassphrase={viaPassphrase} viaQuestions={viaQuestions} />}

          {(step === 0 || step === 1) && (
            <div>
              <p className="flex flex-row items-center mt-6">
                <span>{t("register.question")}</span>
                <Link href={"/sign_up"}>
                  <a className="flex flex-row font-semibold">
                    <LinkIcon className="w-5 h-5 mx-2" />
                    {t("register.answer")}
                  </a>
                </Link>
              </p>
            </div>
          )}

          {/* Passphrase login */}
          {step == 2 && isPassprhase && <ViaPassphrase onSubmit={passphraseEntered} />}

          {/* Questions login */}
          {step === 2 && isQuestions && (
            <ViaQuestions>
              <Questions email={email} HMAC={pdfk} onSubmit={questionsEntered} />
            </ViaQuestions>
          )}

          {step === 3 && (
            <>
              <h2>{t("step_passphrase.title")}</h2>
              {/* <VerifySeed email={email} HMAC={pdfk} /> */}
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
