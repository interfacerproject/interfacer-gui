import { zencode_exec } from "zenroom";
import sign from "../zenflows-crypto/src/sign_graphql";
import useStorage from "./useStorage";

const useSignedPost = () => {
  const { getItem } = useStorage();
  const signRequest = async (json: string) => {
    const data = `{"gql": "${Buffer.from(json, "utf8").toString("base64")}"}`;
    const keys = `{"keyring": {"eddsa": "${getItem("eddsa_key")}"}}`;
    const { result } = await zencode_exec(sign(), { data, keys });
    return {
      "zenflows-sign": JSON.parse(result).eddsa_signature,
    };
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
