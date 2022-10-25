// Functionality
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { ReactElement, useState } from "react";
import { NextPageWithLayout } from "./_app";

// Components
import EmailVerificationForm from "../components/EmailVerificationForm";
import InvitationKey from "../components/InvitationKey";
import KeyringGeneration from "../components/KeyringGeneration";
import NRULayout from "../components/layout/NRULayout";

export async function getStaticProps({ locale }: any) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["signUpProps", "signInProps"])),
    },
  };
}

const SignUp: NextPageWithLayout = () => {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [user, setUser] = useState("");
  const [HMAC, setHMAC] = useState("");

  async function onSubmit() {
    setStep(2);
  }

  function nextStep() {
    setStep(step + 1);
  }

  return (
    <div className="grid h-full grid-cols-6 mt-2 md:mt-40">
      <div className="col-span-6 p-2 md:col-span-4 md:col-start-2 md:col-end-6">
        {/* Step 0: invitation key */}
        {step === 0 && <InvitationKey onSubmit={nextStep} />}

        {/* Step 1: Collecting user data */}
        {step === 1 && (
          <EmailVerificationForm
            onSubmit={onSubmit}
            setEmail={setEmail}
            setName={setName}
            setUser={setUser}
            setHMAC={setHMAC}
          />
        )}
        {step === 2 && <KeyringGeneration email={email} user={user} name={name} HMAC={HMAC} isSignUp={true} />}
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
