import { useAuth } from "./useAuth";
import dayjs from "dayjs";
import { zencode_exec } from "zenroom";
import sign from "../zenflows-crypto/src/sign_graphql";
import useStorage from "./useStorage";
import { useEffect, useState } from "react";

type UseInBoxReturnValue = {
  sendMessage: (message: any, receivers: string[], subject: string) => Promise<Response>;
  readMessages: () => Promise<{ messages?: any; request_id: number; success: boolean }>;
  countMessages: () => Promise<{ count: number; success: boolean }>;
  countUnread: number;
  hasNewMessages: boolean;
};

const useInBox = (): UseInBoxReturnValue => {
  const [countUnread, setCountUnread] = useState(0);
  const [messages, setMessages] = useState<any>(undefined);
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const { user } = useAuth();
  const { getItem } = useStorage();
  useEffect(() => {
    setInterval(() => {
      const previousCounted = countUnread;
      count().then(counted => {
        if (counted && previousCounted < counted) {
          setHasNewMessages(true);
          setCountUnread(counted);
          setInterval(() => {
            setHasNewMessages(false);
          }, 100000);
        }
      });
    }, 120000);
  }, []);
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

  const sendMessage = async (message: any, receivers: string[], subject: string = "Subject"): Promise<Response> => {
    const request = {
      sender: user?.ulid,
      receivers: receivers,
      content: {
        message: message,
        subject: subject,
        data: dayjs(),
      },
    };
    return await signedPost(process.env.NEXT_PUBLIC_INBOX_SEND!, request);
  };

  const readMessages = async () => {
    const request = {
      request_id: 42,
      receiver: user?.ulid,
    };
    return await signedPost(process.env.NEXT_PUBLIC_INBOX_READ!, request).then(res => res.json());
  };

  const countMessages = async () => {
    const request = {
      receiver: user?.ulid,
    };
    return await signedPost(process.env.NEXT_PUBLIC_INBOX_COUNT_UNREAD!, request).then(res => res.json());
  };
  const count = async () => {
    const _count = await countMessages();
    if (_count.success) {
      return _count.count;
    }
  };

  return { sendMessage, readMessages, countMessages, countUnread, hasNewMessages };
};

export default useInBox;
