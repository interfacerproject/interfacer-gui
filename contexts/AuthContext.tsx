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

import { ApolloProvider, gql } from "@apollo/client";
import useStorage from "hooks/useStorage";
import { SEND_EMAIL_VERIFICATION, SIGN_UP } from "lib/QueryAndMutation";
import createApolloClient from "lib/createApolloClient";
import {
  EmailTemplate,
  SendEmailVerificationMutation,
  SendEmailVerificationMutationVariables,
  SignUpMutation,
  SignUpMutationVariables,
} from "lib/types";
import { useRouter } from "next/router";
import { createContext, useEffect, useState } from "react";
import { zencode_exec } from "zenroom";
import keypairoomClient from "../zenflows-crypto/src/keypairoomClient-8-9-10-11-12";

/* Definitions */

export type User = {
  ulid: string;
  email: string;
  username: string;
  name: string;
  publicKey: string;
  privateKey: string;
};

type LoginFn = (props: { email: string }) => Promise<void>;
type LogoutFn = (redirect?: string) => void;
type RegisterFn = (email: string, firstRegistration: boolean) => Promise<any>;

interface KeypairFnProps {
  question1: string;
  question2: string;
  question3: string;
  question4: string;
  question5: string;
  email: string;
  HMAC: string;
}
type KeypairFn = (props: KeypairFnProps) => Promise<void>;

interface SignupFnProps {
  name: string;
  user: string;
  email: string;
  eddsaPublicKey: string;
  ethereumAddress: string;
  ecdhPublicKey: string;
  reflowPublicKey: string;
  bitcoinPublicKey: string;
}
type SignupFn = (props: SignupFnProps) => Promise<void>;

interface AuthContextValue {
  user: User | null;
  authenticated: boolean;
  loading: boolean;
  isAuthenticationProcess: () => boolean;
  login: LoginFn;
  logout: LogoutFn;
  register: RegisterFn;
  keypair: KeypairFn;
  signup: SignupFn;
  sendEmailVerification: () => Promise<void>;
}

/* Context */

export const AuthContext = createContext<AuthContextValue>({} as AuthContextValue);

