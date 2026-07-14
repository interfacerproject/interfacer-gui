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
import useSWR from "swr";
import { useAuth } from "./useAuth";

// Keep Notification type for backward compatibility
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
  sendMessage: (message: any, receivers: string[], subject: string) => Promise<void>;
  messages: any[];
  unread: number;
  isLoading: boolean;
  error: any;
  setReadedMessage: (id: number, read?: boolean) => Promise<any>;
  mutateMessages: () => void;
};

const useInBox = (): UseInBoxReturnValue => {
  const { user, client } = useAuth();

  const {
    data: messages,
    error,
    isLoading,
    mutate: mutateMessages,
  } = useSWR(client && user?.ulid ? ["inbox-messages", user.ulid] : null, async () => {
    if (!client) return [];
    const msgs = await client.inbox.getMessages();
    // Already sorted by date descending in the SDK, but sort again for safety
    return msgs.sort((a, b) => {
      return dayjs(b.content.data).unix() - dayjs(a.content.data).unix();
    });
  });

  const { data: unread } = useSWR(
    client && user?.ulid ? ["inbox-unread-count", user.ulid] : null,
    async () => {
      if (!client) return 0;
      return client.inbox.getUnreadCount();
    },
    {
      refreshInterval: Number(process.env.NEXT_PUBLIC_INBOX_COUNT_INTERVAL) || 0,
    }
  );

  const sendMessage = async (message: any, receivers: string[], subject: string = "Subject") => {
    if (!client) return;
    await client.inbox.sendMessage(message, receivers, subject);
  };

  const setReadedMessage = async (id: number) => {
    if (!client) return;
    await client.inbox.markRead(id);
  };

  return {
    sendMessage,
    messages: messages || [],
    unread: unread || 0,
    isLoading,
    error,
    setReadedMessage,
    mutateMessages,
  };
};

export default useInBox;

// Re-export from context for components that need the shared instance
export { useInBoxContext } from "../contexts/InBoxContext";
