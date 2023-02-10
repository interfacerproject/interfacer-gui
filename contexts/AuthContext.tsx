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
import createApolloClient from "lib/createApolloClient";
import { useRouter } from "next/router";
import { createContext, useEffect, useState } from "react";
import { zencode_exec } from "zenroom";
import keypairoomClient from "../zenflows-crypto/src/keypairoomClient-8-9-10-11-12";

export const AuthContext = createContext(
  {} as {
    user: User | null;
    login: ({ email }: { email: string }) => Promise<void>;
    logout: (redirect?: string) => void;
    authenticated: boolean;
    loading: boolean;
    authenticationProcess: boolean;
    register: (email: string, firstRegistration: boolean) => Promise<any>;
    keypair: ({
      question1,
      question2,
      question3,
      question4,
      question5,
      email,
      HMAC,
    }: {
      question1: string;
      question2: string;
      question3: string;
      question4: string;
      question5: string;
      email: string;
      HMAC: string;
    }) => Promise<void>;
    signup: ({
      name,
      user,
      email,
      eddsaPublicKey,
      ethereumAddress,
      ecdhPublicKey,
      reflowPublicKey,
      bitcoinPublicKey,
    }: {
      name: string;
      user: string;
      email: string;
      eddsaPublicKey: string;
      ethereumAddress: string;
      ecdhPublicKey: string;
      reflowPublicKey: string;
      bitcoinPublicKey: string;
    }) => Promise<void>;
  }
);

type User = {
  ulid: string;
  email: string;
  username: string;
  name: string;
  publicKey: string;
  privateKey: string;
};

export const AuthProvider = ({ children, publicPage = false }: any) => {
  const { getItem, setItem, clear } = useStorage();
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState(null as User | null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

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

  const login = async ({ email }: { email: string }) => {
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

  const register = async (email: string, firstRegistration: boolean) => {
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

  const keypair = async ({
    question1,
    question2,
    question3,
    question4,
    question5,
    email,
    HMAC,
  }: {
    question1: string;
    question2: string;
    question3: string;
    question4: string;
    question5: string;
    email: string;
    HMAC: string;
  }) => {
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

  const signup = async ({
    name,
    user,
    email,
    eddsaPublicKey,
    ethereumAddress,
    ecdhPublicKey,
    reflowPublicKey,
    bitcoinPublicKey,
  }: {
    name: string;
    user: string;
    email: string;
    eddsaPublicKey: string;
    reflowPublicKey: string;
    ethereumAddress: string;
    ecdhPublicKey: string;
    bitcoinPublicKey: string;
  }) => {
    const client = createApolloClient(false);
    const SignUpMutation = gql`mutation  {
              createPerson(person: {
                name: "${name}"
                user: "${user}"
                email: "${email}"
                eddsaPublicKey: "${eddsaPublicKey}"
                reflowPublicKey: "${reflowPublicKey}"
                ethereumAddress: "${ethereumAddress}"
                ecdhPublicKey: "${ecdhPublicKey}"
                bitcoinPublicKey: "${bitcoinPublicKey}"
              }) {
              agent{
                id
                name
                user
                email
                eddsaPublicKey
              }
              }
            }`;

    await client
      .mutate({
        mutation: SignUpMutation,
        context: {
          headers: { "zenflows-admin": process.env.NEXT_PUBLIC_ZENFLOWS_ADMIN },
        },
      })
      .then(({ data }) => {
        setItem("authId", data?.createPerson.agent.id);
        setItem("authName", data?.createPerson.agent.name);
        setItem("authUsername", data?.createPerson.agent.user);
        setItem("authEmail", data?.createPerson.agent.email);
      });
  };

  const logout = (redirect = "/sign_in") => {
    clear();
    router.push(redirect || "/sign_in", undefined, { shallow: true });
  };

  return (
    <AuthContext.Provider
      value={{
        authenticated,
        user,
        loading,
        logout,
        login,
        authenticationProcess: isAuthenticationProcess(),
        register,
        signup,
        keypair,
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
