// Functionality
import { useAuth } from "hooks/useAuth";
import useStorage from "hooks/useStorage";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";
import { ReactElement, useState } from "react";
import { NextPageWithLayout } from "./_app";

// Components
// import { doLogin } from "lib/doLogIn";
import Questions, { QuestionsNS } from "components/partials/auth/Questions";
import EmailVerificationForm, { SignUpFormValues } from "../components/EmailVerificationForm";
import InvitationKey from "../components/InvitationKey";
import NRULayout from "../components/layout/NRULayout";

//

export async function getStaticProps({ locale }: any) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["signUpProps", "signInProps"])),
    },
  };
}

const SignUp: NextPageWithLayout = () => {
  const { t } = useTranslation(["signInProps"], {
    keyPrefix: "step_questions",
  });

  const { signup, keypair, login, register } = useAuth();

  const [signUpData, setSignUpData] = useState({
    name: "",
    email: "",
    user: "",
    HMAC: "",
    eddsaPublicKey: "",
    seed: "",
  });

  const [step, setStep] = useState(0);
  const [error, setError] = useState("");

  function nextStep() {
    setStep(step + 1);
  }

  const { getItem, setItem } = useStorage();
  const router = useRouter();

  async function submit1(data: SignUpFormValues) {
    // Registering email for HMAC
    const result = await register(data.email, true);
    const HMAC = result.keypairoomServer;
    // Adding data
    setSignUpData({
      ...signUpData,
      ...data,
      HMAC,
    });
    // Advancing
    nextStep();
  }

  async function submit2(data: QuestionsNS.FormValues) {
    // Adding data
    setSignUpData({
      ...signUpData,
      eddsaPublicKey: getItem("eddsa_public_key"),
      seed: getItem("seed"),
    });
    // Advancing
    nextStep();
  }

  const signUp = async () => {
    try {
      await signup({
        name: signUpData.name,
        user: signUpData.user,
        email: signUpData.email,
        eddsaPublicKey: signUpData.eddsaPublicKey,
      });

      // await doLogin(signUpData.email, signUpData.seed, signUpData.HMAC, router, login, setItem);
    } catch (err) {
      setError(err as string);
    }
  };

  return (
    <div className="grid h-full grid-cols-6 mt-2 md:mt-40">
      <div className="col-span-6 p-2 md:col-span-4 md:col-start-2 md:col-end-6">
        {/* Step 0: invitation key */}
        {step === 0 && <InvitationKey onSubmit={nextStep} />}

        {/* Step 1: Collecting user data */}
        {step === 1 && <EmailVerificationForm onSubmit={submit1} />}

        {/* Step 2: User questions */}
        {step === 2 && (
          <>
            <h2>{t("keyring_title")}</h2>
            <p className="mt-4 mb-6">{t("subtitle_signup")}</p>
            <p className="mb-4 font-semibold text-primary">{t("hint")}</p>
            <Questions email={signUpData.email} HMAC={signUpData.HMAC} onSubmit={submit2} />
          </>
        )}

        {/* Step 3: User creation */}
        {step === 3 && (
          <div>
            {/* The seed – List of words */}
            <div className="mt-4 mb-6">
              <p>{t("reminder")}</p>
              <span className="block p-4 mt-2 font-mono bg-white border rounded-md" data-test="passphrase">
                {signUpData.seed}
              </span>
            </div>

            {error && <p>{JSON.stringify(error)}</p>}

            {/* Submit button */}
            <button className="btn btn-block btn-accent" onClick={signUp} data-test="signUpBtn">
              Sign up!
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

//

SignUp.getLayout = function getLayout(page: ReactElement) {
  return <NRULayout>{page}</NRULayout>;
};
SignUp.publicPage = true;
export default SignUp;
