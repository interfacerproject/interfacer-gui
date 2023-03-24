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
import { useAuth } from "hooks/useAuth";
import useSocial from "hooks/useSocial";
import useWallet from "hooks/useWallet";
import { IdeaPoints } from "lib/PointsDistribution";

//

export default function AddStar({ id, owner, tiny = false }: { id: string; owner: string; tiny?: boolean }) {
  const { likeER, isLiked } = useSocial(id);
  const hasAlreadyStarred = isLiked(id);
  const { user } = useAuth();

  const { addIdeaPoints } = useWallet({});
  const handleClick = async () => {
    await likeER();
    //economic system: points assignments
    addIdeaPoints(owner, IdeaPoints.OnStar);
  };

  if (!user) return null;

  return (
    <>
      {tiny && <StarButtonSmall starred={hasAlreadyStarred} onClick={handleClick} />}
      {!tiny && <StarButtonDefault starred={hasAlreadyStarred} onClick={handleClick} />}
    </>
  );
}

/* Partials */

interface StarredProp {
  starred?: boolean;
}

interface ButtonProps extends StarredProp {
  onClick?: () => void;
}

function StarIcon(props: StarredProp) {
  const { starred = false } = props;
  return <Icon source={starred ? StarFilledMinor : StarOutlineMinor} />;
}

function StarText(props: StarredProp) {
  const { starred = false } = props;
  return starred ? "Starred" : "Star";
}

function StarButtonDefault(props: ButtonProps) {
  const { onClick = () => {}, starred = false } = props;
  return (
    <Button id="likeButton" onClick={onClick} disabled={starred} size="medium" icon={<StarIcon starred={starred} />}>
      {StarText({ starred })}
    </Button>
  );
}

function StarButtonSmall(props: ButtonProps) {
  const { onClick = () => {}, starred = false } = props;

  const classes = classNames("py-2 px-3", "rounded-full border-1", "fill-primary", {
    "border-primary hover:cursor-not-allowed bg-primary/5": starred,
    "border-gray-200 hover:border-transparent hover:ring-2 hover:ring-primary": !starred,
  });

  return (
    <button disabled={starred} onClick={onClick} className={classes} aria-label={StarText({ starred })}>
      <span className=""></span>
      <StarIcon starred={starred} />
    </button>
  );
}
