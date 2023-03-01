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

import { Button, Icon } from "@bbtgnn/polaris-interfacer";
import { StarFilledMinor, StarOutlineMinor } from "@shopify/polaris-icons";
import classNames from "classnames";
import useSocial from "hooks/useSocial";
import useWallet from "hooks/useWallet";
import { IdeaPoints } from "lib/PointsDistribution";
import { useTranslation } from "next-i18next";

//

const AddStar = ({ id, owner, tiny = false }: { id: string; owner: string; tiny?: boolean }) => {
  const { likeER, isLiked } = useSocial(id);
  const hasAlreadyStarred = isLiked(id);
  const { t } = useTranslation("common");
  const { addIdeaPoints } = useWallet();
  const handleClick = async () => {
    await likeER();
    //economic system: points assignments
    addIdeaPoints(owner, IdeaPoints.OnStar);
  };

  return (
    <>
      {tiny && (
        <div
          className={classNames("text-primary hover:cursor-pointer", { "hover:cursor-not-allowed": hasAlreadyStarred })}
          onClick={handleClick}
        >
          <Icon source={hasAlreadyStarred ? StarFilledMinor : StarOutlineMinor} color="primary" />
        </div>
      )}
      {!tiny && (
        <Button
          id="likeButton"
          onClick={handleClick}
          disabled={hasAlreadyStarred}
          size="medium"
          icon={<Icon source={hasAlreadyStarred ? StarFilledMinor : StarOutlineMinor} />}
        >
          {t("Star")}
        </Button>
      )}
    </>
  );
};

export default AddStar;
