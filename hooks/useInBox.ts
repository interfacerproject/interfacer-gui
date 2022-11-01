import { useAuth } from "./useAuth";
import dayjs from "dayjs";
import { zencode_exec } from "zenroom";
import sign from "../zenflows-crypto/src/sign_graphql";
import useStorage from "./useStorage";

type UseInBoxReturnValue = {
  sendMessage: (message: any, receivers: string[], subject: string) => Promise<Response>;
  readMessages: () => Promise<{ messages?: any; request_id: number; success: boolean }>;
  countMessages: () => Promise<any>;
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
  const post = async (url: string, request: any) => {
    const requestJSON = JSON.stringify(request);
    const requestHeaders = await signRequest(requestJSON);
    return await fetch(url, {
      method: "POST",
      headers: requestHeaders,
      body: JSON.stringify(request),
    });
  };

  const sendMessage = async (message: any, receivers: string[], subject: string = "Subject"): Promise<Response> => {
    const request = {
      sender: user?.ulid,
      receivers: receivers,
      message: message,
      subject: subject,
      data: dayjs(),
    };
    return await post(process.env.NEXT_PUBLIC_INBOX_SEND!, request);
  };

  const readMessages = async () => {
    const request = {
      request_id: 42,
      receiver: user?.ulid,
    };
    return await post(process.env.NEXT_PUBLIC_INBOX_READ!, request).then(res => res.json());
  };

  const countMessages = async () => {
    const request = {
      receiver: user?.ulid,
    };
    return await post(process.env.NEXT_PUBLIC_INBOX_COUNT_UNREAD!, request).then(res => res.json());
  };

  return { sendMessage, readMessages, countMessages };
};

export default useInBox;
