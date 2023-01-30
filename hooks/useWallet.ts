import { useEffect, useState } from "react";
import useSignedPost from "./useSignedPost";

export interface RootObject {
  balance: { ideaPoints: number; strenghtsPoints: number };
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
  addIdeaPoints: (id: string, amount?: number) => Promise<Response>;
  addStrengthsPoints: (id: string, amount?: number) => Promise<Response>;
};
const useWallet = (id?: string): UseWalletReturnValue => {
  const [ideaPoints, setIdeaPoints] = useState(0);
  const [strengthsPoints, setStrengthsPoints] = useState(0);
  const { signedPost } = useSignedPost();

  useEffect(() => {
    if (!id) return;
    getPoints(id, Token.Idea).then(amount => setIdeaPoints(amount));
    getPoints(id, Token.Strengths).then(amount => setStrengthsPoints(amount));
  }, [id]);

  const getPoints = async (id: string, type: Token): Promise<number> => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_WALLET}/${type}/${id}`);
    const data = await response.json();
    return data.success === true ? data.amount : 0;
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
    getIdeaPoints: ideaPoints,
    getStrengthsPoints: strengthsPoints,
    addIdeaPoints: async (id: string, amount?: number) => await addPoints(amount, id, Token.Idea),
    addStrengthsPoints: async (id: string, amount?: number) => await addPoints(amount, id, Token.Strengths),
  };
};

export default useWallet;
