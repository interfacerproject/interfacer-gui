import { useAuth } from "./useAuth";
import dayjs from "dayjs";
import { zencode_exec } from "zenroom";
import sign from "../zenflows-crypto/src/sign_graphql";
import useStorage from "./useStorage";

type UseInBoxReturnValue = {
  sendMessage: (message: any, receivers: string[], subject: string) => Promise<Response>;
  readMessages: () => Promise<Response>;
};

const useInBox = (): UseInBoxReturnValue => {
  const { user } = useAuth();
  const { getItem } = useStorage();
  const signRequest = async (json: string) => {
    const data = `{"gql": "${Buffer.from(json, "utf8").toString("base64")}"}`;
    const keys = `{"keyring": {"eddsa": "${getItem("eddsa_key")}"}}`;
    const { result } = await zencode_exec(sign(), { data, keys });
    return {
      "zenflows-sign": JSON.parse(result).eddsa_signature,
    };
  };

  const sendMessage = async (message: any, receivers: string[], subject: string = "Subject"): Promise<Response> => {
    const request = {
      sender: user?.ulid,
      receivers: receivers,
      message: message,
      subject: subject,
      data: dayjs(),
    };
    const requestJSON = JSON.stringify(request);
    const requestHeaders = await signRequest(requestJSON);

    const options = {
      method: "POST",
      body: JSON.stringify(request),
      headers: requestHeaders,
    };
    return await fetch(process.env.NEXT_PUBLIC_INBOX_SEND!, options);
  };

  const readMessages = async () => {
    const request = {
      request_id: 42,
      receiver: user?.ulid,
    };
    const requestJSON = JSON.stringify(request);
    const requestHeaders = await signRequest(requestJSON);
    const options = {
      method: "POST",
      body: JSON.stringify(request),
      headers: requestHeaders,
    };
    return await fetch(process.env.NEXT_PUBLIC_INBOX_READ!, options);
  };

  return { sendMessage, readMessages };
};

export default useInBox;
