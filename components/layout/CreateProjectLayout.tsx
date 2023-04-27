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

import { Link as PLink, Text } from "@bbtgnn/polaris-interfacer";
import FullWidthBanner from "components/FullWidthBanner";
import { useTranslation } from "next-i18next";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

type LayoutProps = {
  children: React.ReactNode;
};

const CreateProjectLayout: React.FunctionComponent<LayoutProps> = (layoutProps: LayoutProps) => {
  const { t } = useTranslation();
  const { children } = layoutProps;
  const router = useRouter();
  const { draft_saved } = router.query;
  const [isOpenBanner, setIsOpenBanner] = useState(!!draft_saved);

  return (
    <div className="h-full">
      <FullWidthBanner open={isOpenBanner} onClose={() => setIsOpenBanner(false)}>
        <Text as="p" variant="bodySm">
          {t("Your project was saved as draft successfully")}
        </Text>
      </FullWidthBanner>
      <div className="p-4">
        <Link href="/create/project">
          <PLink>
            <span className="text-text-primary">
              {"← "}
              {t("Back to Project Creation")}
            </span>
          </PLink>
        </Link>
      </div>
      <div className="mx-auto">{children}</div>
    </div>
  );
};

export default CreateProjectLayout;
