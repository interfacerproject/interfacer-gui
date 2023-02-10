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

import dayjs from "dayjs";
import { useEffect, useState } from "react";
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
};

const useInBox = (): UseInBoxReturnValue => {
  const [countUnread, setCountUnread] = useState(0);
  const [messages, setMessages] = useState<any[]>([]);
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const [startFetch, setStartFetch] = useState(false);
  const [readedMessages, setReadedMessages] = useState<number[]>([]);
  const { user } = useAuth();
  const { signedPost } = useSignedPost();
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
