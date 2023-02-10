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
import { Button } from "@bbtgnn/polaris-interfacer";

export interface ChooseModeProps {
  viaPassphrase?: () => void;
  viaQuestions?: () => void;
}

export default function ChooseMode(props: ChooseModeProps) {
  const { viaPassphrase = () => {}, viaQuestions = () => {} } = props;
  const { t } = useTranslation("signInProps");

  return (
    <div>
      {/* Intro */}
      <h2>{t("Login")}</h2>
      <p className="mt-2 mb-6">
        {t("Login by providing your generated passphrase or by answering the questions during your Signup proccess")}
      </p>

      {/* Login via passphrase */}
      <Button size="large" primary fullWidth id="viaPassphrase" onClick={viaPassphrase}>
        {t("Login via passphrase 🔑")}
      </Button>

      {/* Login via questions */}
      <div className="mt-4">
        <Button size="large" primary fullWidth id="viaQuestions" onClick={viaQuestions}>
          {t("Login answering the signup questions 💬")}
        </Button>
      </div>
    </div>
  );
}