export const AuthProvider = ({ children, publicPage = false }: any) => {
  const { getItem, setItem, clear } = useStorage();
  const router = useRouter();

  const [authenticated, setAuthenticated] = useState<AuthContextValue["authenticated"]>(false);
  const [user, setUser] = useState<AuthContextValue["user"]>(null);
  const [loading, setLoading] = useState<AuthContextValue["loading"]>(true);

  const isAuthenticationProcess = () => {
    const path = router.asPath;
    const paths = ["/sign_in", "/sign_up", "/sign_out", "/keyring_generation", "/verify_seed"];
    return paths.includes(path) || (!authenticated && path === "/");
  };

  useEffect(() => {
    const privateKey = getItem("eddsaPrivateKey");
    const username = getItem("authUsername");

    if (Boolean(privateKey) && Boolean(username)) {
      const ulid = getItem("authId") as string;
      const name = getItem("authName") as string;
      const email = getItem("authEmail") as string;
      const publicKey = getItem("eddsaPublicKey") as string;
      setAuthenticated(true);
      setUser({
        ulid,
        email,
        username,
        name,
        privateKey,
        publicKey,
      });
      setLoading(false);
      return;
    } else {
      if (!publicPage) {
        router.push("/sign_in");
        window.location.href = "/sign_in";
      }
      setLoading(false);
    }
  }, [router.asPath]);

  const login: LoginFn = async ({ email }) => {
    if (authenticated) return;

    const client = createApolloClient(false);
    const publicKey = getItem("eddsaPublicKey") as string;
    const SignInMutation = gql`
      query ($email: String!, $pubkey: String!) {
        personCheck(email: $email, eddsaPublicKey: $pubkey) {
          name
          user
          email
          id
        }
      }
    `;
    await client
      .query({
        query: SignInMutation,
        variables: { email, pubkey: publicKey },
      })
      .then(({ data }) => {
        setItem("authId", data?.personCheck.id);
        setItem("authName", data?.personCheck.name);
        setItem("authUsername", data?.personCheck.user);
        setItem("authEmail", data?.personCheck.email);
        setAuthenticated(true);
        setUser({
          ulid: data?.personCheck.id,
          email,
          username: data?.personCheck.user,
          name: data?.personCheck.name,
          privateKey: getItem("eddsaPrivateKey") as string,
          publicKey,
        });
      });
  };

  const register: RegisterFn = async (email, firstRegistration) => {
    const client = createApolloClient(false);
    const KEYPAIROOM_SERVER_MUTATION = gql`mutation {keypairoomServer(firstRegistration: ${firstRegistration}, userData: "{\\"email\\": \\"${email}\\"}")}`;
    try {
      const { data } = await client.mutate({ mutation: KEYPAIROOM_SERVER_MUTATION });
      return data;
    } catch (error) {
      if (`${error}`.includes("email doesn't exists")) {
        return "email doesn't exists";
      } else if (`${error}`.includes("email exists")) {
        return "email has already been registered";
      } else {
        return "unknow error";
      }
    }
  };

  const keypair: KeypairFn = async ({ question1, question2, question3, question4, question5, email, HMAC }) => {
    const zenData = `
            {
                "userChallenges": {
                    "whereParentsMet":"${question1}",
                    "nameFirstPet":"${question2}",
                    "nameFirstTeacher":"${question3}",
                    "whereHomeTown":"${question4}",
                    "nameMotherMaid":"${question5}",
                },
                "username": "${email}",
                "seedServerSideShard.HMAC": "${HMAC}"
            }`;

    return await zencode_exec(keypairoomClient, { data: zenData }).then(({ result }) => {
      const res = JSON.parse(result);
      setItem("eddsaPrivateKey", res.keyring.eddsa);
      setItem("ethereumPrivateKey", res.keyring.ethereum);
      setItem("reflowPrivateKey", res.keyring.reflow);
      setItem("bitcoinPrivateKey", res.keyring.bitcoin);
      setItem("ecdhPrivateKey", res.keyring.ecdh);
      setItem("seed", res.seed);
      setItem("ecdhPublicKey", res.ecdh_public_key);
      setItem("bitcoinPublicKey", res.bitcoin_public_key);
      setItem("eddsaPublicKey", res.eddsa_public_key);
      setItem("reflowPublicKey", res.reflow_public_key);
      setItem("ethereumAddress", res.ethereum_address);
    });
  };

  const signup: SignupFn = async props => {
    const client = createApolloClient(false);
    await client
      .mutate<SignUpMutation, SignUpMutationVariables>({
        mutation: SIGN_UP,
        variables: props,
        context: {
          headers: { "zenflows-admin": process.env.NEXT_PUBLIC_ZENFLOWS_ADMIN },
        },
      })
      .then(({ data }) => {
        const agent = data?.createPerson.agent;
        if (!agent) return;
        setItem("authId", agent.id);
        setItem("authName", agent.name);
        setItem("authUsername", agent.user);
        setItem("authEmail", agent.email);
      });
  };

  const logout: LogoutFn = (redirect = "/sign_in") => {
    clear();
    router.push(redirect || "/sign_in", undefined, { shallow: true });
  };

  /* Email verification */

  const SEND_EMAIL_VERIFICATION_TEMPLATES: Array<{ template: EmailTemplate; url: string }> = [
    {
      template: EmailTemplate.InterfacerTesting,
      url: "https://gateway0.interfacer.dyne.org",
    },
    {
      template: EmailTemplate.InterfacerStaging,
      url: "https://gateway1.interfacer.dyne.org",
    },
  ];

  function getEmailVerificationTemplateFromEnv() {
    for (let t of SEND_EMAIL_VERIFICATION_TEMPLATES) {
      if (process.env.BASE_URL === t.url) {
        return t.template;
      }
    }
    return EmailTemplate.InterfacerTesting;
  }

  async function sendEmailVerification() {
    if (!authenticated) {
      throw new Error("User not authenticated");
    }

    const client = createApolloClient(authenticated);

    await client.mutate<SendEmailVerificationMutation, SendEmailVerificationMutationVariables>({
      mutation: SEND_EMAIL_VERIFICATION,
      variables: {
        template: getEmailVerificationTemplateFromEnv(),
      },
    });
  }

  //

  return (
    <AuthContext.Provider
      value={{
        authenticated,
        user,
        loading,
        logout,
        login,
        isAuthenticationProcess,
        register,
        signup,
        keypair,
        sendEmailVerification,
      }}
    >
      {loading ? (
        <div>Loading...</div>
      ) : (
        <ApolloProvider client={createApolloClient(authenticated)}>{children}</ApolloProvider>
      )}
    </AuthContext.Provider>
  );
};
