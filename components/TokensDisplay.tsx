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

import { ArrowSmUpIcon } from "@heroicons/react/outline";
import cn from "classnames";
import useWallet, { Token, TrendPeriodValue } from "hooks/useWallet";
import { useTranslation } from "next-i18next";

const TokensDisplay = ({ stat, id, period }: { stat: string; id: string; period?: TrendPeriodValue }) => {
  const { t } = useTranslation("ProfileProps");
  const { getIdeaPoints, getStrengthsPoints, ideaTrend, strengthsTrend } = useWallet({ id, period });
  const value = stat === Token.Idea ? getIdeaPoints : getStrengthsPoints;
  const trendValue = stat === Token.Idea ? ideaTrend : strengthsTrend;
  const positive = Number(trendValue) > 0;
  const trendNotANumber = Number.isNaN(Number(trendValue)) || trendValue == "0.00";

  return (
    <div className="stat">
      <div className="stat-figure">
        <span
          className={cn("flex rounded-full space-x-2 py-1 px-2 items-center", {
            "bg-green-100": positive && !trendNotANumber,
            "bg-red-100": !positive && !trendNotANumber,
            "bg-grey-100": trendNotANumber,
          })}
        >
          {!trendNotANumber && (
            <>
              <ArrowSmUpIcon
                className={cn("w-5 h-5", {
                  "text-green-500": positive,
                  "text-red-500 rotate-180": !positive,
                  hidden: trendNotANumber,
                })}
              />
            </>
          )}
          <span>{trendValue}</span>
        </span>
      </div>
      <div className="stat-title capitalize">{t(stat)}</div>
      <div className="text-2xl font-semibold stat-value text-primary font-display">{value}</div>
    </div>
  );
};

export default TokensDisplay;
