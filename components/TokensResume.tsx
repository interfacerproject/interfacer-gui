import { ArrowSmDownIcon, ArrowSmUpIcon } from "@heroicons/react/outline";
import cn from "classnames";
import useWallet, { Token } from "hooks/useWallet";
import { useTranslation } from "next-i18next";

const TokensResume = ({ stat, id }: { stat: string; id: string }) => {
  const { t } = useTranslation("ProfileProps");
  const trend = Math.floor(Math.random() * 100) - 50;
  const positive = trend > 0;
  const { getIdeaPoints, getStrengthsPoints } = useWallet(id);
  const value = stat === Token.Idea ? getIdeaPoints : getStrengthsPoints;

  return (
    <div className="stat">
      <div className="stat-figure">
        <span
          className={cn("flex rounded-full space-x-2 py-1 px-2 items-center", {
            "bg-green-100": positive,
            "bg-red-100": !positive,
          })}
        >
          {positive ? (
            <ArrowSmUpIcon className="w-5 h-5 text-green-500" />
          ) : (
            <ArrowSmDownIcon className="w-5 h-5 text-red-500" />
          )}
          <span>{trend}%</span>
        </span>
      </div>
      <div className="stat-title capitalize">{t(`${stat} points`)}</div>
      <div className="text-2xl font-semibold stat-value text-primary font-display">{value}</div>
    </div>
  );
};

export default TokensResume;
