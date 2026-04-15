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

const Services: NextPageWithLayout = () => {
  const { t } = useTranslation("common");
  const { serviceId, specsLoading } = useFilters();
  const [totalCount, setTotalCount] = useState<number | null>(null);

  const handleDataLoaded = useCallback(({ totalCount }: { totalCount: number; loading: boolean }) => {
    setTotalCount(totalCount);
  }, []);

  const filter = {
    conformsTo: serviceId ? [serviceId] : undefined,
    notCustodian: [process.env.NEXT_PUBLIC_LOSH_ID!],
  };

  return (
    <CatalogLayout
      variant="services"
      hero={{
        title: t("Workshops, Labs & Services"),
        description: t(
          "Makerspaces and FabLabs near you that open their doors — use professional equipment, learn new skills, and get expert advice from your local maker community."
        ),
        stats: (
          <>
            <HeroStatCard value={totalCount ?? "—"} label={t("Total Services")} />
            <HeroStatCard value="—" label={t("Service Providers")} />
            <HeroStatCard value="—" label={t("Machines Available")} />
          </>
        ),
      }}
      searchPlaceholder={t("Search services, providers, locations...")}
      filter={filter}
      onDataLoaded={handleDataLoaded}
    />
  );
};

Services.publicPage = true;

export default Services;
