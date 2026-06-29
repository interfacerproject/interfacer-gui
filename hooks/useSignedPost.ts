import { useAuth } from "./useAuth";
import { signGraphQLRequest, signDidRequest } from "@interfacer/client";

const useSignedPost = (idInHeader?: boolean) => {
  const { user, client } = useAuth();

  const signRequest = async (json: string) => {
    if (!client) throw new Error("Client not ready");
    const signed = await signGraphQLRequest(json, client.store);
    const headers: Record<string, string> = {
      "zenflows-sign": signed["zenflows-sign"],
      "Content-Type": "application/json",
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

  return { signedPost, signRequest };
};

export default useSignedPost;
