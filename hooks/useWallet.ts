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
  ideaTrend: number;
  strengthsTrend: number;
  addIdeaPoints: (id: string, amount?: number) => Promise<Response>;
  addStrengthsPoints: (id: string, amount?: number) => Promise<Response>;
};
const useWallet = (id?: string): UseWalletReturnValue => {
  const [ideaPoints, setIdeaPoints] = useState<number>(0);
  const [strengthsPoints, setStrengthsPoints] = useState<number>(0);
  const [ideaTrend, setIdeaTrend] = useState<number>(0);
  const [strengthsTrend, setStrengthsTrend] = useState<number>(0);

  const { signedPost } = useSignedPost(true);

  useEffect(() => {
    if (!id) return;
    getPoints(id, Token.Idea).then(amount => setIdeaPoints(amount));
    getPoints(id, Token.Strengths).then(amount => setStrengthsPoints(amount));
    getTrends(id, Token.Idea).then(trend => setIdeaTrend(trend));
    getTrends(id, Token.Strengths).then(trend => setStrengthsTrend(trend));
  }, [id]);

  const getPoints = async (id: string, type: Token): Promise<number> => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_WALLET}/${type}/${id}`);
    const data = await response.json();
    return data.success === true ? data.amount : 0;
  };

  const getTrends = async (id: string, type: Token): Promise<number> => {
    const yesterday = dayjs().subtract(1, "day").valueOf();
    const response = await fetch(`${process.env.NEXT_PUBLIC_WALLET}/${type}/${id}?until=${yesterday}`);
    const data = await response.json();
    const today = await fetch(`${process.env.NEXT_PUBLIC_WALLET}/${type}/${id}`);
    const todayData = await today.json();
    const todayPoints = todayData.success === true ? todayData.amount : 0;
    const yesterdayPoints = data.success === true ? data.amount : 0;
    const trend = (todayPoints - yesterdayPoints) / yesterdayPoints;
    return Number((trend * 100).toFixed(2));
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
