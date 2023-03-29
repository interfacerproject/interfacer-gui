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
import useSignedPost from "./useSignedPost";

export interface RootObject {
  balance: { ideaPoints: number; strengthsPoints: number };
  request_id: number;
  success: boolean;
}
export enum Token {
  Idea = "idea",
  Strengths = "strengths",
}

type UseWalletReturnValue = {
  getIdeaPoints: number;
  getStrengthsPoints: number;
  ideaTrend: string;
  strengthsTrend: string;
  addIdeaPoints: (id: string, amount?: number) => Promise<Response>;
  addStrengthsPoints: (id: string, amount?: number) => Promise<Response>;
};

export enum TrendPeriod {
  Week = "week",
  Month = "month",
  Cycle = "cycle",
}

type UseWalletProps = {
  id?: string;
  period?: TrendPeriod;
};

const useWallet = (props: UseWalletProps): UseWalletReturnValue => {
  const { id, period = TrendPeriod.Week } = props;
  const [ideaPoints, setIdeaPoints] = useState<number>(0);
  const [strengthsPoints, setStrengthsPoints] = useState<number>(0);
  const [ideaTrend, setIdeaTrend] = useState<string>("0");
  const [strengthsTrend, setStrengthsTrend] = useState<string>("0");

  const { signedPost } = useSignedPost(true);

  const getCycleDay0 = () => {
    const today = dayjs();
    const begins = dayjs(process.env.NEXT_PUBLIC_START_DATE!);
    const daysFromCycleBegin = today.diff(begins, "day") % Number(process.env.NEXT_PUBLIC_CYCLE_LENGTH!);
    return dayjs().subtract(-daysFromCycleBegin, "day").startOf("day").valueOf();
  };

  const firstDayOfPeriod: Record<TrendPeriod, number> = {
    [TrendPeriod.Week]: dayjs().startOf("week").valueOf(),
    [TrendPeriod.Month]: dayjs().startOf("month").valueOf(),
    [TrendPeriod.Cycle]: getCycleDay0(),
  };

  useEffect(() => {
    if (!id) return;
    getPoints(id, Token.Idea).then(amount => setIdeaPoints(amount));
    getPoints(id, Token.Strengths).then(amount => setStrengthsPoints(amount));
    getTrends(id, Token.Idea).then(trend => setIdeaTrend(trend));
    getTrends(id, Token.Strengths).then(trend => setStrengthsTrend(trend));
  }, [id, period]);

  const getPoints = async (id: string, type: Token): Promise<number> => {
    const day0 = firstDayOfPeriod[period];
    const responseDayO = await fetch(`${process.env.NEXT_PUBLIC_WALLET}/${type}/${id}?until=${day0}`);
    const dataDay0 = await responseDayO.json();
    const response = await fetch(`${process.env.NEXT_PUBLIC_WALLET}/${type}/${id}`);
    const data = await response.json();
    return data.success === true ? data.amount - dataDay0.amount : 0;
  };

  const getTrends = async (id: string, type: Token): Promise<string> => {
    const day0 = firstDayOfPeriod[period];
    const response = await fetch(`${process.env.NEXT_PUBLIC_WALLET}/${type}/${id}?until=${day0}`);
    const data = await response.json();
    const today = await fetch(`${process.env.NEXT_PUBLIC_WALLET}/${type}/${id}`);
    const todayData = await today.json();
    const todayPoints = todayData.success === true ? todayData.amount : 0;
    const day0Points = data.success === true ? data.amount : 0;
    if (day0Points === 0) return "N/A";
    const trend = (todayPoints - day0Points) / day0Points;
    return (trend * 100).toFixed(2);
  };

  const addPoints = async (amount = 1, id: string, token: Token): Promise<Response> => {
    const request = {
      token: token,
      amount: amount,
      owner: id,
    };

    return await signedPost(process.env.NEXT_PUBLIC_WALLET!, request);
  };

  return {
    getIdeaPoints: ideaPoints / 100,
    getStrengthsPoints: strengthsPoints / 100,
    addIdeaPoints: async (id: string, amount?: number) => await addPoints(amount, id, Token.Idea),
    addStrengthsPoints: async (id: string, amount?: number) => await addPoints(amount, id, Token.Strengths),
    ideaTrend,
    strengthsTrend,
  };
};

export default useWallet;
