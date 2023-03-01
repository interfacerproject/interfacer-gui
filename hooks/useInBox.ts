import dayjs from "dayjs";
import useSWR from "swr";
import { useAuth } from "./useAuth";
import useSignedPost from "./useSignedPost";

export declare module Notification {
  export interface Content {
    data: Date;
    message: any;
    subject: string;
  }

  export interface Message {
    id: number;
    sender: string;
    content: Content;
    read: boolean;
  }

  export interface RootObject {
    messages: Message[];
    request_id: number;
    success: boolean;
  }
}

type UseInBoxReturnValue = {
  sendMessage: (message: any, receivers: string[], subject: string) => Promise<Response>;
  readMessages: () => Promise<Notification.RootObject>;
  countMessages: () => Promise<{ count: number; success: boolean }>;
  setMessage: (id: number, read?: boolean) => Promise<Response>;
  countUnread: number;
  hasNewMessages: boolean;
  messages: { id: number; sender: string; content: { data: string; message: any; subject: string } }[];
  startReading: () => void;
  setReadedMessages: (ids: number[]) => void;
  readedMessages: number[];
};

const useInBox = () => {
  const { user } = useAuth();
  const { signRequest, signedPost } = useSignedPost();
  const fetcher = async (url: string, request: any) => {
    const requestJSON = JSON.stringify(request);
    const requestHeaders = await signRequest(requestJSON);
    return await fetch(url, {
      method: "POST",
      headers: requestHeaders,
      body: JSON.stringify(request),
    }).then(res => res.json());
  };

  const { data, error, isLoading } = useSWR(
    [
      process.env.NEXT_PUBLIC_INBOX_READ!,
      {
        request_id: 50,
        receiver: user?.ulid,
        only_unread: false,
      },
    ],
    ([url, request]) => fetcher(url, request)
  );

  const {
    data: unreadData,
    error: errorUnread,
    isLoading: isLoadingUnread,
  } = useSWR(
    [
      process.env.NEXT_PUBLIC_INBOX_COUNT_UNREAD!,
      {
        receiver: user?.ulid,
      },
    ],
    ([url, request]) => fetcher(url, request),
    { refreshInterval: 1000 }
  );

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

  const setReadedMessage = async (id: number, read = true) => {
    const request = {
      message_id: id,
      receiver: user?.ulid,
      read: read,
    };
    return await signedPost(process.env.NEXT_PUBLIC_INBOX_SET_READ!, request).then(res => res.json());
  };

  const setReadedMessages = async (ids: number[]) => {
    for (const id of ids) {
      await setReadedMessage(id);
    }
  };

  const messages = data?.messages;
  const unread = unreadData?.count;

  return { messages, error, isLoading, sendMessage, unread, setReadedMessage, setReadedMessages };
};

export default useInBox;
