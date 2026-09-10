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

import CatalogLayout, { HeroStatCard } from "components/CatalogLayout";
import { EconomicResource } from "lib/types";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useCallback, useState } from "react";
import { NextPageWithLayout } from "./_app";

const LOSH_ID = process.env.NEXT_PUBLIC_LOSH_ID as string;

const Resources: NextPageWithLayout = () => {
  const { t } = useTranslation("common");
  const [totalCount, setTotalCount] = useState<number | null>(null);

  const handleDataLoaded = useCallback(({ totalCount }: { totalCount: number }) => {
    setTotalCount(totalCount);
  }, []);

  // Everything mirrored from LOSH is held by a single account, so the catalog is
  // keyed on that account rather than on a project type.
  const filter = {
    primaryAccountable: [LOSH_ID],
    gtOnhandQuantityHasNumericalValue: 0,
  };

  return (
    <CatalogLayout
      hero={{
        eyebrow: t("Library of Open Source Hardware"),
        title: t("LOSH library"),
        description: t(
          "Hardware documented elsewhere and mirrored here for reference. Read the files, licences and build notes behind each project."
        ),
        stats: <HeroStatCard value={totalCount ?? "—"} label={t("Mirrored Projects")} />,
      }}
      searchPlaceholder={t("Search the LOSH library...")}
      filter={filter}
      filterReady={!!LOSH_ID}
      showFilters={false}
      cardHref={(project: EconomicResource) => `/resource/${project.id}`}
      emptyHeading={t("Nothing in the LOSH library matches that search")}
      onDataLoaded={handleDataLoaded}
    />
  );
};

export async function getStaticProps({ locale }: any) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "signInProps", "SideBarProps"])),
    },
  };
}

Resources.publicPage = true;

export default Resources;
