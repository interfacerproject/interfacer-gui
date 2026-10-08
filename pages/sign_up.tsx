// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2022-2023 Dyne.org foundation <foundation@dyne.org>.
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

// Functionality
import { useMutation } from "lib/apollo-compat";
import { useAuth } from "hooks/useAuth";
import useStorage from "hooks/useStorage";
import { CLAIM_DID } from "lib/QueryAndMutation";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";
import { ReactElement, useRef, useState } from "react";
import { completeSignup, signupErrorMessage } from "lib/signupCompletion";
import type { NextPageWithLayout } from "./_app";

// Layout
import Layout from "../components/layout/Layout";

// Partials
import Passphrase from "components/partials/auth/Passphrase";
import Questions, { QuestionsNS } from "components/partials/auth/Questions";
import AnswerQuestions from "components/partials/sign_up/AnswerQuestions";
import InvitationKey from "components/partials/sign_up/InvitationKey";
import UserData, { UserDataNS } from "components/partials/sign_up/UserData";

// Components
import { AuthButton, AuthError, AuthPage } from "components/partials/auth/AuthCard";

export async function getStaticProps({ locale }: any) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["signUpProps", "signInProps", "common"])),
    },
  };
}

//

const SignUp: NextPageWithLayout = () => {
  const { signup, login, register, sendEmailVerification } = useAuth();
  const { setItem, getItem } = useStorage();
  const router = useRouter();
  const { t } = useTranslation("signUpProps");
  const [claimPerson] = useMutation(CLAIM_DID);

  const claim = async (id: string) => {
    const { data, errors } = await claimPerson({ variables: { id } });
    if (errors?.length) throw new Error("DID claim failed");
    const didId = data?.claimPerson?.did?.result?.didDocument?.id;
    if (typeof didId !== "string" || !didId) throw new Error("Invalid DID claim response");
    setItem("didId", didId);
  };

  //

  const [signUpData, setSignUpData] = useState({
    name: "",
    email: "",
    user: "",
    HMAC: "",
  });

  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const submissionInProgress = useRef(false);
  const accountCreated = useRef(false);

  //

  function nextStep() {
    setStep(step + 1);
  }

  async function userDataSubmit(data: UserDataNS.FormValues) {
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

  async function questionsSubmit(data: QuestionsNS.FormValues) {
    nextStep();
  }

  const signUp = async () => {
    // A ref also guards clicks that arrive before React commits the disabled state.
    if (submissionInProgress.current) return;
    submissionInProgress.current = true;
    setSubmitting(true);
    setError("");
    try {
      await completeSignup({
        signup: async () => {
          // If login fails after creation, a retry must not create the same account again.
          if (accountCreated.current) return;
          await signup({
            ...signUpData,
            eddsaPublicKey: getItem("eddsaPublicKey"),
            ethereumAddress: getItem("ethereumAddress"),
            bitcoinPublicKey: getItem("bitcoinPublicKey"),
            ecdhPublicKey: getItem("ecdhPublicKey"),
            reflowPublicKey: getItem("reflowPublicKey"),
          });
          accountCreated.current = true;
        },
        login: () => login({ email: signUpData.email }),
        sendEmailVerification,
        claimDid: () => claim(getItem("authId")),
        onFollowUpFailure: task => {
          // Do not log response bodies, keys or user data.
          console.warn("Post-signup task failed:", task);
        },
        navigateHome: async () => {
          try {
            if (await router.replace("/")) return;
          } catch {
            // Keep an authenticated account out of the registration error state.
          }
          window.location.assign("/");
        },
      });
    } catch (err) {
      setError(signupErrorMessage(err, t("We couldn't complete sign up. Please try again.")));
    } finally {
      submissionInProgress.current = false;
      setSubmitting(false);
    }
  };

  //

  return (
    <AuthPage>
      {/* Step 0: invitation key */}
      {step === 0 && <InvitationKey onSubmit={nextStep} />}

      {/* Step 1: Collecting user data */}
      {step === 1 && <UserData onSubmit={userDataSubmit} />}

      {/* Step 2: User questions */}
      {step === 2 && (
        <AnswerQuestions>
          <Questions
            email={signUpData.email}
            HMAC={signUpData.HMAC}
            onSubmit={questionsSubmit}
            submitLabel={t("Continue")}
          />
        </AnswerQuestions>
      )}

      {/* Step 3: User creation */}
      {step === 3 && (
        <Passphrase>
          {error && (
            <div role="alert" data-test="signUpError">
              <AuthError>{error}</AuthError>
            </div>
          )}

          <AuthButton onClick={signUp} data-test="signUpBtn" disabled={submitting} aria-busy={submitting}>
            {submitting ? t("Creating your account…") : t("Create account")}
          </AuthButton>

          <p className="text-[14px] leading-[21px] text-ifr-text-muted">
            {t("Once registered, you will receive an email with a link to verify your email address.")}
          </p>
        </Passphrase>
      )}
    </AuthPage>
  );
};

//

SignUp.getLayout = function getLayout(page: ReactElement) {
  return <Layout bottomPadding="none">{page}</Layout>;
};
SignUp.publicPage = true;
export default SignUp;
