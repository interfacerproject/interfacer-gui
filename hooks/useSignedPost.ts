import { zencode_exec } from "zenroom";
import sign from "../zenflows-crypto/src/sign_graphql";
import { useAuth } from "./useAuth";
import useStorage from "./useStorage";

const useSignedPost = (idInHeader?: boolean) => {
  const { getItem } = useStorage();
  const { user } = useAuth();
  const signRequest = async (json: string) => {
    const data = `{"gql": "${Buffer.from(json, "utf8").toString("base64")}"}`;
    const keys = `{"keyring": {"eddsa": "${getItem("eddsa_key")}"}}`;
    const { result } = await zencode_exec(sign(), { data, keys });
    const headers: { "zenflows-sign": string; "zenflows-id"?: string } = {
      "zenflows-sign": JSON.parse(result).eddsa_signature,
    };
    if (idInHeader) {
      headers["zenflows-id"] = String(user?.ulid);
    }
    return headers;
  };
  const signedPost = async (url: string, request: any) => {
    const requestJSON = JSON.stringify(request);
    const requestHeaders = await signRequest(requestJSON);
    return await fetch(url, {
      method: "POST",
      headers: requestHeaders,
      body: JSON.stringify(request),
    });
  };
  return { signedPost };
};

export default useSignedPost;
