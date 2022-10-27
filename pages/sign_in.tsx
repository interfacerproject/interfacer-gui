import useStorage from "hooks/useStorage";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";
import { ReactElement, useEffect, useState } from "react";
import * as yup from "yup";
import { useAuth } from "../hooks/useAuth";
import type { NextPageWithLayout } from "./_app";

// Login functions
import keypairoomClientRecreateKeys from "zenflows-crypto/src/keypairoomClientRecreateKeys";
import { zencode_exec } from "zenroom";

// Layout
import NRULayout from "../components/layout/NRULayout";

// Partials
import Passphrase from "components/partials/auth/Passphrase";
import Questions, { QuestionsNS } from "components/partials/auth/Questions";
import ChooseMode from "components/partials/sign_in/ChooseMode";
import EnterEmail, { EnterEmailNS } from "components/partials/sign_in/EnterEmail";
import ViaPassphrase, { ViaPassphraseNS } from "components/partials/sign_in/ViaPassphrase";
import ViaQuestions from "components/partials/sign_in/ViaQuestions";

// Components
import BrAuthSuggestion from "components/brickroom/BrAuthSuggestion";
import BrError from "components/brickroom/BrError";

//

export async function getStaticProps({ locale }: any) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["signInProps", "authProps"])),
    },
  };
}

//

const Sign_in: NextPageWithLayout = () => {
  const { t } = useTranslation("signInProps");
  const { register, login } = useAuth();
  const { getItem, setItem } = useStorage();
  const router = useRouter();

  //

  const [isPassprhase, setIsPassphrase] = useState(false);
  const [isQuestions, setIsQuestions] = useState(false);
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");

  const [signInData, setSignInData] = useState({
    email: "",
    pdfk: "",
    seed: "",
  });

  //

  const emailEntered = async (data: EnterEmailNS.FormValues) => {
    // Getting HMAC
    const result = await register(data.email, false);
    const key = result.keypairoomServer;
    //
    console.log(key);
    if (!key) {
      setError(t("enterEmail.notRegistered"));
      return;
    }
    //
    setSignInData({
      ...signInData,
      email: data.email,
      pdfk: key,
    });
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
    setSignInData({
      ...signInData,
      seed: data.passphrase,
    });
  };

  const questionsEntered = (data: QuestionsNS.FormValues) => {
    setSignInData({
      ...signInData,
      seed: getItem("seed"),
    });
    setStep(3);
  };

  //

  // TODO: Review
  // A fix for "passphrase" scenario - ask @bbtgnn for explanation
  // Doing login when all the data is ready
  useEffect(() => {
    try {
      // We do this only if it's passphrase mode
      if (!isPassprhase) {
        throw new Error("notPassphrase");
      }

      // Checking if we have all the data
      yup
        .object({
          email: yup.string().required(),
          pdfk: yup.string().required(),
          seed: yup.string().required(),
        })
        .required()
        .validateSync(signInData);

      // Then logging in
      doLogin();

      //
    } catch (error) {}
  });

  //

  async function doLogin() {
    // Requesting data
    const zenData = `
    {
        "seed": "${signInData.seed}",
        "seedServerSideShard.HMAC": "${signInData.pdfk}"
    }`;
    const { result } = await zencode_exec(keypairoomClientRecreateKeys, { data: zenData });
    const res = JSON.parse(result);

    // Setting localstorage
    setItem("eddsa_public_key", res.eddsa_public_key);
    setItem("eddsa_key", res.keyring.eddsa);
    setItem("ethereum_address", res.keyring.ethereum);
    setItem("reflow", res.keyring.reflow);
    setItem("schnorr", res.keyring.schnorr);
    setItem("eddsa", res.keyring.eddsa);
    setItem("seed", res.seed);

    // Logging in
    await login({ email: signInData.email });
    router.push("/");
  }

  //

  return (
    <div className="grid h-full grid-cols-6">
      <div className="col-span-6 p-2 md:col-span-4 md:col-start-2 md:col-end-6">
        <div className="w-full h-full pt-56">
          {/* Entering email */}
          {step === 0 && (
            <EnterEmail onSubmit={emailEntered}>{error && <BrError testID="error">{error}</BrError>}</EnterEmail>
          )}

          {/* Choose login mode */}
          {step === 1 && <ChooseMode viaPassphrase={viaPassphrase} viaQuestions={viaQuestions} />}

          {/* Passphrase login */}
          {step == 2 && isPassprhase && <ViaPassphrase onSubmit={passphraseEntered} />}

          {/* Questions login */}
          {step === 2 && isQuestions && (
            <ViaQuestions>
              <Questions email={signInData.email} HMAC={signInData.pdfk} onSubmit={questionsEntered} />
            </ViaQuestions>
          )}
          {/* Displaying seed */}
          {step === 3 && isQuestions && (
            <Passphrase>
              <button className="block w-full btn btn-primary" onClick={doLogin} data-test="loginBtn">
                {t("buttons.login")}
              </button>
            </Passphrase>
          )}

          {/* Link to registration */}
          {(step === 0 || step === 1) && (
            <div className="mt-8">
              <BrAuthSuggestion baseText={t("register.question")} linkText={t("register.answer")} url="/sign_up" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

//

Sign_in.getLayout = function getLayout(page: ReactElement) {
  return <NRULayout>{page}</NRULayout>;
};
Sign_in.publicPage = true;
export default Sign_in;
