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

import { clearInstanceVariablesCache, InterfacerClient, createConfig } from "@dyne/interfacer-client";
import useStorage from "hooks/useStorage";
import { PersonWithFileEssential } from "lib/types/extensions";
import { useRouter } from "next/router";
import { createContext, useEffect, useState } from "react";
import { EmailTemplate } from "../lib/types";

/* Definitions */

export interface User extends PersonWithFileEssential {
  ulid: string;
  username: string;
  publicKey: string;
  privateKey: string;
  profileUrl: string;
}

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

export interface AuthContextValue {
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
  /** Direct access to the SDK client */
  client: InterfacerClient | null;
}

/* Context */

export const AuthContext = createContext<AuthContextValue>({} as AuthContextValue);

/** Create the Interfacer client from environment variables */
function createClient() {
  return new InterfacerClient(
    createConfig({
      zenflowsUrl: process.env.NEXT_PUBLIC_ZENFLOWS_URL || "",
      zenflowsFileUrl: process.env.NEXT_PUBLIC_ZENFLOWS_FILE_URL || "",
      dppUrl: process.env.NEXT_PUBLIC_DPP_URL || "",
      inbox: {
        send: process.env.NEXT_PUBLIC_INBOX_SEND || "",
        read: process.env.NEXT_PUBLIC_INBOX_READ || "",
        countUnread: process.env.NEXT_PUBLIC_INBOX_COUNT_UNREAD || "",
        setRead: process.env.NEXT_PUBLIC_INBOX_SET_READ || "",
      },
      walletUrl: process.env.NEXT_PUBLIC_WALLET || "",
      social: {
        personBase: process.env.NEXT_PUBLIC_SOCIAL_PERSON || "",
        economicResourceBase: process.env.NEXT_PUBLIC_SOCIAL_ECONOMIC_RESOURCE || "",
      },
      oshUrl: process.env.NEXT_PUBLIC_OSH || "",
      loshId: process.env.NEXT_PUBLIC_LOSH_ID || "",
      zenflowsAdmin: process.env.NEXT_PUBLIC_ZENFLOWS_ADMIN || "",
      specs: {
        machine: process.env.NEXT_PUBLIC_SPEC_MACHINE || "",
        dpp: process.env.NEXT_PUBLIC_SPEC_DPP || "",
      },
    })
  );
}

