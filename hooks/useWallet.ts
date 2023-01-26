import devLog from "lib/devLog";
import useSignedPost from "./useSignedPost";

export declare module Wallet {
  export interface RootObject {
    balance: { ideaPoints: number; strenghtsPoints: number };
    request_id: number;
    success: boolean;
  }
  export enum Token {
    Idea = "idea",
    Strengths = "strenghts",
  }
}

type UseWalletReturnValue = {
  getIdeaPoints: (id: string) => Promise<{ amount: number }>;
  getStrengthsPoints: (id: string) => Promise<{ amount: number }>;
  addIdeaPoints: (id: string, amount?: number) => Promise<Response>;
  addStrengthsPoints: (id: string, amount?: number) => Promise<Response>;
};
const useWallet = (): UseWalletReturnValue => {
  const { signedPost } = useSignedPost();

  const getPoints = async (id: string, type: Wallet.Token): Promise<{ amount: number }> => {
    devLog("getPoints", id, type);
    const response = await fetch(`${process.env.NEXT_PUBLIC_WALLET}/${type}/${id}`);
    const data = await response.json();
    return data.data.user.balance;
  };
  const addPoints = async (amount = 1, id: string, token: Wallet.Token): Promise<Response> => {
    const request = {
      token: token,
      amount: amount,
      owner: id,
    };

    return await signedPost(process.env.NEXT_PUBLIC_WALLET!, request);
  };

  return {
    getIdeaPoints: async (id: string) => await getPoints(id, Wallet.Token.Idea),
    getStrengthsPoints: async (id: string) => getPoints(id, Wallet.Token.Strengths),
    addIdeaPoints: async (id: string, amount?: number) => await addPoints(amount, id, Wallet.Token.Idea),
    addStrengthsPoints: async (id: string, amount?: number) => await addPoints(amount, id, Wallet.Token.Strengths),
  };
};

export default useWallet;
