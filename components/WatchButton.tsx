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
import { HideMinor, ViewMinor } from "@shopify/polaris-icons";
import useSocial from "hooks/useSocial";
import useWallet from "hooks/useWallet";
import { IdeaPoints } from "lib/PointsDistribution";
import { useTranslation } from "next-i18next";

const WatchButton = ({ id, owner }: { id: string; owner: string }) => {
  const { followActivity, isWatched, erFollowerLength } = useSocial(id);
  const { t } = useTranslation("common");
  const { addIdeaPoints } = useWallet();
  const watched = isWatched();
  const handleWatch = async () => {
    followActivity();
    //economic system: points assignments
    addIdeaPoints(owner, IdeaPoints.OnWatch);
  };

  return (
    <Button
      id="addToWatch"
      fullWidth
      size="large"
      onClick={handleWatch}
      disabled={watched}
      icon={<Icon source={watched ? HideMinor : ViewMinor} />}
    >
      {t("Watch")!} {"(" + erFollowerLength + ")"}
    </Button>
  );
};

export default WatchButton;
