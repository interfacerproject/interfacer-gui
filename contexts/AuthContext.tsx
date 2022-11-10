import { ApolloProvider, gql } from "@apollo/client";
import createApolloClient from "lib/createApolloClient";
import useStorage from "hooks/useStorage";
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
    }: {
      name: string;
      user: string;
      email: string;
      eddsaPublicKey: string;
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
    const privateKey = getItem("eddsa_key");
    const username = getItem("authUsername");

    if (!!privateKey && !!username) {
      const ulid = getItem("authId") as string;
      const name = getItem("authName") as string;
      const email = getItem("authEmail") as string;
      const publicKey = getItem("eddsa_public_key") as string;
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
        window.location.href = "/sign_in";
      }
      setLoading(false);
    }
  }, []);

  const login = async ({ email }: { email: string }) => {
    if (authenticated) return;

    const client = createApolloClient(false);
    const publicKey = getItem("eddsa_public_key") as string;
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
          privateKey: getItem("eddsa_key") as string,
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
      setItem("eddsa_public_key", res.eddsa_public_key);
      setItem("eddsa_key", res.keyring.eddsa);
      setItem("ethereum_address", res.keyring.ethereum);
      setItem("reflow", res.keyring.reflow);
      setItem("schnorr", res.keyring.schnorr);
      setItem("eddsa", res.keyring.eddsa);
      setItem("seed", res.seed);
    });
  };

  const signup = async ({
    name,
    user,
    email,
    eddsaPublicKey,
  }: {
    name: string;
    user: string;
    email: string;
    eddsaPublicKey: string;
  }) => {
    const client = createApolloClient(false);
    const SignUpMutation = gql`mutation  {
              createPerson(person: {
                name: "${name}"
                user: "${user}"
                email: "${email}"
                eddsaPublicKey: "${eddsaPublicKey}"
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