export const AuthProvider = ({ children, publicPage = false }: any) => {
  const { getItem, setItem, clear } = useStorage();
  const router = useRouter();

  const [authenticated, setAuthenticated] = useState<AuthContextValue["authenticated"]>(false);
  const [user, setUser] = useState<AuthContextValue["user"]>(null);
  const [loading, setLoading] = useState<AuthContextValue["loading"]>(true);
  const [client, setClient] = useState<InterfacerClient | null>(null);

  const isAuthenticationProcess = () => {
    const path = router.asPath;
    const paths = ["/sign_in", "/sign_up", "/sign_out", "/keyring_generation", "/verify_seed"];
    return paths.includes(path) || (!authenticated && path === "/");
  };

  // Initialize client
  useEffect(() => {
    setClient(createClient());
  }, []);

  // Restore session from localStorage
  useEffect(() => {
    if (!client) return;

    const privateKey = getItem("eddsaPrivateKey");
    const email = getItem("authEmail");

    if (Boolean(privateKey) && Boolean(email)) {
      setAuthenticated(true);
      clearInstanceVariablesCache();

      const fetchUser = async () => {
        try {
          const profile = await client.auth.login({ email });
          setUser({
            id: profile.id,
            ulid: profile.id,
            email,
            user: profile.username,
            username: profile.username,
            name: profile.name,
            privateKey: getItem("eddsaPrivateKey") as string,
            publicKey: client.getPublicKey() || "",
            profileUrl: `/profile/${profile.id}`,
            note: profile.note || "",
            images: profile.image
              ? [
                  {
                    mimeType: profile.image.split(";")[0]?.replace("data:", "") || "image/jpeg",
                    bin: profile.image.split(",")[1] || "",
                  },
                ]
              : [],
            primaryLocation: profile.location
              ? {
                  id: profile.location.id || "",
                  name: profile.location.name,
                  mappableAddress: profile.location.address || "",
                  lat: profile.location.lat || 0,
                  long: profile.location.lng || 0,
                }
              : undefined,
            isVerified: profile.isVerified,
          });
        } catch {
          // Session stale, clear it
          clear();
          setUser(null);
          setAuthenticated(false);
        }
        setLoading(false);
      };

      fetchUser();
      return;
    } else {
      if (!publicPage) {
        router.push("/sign_in");
        window.location.href = "/sign_in";
      }
      setLoading(false);
    }
  }, [client, router.asPath]);

  const login: LoginFn = async ({ email }) => {
    if (authenticated || !client) return;

    const profile = await client.auth.login({ email });
    setItem("authId", profile.id);
    setItem("authName", profile.name);
    setItem("authUsername", profile.username);
    setItem("authEmail", profile.email);
    setUser({
      id: profile.id,
      ulid: profile.id,
      email,
      user: profile.username,
      username: profile.username,
      name: profile.name,
      privateKey: getItem("eddsaPrivateKey") as string,
      publicKey: client.getPublicKey() || "",
      profileUrl: `/profile/${profile.id}`,
      note: profile.note || "",
      images: profile.image ? [{ mimeType: "image/jpeg", bin: profile.image.split(",")[1] || "" }] : [],
      primaryLocation: profile.location
        ? {
            id: profile.location.id || "",
            name: profile.location.name,
            mappableAddress: profile.location.address || "",
            lat: profile.location.lat || 0,
            long: profile.location.lng || 0,
          }
        : undefined,
      isVerified: profile.isVerified,
    });
    setAuthenticated(true);
  };

  const register: RegisterFn = async (email, firstRegistration) => {
    if (!client) return "Client not ready";
    try {
      const hmac = await client.auth.requestHmac(email, firstRegistration);
      return { keypairoomServer: hmac };
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

  const keypair: KeypairFn = async props => {
    if (!client) return;
    const { question1, question2, question3, question4, question5, email, HMAC } = props;

    await client.auth.deriveKeys(
      {
        whereParentsMet: question1,
        nameFirstPet: question2,
        nameFirstTeacher: question3,
        whereHomeTown: question4,
        nameMotherMaid: question5,
      },
      email,
      HMAC
    );

    // Sync SDK store back to localStorage (the GUI's useStorage reads from localStorage)
    setItem("eddsaPrivateKey", client.store.getItem("eddsaPrivateKey") || "");
    setItem("ethereumPrivateKey", client.store.getItem("ethereumPrivateKey") || "");
    setItem("reflowPrivateKey", client.store.getItem("reflowPrivateKey") || "");
    setItem("bitcoinPrivateKey", client.store.getItem("bitcoinPrivateKey") || "");
    setItem("ecdhPrivateKey", client.store.getItem("ecdhPrivateKey") || "");
    setItem("seed", client.store.getItem("seed") || "");
    setItem("ecdhPublicKey", client.store.getItem("ecdhPublicKey") || "");
    setItem("bitcoinPublicKey", client.store.getItem("bitcoinPublicKey") || "");
    setItem("eddsaPublicKey", client.store.getItem("eddsaPublicKey") || "");
    setItem("reflowPublicKey", client.store.getItem("reflowPublicKey") || "");
    setItem("ethereumAddress", client.store.getItem("ethereumAddress") || "");
  };

  const signup: SignupFn = async props => {
    if (!client) return;
    await client.auth.registerUser({
      name: props.name,
      user: props.user,
      email: props.email,
    });
    setItem("authId", client.store.getItem("authId") || "");
    setItem("authName", props.name);
    setItem("authUsername", props.user);
    setItem("authEmail", props.email);
  };

  const logout: LogoutFn = (redirect = "/sign_in") => {
    if (client) client.auth.logout();
    clear();
    clearInstanceVariablesCache();
    setUser(null);
    setAuthenticated(false);
    router.push(redirect);
  };

  /* Email verification */

  const EMAIL_TEMPLATES: Record<string, EmailTemplate> = {
    "https://interfacer.dyne.org": EmailTemplate.InterfacerDeployment,
    "https://interfacer-gui-staging.dyne.org": EmailTemplate.InterfacerStaging,
    "http://localhost:3000": EmailTemplate.InterfacerTesting,
    "https://beta.interfacer.dyne.org": EmailTemplate.InterfacerBeta,
  };

  function getEmailTemplate() {
    if (typeof window !== "undefined" && window.location.origin)
      return EMAIL_TEMPLATES[window.location.origin] || EmailTemplate.InterfacerSelf;
    else return EmailTemplate.InterfacerTesting;
  }

  async function sendEmailVerification() {
    if (!client) return;
    await client.auth.sendEmailVerification();
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
        client,
      }}
    >
      {loading ? <div>Loading...</div> : children}
    </AuthContext.Provider>
  );
};
