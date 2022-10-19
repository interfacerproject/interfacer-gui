import { zencode_exec } from "zenroom";
import sign from "../zenflows-crypto/src/sign_graphql";
import useStorage from "../hooks/useStorage";

import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";

interface FetchHttpOptions {
  uri?: string;
  fetch?: WindowOrWorkerGlobalScope["fetch"];
}

const useAuthAndFetch = async (uri: RequestInfo, options: RequestInit) => {
  const { getItem } = useStorage();
  const signRequest = async (body: string) => {
    const zenKeys = JSON.stringify({ keyring: { eddsa: getItem("eddsa_key") } });
    const zenData = JSON.stringify({ gql: Buffer.from(body, "utf8").toString("base64") });
    return await zencode_exec(sign(), { data: zenData, keys: zenKeys });
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
