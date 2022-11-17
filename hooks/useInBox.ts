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
  setMessage: (id: number, read?: boolean) => Promise<Response>;
  countUnread: number;
  hasNewMessages: boolean;
  messages: { id: number; sender: string; content: { data: string; message: any; subject: string } }[];
  startReading: () => void;
  setReadedMessages: (ids: number[]) => void;
};

const useInBox = (): UseInBoxReturnValue => {
  const [countUnread, setCountUnread] = useState(0);
  const [messages, setMessages] = useState<any[]>([]);
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const [startFetch, setStartFetch] = useState(false);
  const [readedMessages, setReadedMessages] = useState<number[]>([]);
  const { user } = useAuth();
  const { getItem } = useStorage();
  useEffect(() => {
    readedMessages.forEach(id => {
      setMessage(id, true);
    });
    if (startFetch) {
      fetchMessages().then(setMessages);
      setInterval(() => {
        fetchMessages().then(setMessages);
      }, 120000);
    }
    count().then(counted => {
      setCountUnread(counted);
    });
    setInterval(() => {
      const previousCounted = countUnread;
      count().then(counted => {
        setCountUnread(counted);
        if (counted && previousCounted < counted) {
          setHasNewMessages(true);
          setCountUnread(counted);
          setInterval(() => {
            setHasNewMessages(false);
          }, 30000);
        }
      });
    }, 120000);
  }, [startFetch, readedMessages]);

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
  const setMessage = async (id: number, read = true) => {
    const request = {
      message_id: id,
      receiver: user?.ulid,
      read: read,
    };
    return await signedPost(process.env.NEXT_PUBLIC_INBOX_SET_READ!, request).then(res => res.json());
  };

  const fetchMessages = async () => {
    const _messages = await readMessages().then(res => res.messages);
    return _messages;
  };

  return {
    sendMessage,
    readMessages,
    countMessages,
    countUnread,
    hasNewMessages,
    setMessage,
    messages,
    startReading: () => setStartFetch(true),
    setReadedMessages,
  };
};

export default useInBox;
