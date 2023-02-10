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
import { ReactNode } from "react";

//

export default function AnswerQuestions(props: { children?: ReactNode }) {
  const { t } = useTranslation("signUpProps");

  return (
    <div>
      <h2>{t("Sign up")}</h2>
      <p>{t("Answer to these questions to complete your signup 🧩")}</p>
      <p className="mt-4 font-semibold text-primary">
        {t("You will have to remember the answers and keep them for later as they are necessary for the log in&#46;")}
      </p>
      {props.children}
    </div>
  );
}
