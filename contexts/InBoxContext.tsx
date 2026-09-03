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

import { createContext, useContext, ReactNode } from "react";
import useInBox from "../hooks/useInBox";

type InBoxContextValue = ReturnType<typeof useInBox> & {
  /** Invalidate the messages SWR cache (call after markRead/sendMessage) */
  mutateMessages: () => void;
};

const InBoxContext = createContext<InBoxContextValue | null>(null);

export function InBoxProvider({ children }: { children: ReactNode }) {
  const inbox = useInBox();
  const value: InBoxContextValue = {
    ...inbox,
    mutateMessages: () => inbox.mutateMessages(),
  };
  return <InBoxContext.Provider value={value}>{children}</InBoxContext.Provider>;
}

export function useInBoxContext() {
  const ctx = useContext(InBoxContext);
  if (!ctx) throw new Error("useInBoxContext must be used within InBoxProvider");
  return ctx;
}
