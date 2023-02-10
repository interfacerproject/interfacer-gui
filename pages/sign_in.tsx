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
import { Button } from "@bbtgnn/polaris-interfacer";
import BrAuthSuggestion from "components/brickroom/BrAuthSuggestion";
import BrError from "components/brickroom/BrError";

//

export async function getStaticProps({ locale }: any) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["signInProps", "common"])),
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
    if (!key) {
      setError(t("Email not found"));
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
    setItem("eddsaPrivateKey", res.keyring.eddsa);
    setItem("ethereumPrivateKey", res.keyring.ethereum);
    setItem("reflowPrivateKey", res.keyring.reflow);
    setItem("bitcoinPrivateKey", res.keyring.bitcoin);
    setItem("ecdhPrivateKey", res.keyring.ecdh);
    setItem("seed", res.seed);
    setItem("ecdhPublicKey", res.eddsa_public_key);
    setItem("bitcoinPublicKey", res.bitcoin_public_key);
    setItem("eddsaPublicKey", res.eddsa_public_key);
    setItem("reflowPublicKey", res.reflow_public_key);
    setItem("ethereumAddress", res.ethereum_address);

    // Logging in
    await login({ email: signInData.email });
    router.replace("/");
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
              <Button size="large" primary fullWidth onClick={doLogin} id="loginBtn">
                {t("Login")}
              </Button>
            </Passphrase>
          )}

          {/* Link to registration */}
          {(step === 0 || step === 1) && (
            <div className="mt-8">
              <BrAuthSuggestion
                baseText={t("✌️  You don't have an account yet?")}
                linkText={t("Sign up")}
                url="/sign_up"
              />
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
