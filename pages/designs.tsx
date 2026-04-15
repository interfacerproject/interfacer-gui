// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2022-2023 Dyne.org foundation <foundation@dyne.org>.

import CatalogLayout, { HeroStatCard } from "components/CatalogLayout";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useCallback, useState } from "react";
import useFilters from "../hooks/useFilters";
import { NextPageWithLayout } from "./_app";

export async function getStaticProps({ locale }: any) {
  return {
    props: {
      publicPage: true,
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
}

const Designs: NextPageWithLayout = () => {
  const { t } = useTranslation("common");
  const { designId, specsLoading } = useFilters();
  const [totalCount, setTotalCount] = useState<number | null>(null);

  const handleDataLoaded = useCallback(({ totalCount }: { totalCount: number; loading: boolean }) => {
    setTotalCount(totalCount);
  }, []);

  const filter = {
    conformsTo: designId ? [designId] : undefined,
    notCustodian: [process.env.NEXT_PUBLIC_LOSH_ID!],
  };

  return (
    <CatalogLayout
      variant="designs"
      hero={{
        title: t("Open Source Hardware Designs"),
        description: t(
          "Free, community-driven hardware projects you can build, learn from, and improve. Every design is fully documented and open — created by makers around the world."
        ),
        stats: (
          <>
            <HeroStatCard value={totalCount ?? "—"} label={t("Open Designs")} />
            <HeroStatCard value="—" label={t("Available as Product")} />
            <HeroStatCard value="—" label={t("Manufacturers")} />
          </>
        ),
      }}
      searchPlaceholder={t("Search designs, makers, machines, materials...")}
      filter={filter}
      onDataLoaded={handleDataLoaded}
    />
  );
};

Designs.publicPage = true;

export default Designs;
