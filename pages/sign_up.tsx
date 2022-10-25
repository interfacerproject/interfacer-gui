// Functionality
import { useAuth } from "hooks/useAuth";
import useStorage from "hooks/useStorage";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { ReactElement, useState } from "react";
import { NextPageWithLayout } from "./_app";

// Components
import EmailVerificationForm, { SignUpFormValues } from "../components/EmailVerificationForm";
import InvitationKey from "../components/InvitationKey";
import NRULayout from "../components/layout/NRULayout";
import Questions, { QuestionsFormValues } from "../components/Questions";

//

export async function getStaticProps({ locale }: any) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["signUpProps", "signInProps"])),
    },
  };
}

const SignUp: NextPageWithLayout = () => {
  const { t } = useTranslation(["signInProps"]);

  const { signup, keypair, login, register } = useAuth();

  const [signUpData, setSignUpData] = useState({
    name: "",
    email: "",
    user: "",
    HMAC: "",
    eddsaPublicKey: "",
    question1: "",
    question2: "",
    question3: "",
    question4: "",
    question5: "",
    seed: "",
  });

  const [step, setStep] = useState(0);
  const [signUpError, setSignUpError] = useState("");

  function nextStep() {
    setStep(step + 1);
  }

  const { getItem } = useStorage();

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

  async function submit2(data: QuestionsFormValues) {
    // Replacing empty fields from "null"
    for (let key in data) {
      // @ts-ignore
      data[key] = data[key] === "" ? "null" : data[key];
    }
    // Creating keypair
    await keypair({
      ...data,
      email: signUpData.email,
      HMAC: signUpData.HMAC,
    });
    // Adding data
    setSignUpData({
      ...signUpData,
      ...data,
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
      window.location.replace("/");
    } catch (err) {
      setSignUpError(err as string);
    }
  };

  return (
    <div className="grid h-full grid-cols-6 mt-2 md:mt-40">
      <div className="col-span-6 p-2 md:col-span-4 md:col-start-2 md:col-end-6">
        <pre>{JSON.stringify(signUpData, null, 2)}</pre>

        {/* Step 0: invitation key */}
        {step === 0 && <InvitationKey onSubmit={nextStep} />}

        {/* Step 1: Collecting user data */}
        {step === 1 && <EmailVerificationForm onSubmit={submit1} />}

        {/* Step 2: User questions */}
        {step === 2 && <Questions onSubmit={submit2} />}

        {/* Step 3: User creation */}
        {step === 3 && (
          <div>
            {/* The seed – List of words */}
            <p className="mt-4 mb-6">
              <p>{t("reminder")}</p>
              <span className="block p-4 mt-2 font-mono bg-white border rounded-md">{signUpData.seed}</span>
            </p>

            {signUpError && <p>{signUpError}</p>}

            {/* Submit button */}
            <button className="btn btn-block btn-accent" onClick={signUp}>
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
