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

import { useAuth } from "./useAuth";

export enum Token {
  Idea = "idea",
  Strengths = "strengths",
}

export const TrendPeriod = { Week: "week", Month: "month", Cycle: "cycle" } as const;
export type TrendPeriodType = keyof typeof TrendPeriod;
export type TrendPeriodValue = (typeof TrendPeriod)[TrendPeriodType];

type UseWalletReturnValue = {
  getIdeaPoints: number;
  getStrengthsPoints: number;
  ideaTrend: string;
  strengthsTrend: string;
  addIdeaPoints: (id: string, amount?: number) => Promise<void>;
  addStrengthsPoints: (id: string, amount?: number) => Promise<void>;
};

const useWallet = (_props: any = {}): UseWalletReturnValue => {
  const { client } = useAuth();

  const addPoints = async (id: string, token: Token, amount = 1) => {
    if (!client) return;
    await client.wallet.addPoints(id, token, amount);
  };

  return {
    getIdeaPoints: 0,
    getStrengthsPoints: 0,
    ideaTrend: "0",
    strengthsTrend: "0",
    addIdeaPoints: async (id: string, amount?: number) => addPoints(id, Token.Idea, amount),
    addStrengthsPoints: async (id: string, amount?: number) => addPoints(id, Token.Strengths, amount),
  };
};

export default useWallet;
