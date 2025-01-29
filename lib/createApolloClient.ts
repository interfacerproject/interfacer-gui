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

import useStorage from "../hooks/useStorage";
//@ts-ignore
import sign from "zenflows-crypto/src/sign_graphql.zen";

import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";

interface FetchHttpOptions {
  uri?: string;
  fetch?: WindowOrWorkerGlobalScope["fetch"];
}

const useAuthAndFetch = async (uri: RequestInfo, options: RequestInit) => {
  const zencode_exec = (await import("zenroom")).zencode_exec;
  const { getItem } = useStorage();
  const signRequest = async (body: string) => {
    const zenKeys = JSON.stringify({ keyring: { eddsa: getItem("eddsaPrivateKey") } });
    const zenData = JSON.stringify({ gql: Buffer.from(body, "utf8").toString("base64") });
    return await zencode_exec(sign, { data: zenData, keys: zenKeys });
  };
  options.headers = await signRequest(options.body?.toString() || "").then(({ result, logs }) => {
    return {
      ...options.headers,
      "zenflows-sign": JSON.parse(result).eddsa_signature,
      "zenflows-user": getItem("authUsername"),
      "zenflows-hash": JSON.parse(result).hash,
    };
  });
  return fetch(uri, options);
};

const createApolloClient = (withSignedCalls = false) => {
  var opts: FetchHttpOptions = {
    uri: process.env.NEXT_PUBLIC_ZENFLOWS_URL,
  };
  if (withSignedCalls) {
    opts.fetch = useAuthAndFetch;
  }
  const link = new HttpLink(opts);

  return new ApolloClient({
    //link: withSignedCalls ? concat(headersMiddleware, link) : link,
    link: link,
    ssrMode: typeof window === "undefined",
    cache: new InMemoryCache({
      addTypename: false,
    }),
  });
};

export default createApolloClient;
