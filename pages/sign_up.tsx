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
import { gql, useMutation } from "@apollo/client";
import { useAuth } from "hooks/useAuth";
import useStorage from "hooks/useStorage";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";
import { ReactElement, useState } from "react";
import type { NextPageWithLayout } from "./_app";

// Layout
import NRULayout from "../components/layout/NRULayout";

// Partials
import Passphrase from "components/partials/auth/Passphrase";
import Questions, { QuestionsNS } from "components/partials/auth/Questions";
import AnswerQuestions from "components/partials/sign_up/AnswerQuestions";
import InvitationKey from "components/partials/sign_up/InvitationKey";
import UserData, { UserDataNS } from "components/partials/sign_up/UserData";

// Components
import BrAuthSuggestion from "components/brickroom/BrAuthSuggestion";
import BrError from "components/brickroom/BrError";
import devLog from "lib/devLog";

export async function getStaticProps({ locale }: any) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["signUpProps", "common"])),
    },
  };
}

//

const SignUp: NextPageWithLayout = () => {
  const { signup, login, register, user } = useAuth();
  const { setItem, getItem } = useStorage();
  const router = useRouter();
  const { t } = useTranslation("signUpProps");
  const [claimPerson] = useMutation(gql`
    mutation ($id: ID!) {
      claimPerson(id: $id)
    }
  `);

  const claim = async (id: string) => {
    try {
      const { data } = await claimPerson({ variables: { id } });
      setItem("didId", data?.claimPerson.did.result.didDocument.id);
    } catch (err) {
      devLog("signUp", "claim", err);
    }
  };

  //

  const [signUpData, setSignUpData] = useState({
    name: "",
    email: "",
    user: "",
    HMAC: "",
  });

  const [step, setStep] = useState(0);
  const [error, setError] = useState("");

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
    try {
      await signup({
        ...signUpData,
        eddsaPublicKey: getItem("eddsaPublicKey"),
        ethereumAddress: getItem("ethereumAddress"),
        bitcoinPublicKey: getItem("bitcoinPublicKey"),
        ecdhPublicKey: getItem("ecdhPublicKey"),
        reflowPublicKey: getItem("reflowPublicKey"),
      });

      await login({ email: signUpData.email });
      await claim(getItem("authId"));
      router.push("/");
    } catch (err) {
      setError(JSON.stringify(err));
    }
  };

  //

  return (
    <div className="grid h-full grid-cols-6 mt-2 md:mt-40">
      <div className="col-span-6 p-2 md:col-span-4 md:col-start-2 md:col-end-6">
        {/* Step 0: invitation key */}
        {step === 0 && <InvitationKey onSubmit={nextStep} />}

        {/* Step 1: Collecting user data */}
        {step === 1 && <UserData onSubmit={userDataSubmit} />}

        {/* Step 2: User questions */}
        {step === 2 && (
          <AnswerQuestions>
            <Questions email={signUpData.email} HMAC={signUpData.HMAC} onSubmit={questionsSubmit} />
          </AnswerQuestions>
        )}

        {/* Step 3: User creation */}
        {step === 3 && (
          <Passphrase>
            {/* Displays eventual sign_up error */}
            {error && <BrError>{error}</BrError>}

            {/* Submit button */}
            <button className="btn btn-block btn-accent" onClick={signUp} data-test="signUpBtn">
              {t("Register and login")}
            </button>
          </Passphrase>
        )}

        {/* Invitation to login */}
        {(step == 0 || step == 1) && (
          <div className="mt-8">
            <BrAuthSuggestion linkText={t("LogIn")} baseText={t("Do you have already an account?")} url="/sign_in" />
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
