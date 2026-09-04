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

import { useTranslation } from "next-i18next";

import { AuthBackLink, AuthButton, AuthCard, AuthCardHeader } from "components/partials/auth/AuthCard";

export interface ChooseModeProps {
  viaPassphrase?: () => void;
  viaQuestions?: () => void;
  onBack?: () => void;
}

/** Sign in · step 2 — choose sign in method (Figma 1092:14648). */
export default function ChooseMode(props: ChooseModeProps) {
  const { viaPassphrase = () => {}, viaQuestions = () => {}, onBack } = props;
  const { t } = useTranslation("signInProps");

  return (
    <AuthCard>
      <AuthCardHeader
        back={<AuthBackLink label={t("Back to sign in")} onClick={onBack} />}
        title={t("Choose how to sign in")}
        description={t("You can use the passphrase generated for your account or answer your recovery questions.")}
      />

      {/* The prototype pairs the two methods at a 12px gap, green over outlined. */}
      <div className="flex flex-col gap-3">
        <AuthButton id="viaPassphrase" onClick={viaPassphrase}>
          {t("Use your passphrase")}
        </AuthButton>

        <AuthButton variant="secondary" id="viaQuestions" onClick={viaQuestions}>
          {t("Use recovery questions")}
        </AuthButton>
      </div>
    </AuthCard>
  );
}
