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

import { ChildrenComponent as CC } from "components/brickroom/types";
import useStorage from "hooks/useStorage";
import { useTranslation } from "next-i18next";
import { AuthActions, AuthCard, AuthCardHeader } from "./AuthCard";
import SeedBox from "./SeedBox";

export interface PassphraseProps {}

/**
 * The passphrase reveal, shared by the last step of both flows. Not drawn in
 * the prototype; it reuses the card of the sign-in steps (Figma 1092:14277).
 */
export default function Passphrase(props: CC<PassphraseProps>) {
  const { getItem } = useStorage();
  const { t } = useTranslation("common");

  return (
    <AuthCard>
      <AuthCardHeader
        title={t("Your passphrase")}
        description={t("Keep your passphrase safe: it is the only way to recover your account.")}
      />

      <SeedBox>{getItem("seed")}</SeedBox>

      {/* Space for buttons */}
      <AuthActions>{props.children}</AuthActions>
    </AuthCard>
  );
}
