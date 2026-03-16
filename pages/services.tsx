// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2022-2023 Dyne.org foundation <foundation@dyne.org>.

import { Assembly } from "@carbon/icons-react";
import { LocationMarkerIcon } from "@heroicons/react/outline";
import CatalogLayout, { HeroStatCard, StatIcon } from "components/CatalogLayout";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import React from "react";
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
          "Find local workshops, fabrication labs, and manufacturing services near you. Connect with providers who can bring open source designs to life."
        ),
        stats: (
          <>
            <HeroStatCard
              icon={
                <StatIcon bgColor="var(--ifr-type-service)">
                  <Assembly size={20} className="text-white" />
                </StatIcon>
              }
              value="—"
              label={t("Active Services")}
            />
            <HeroStatCard
              icon={
                <StatIcon bgColor="var(--ifr-green)">
                  <LocationMarkerIcon className="w-5 h-5 text-white" />
                </StatIcon>
              }
              value="—"
              label={t("Locations")}
            />
            <HeroStatCard
              icon={
                <StatIcon bgColor="var(--ifr-type-product)">
                  <Assembly size={20} className="text-white" />
                </StatIcon>
              }
              value="—"
              label={t("Machines Available")}
            />
          </>
        ),
      }}
      searchPlaceholder={t("Search services...")}
      filter={filter}
    />
  );
};

Services.publicPage = true;

export default Services;
