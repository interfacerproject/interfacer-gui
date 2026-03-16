// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2022-2023 Dyne.org foundation <foundation@dyne.org>.

import { Pen } from "@carbon/icons-react";
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

const Designs: NextPageWithLayout = () => {
  const { t } = useTranslation("common");
  const { designId, specsLoading } = useFilters();

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
          "Browse and discover open source hardware designs shared by creators around the world. Find blueprints, schematics, and documentation for your next project."
        ),
        stats: (
          <>
            <HeroStatCard
              icon={
                <StatIcon bgColor="var(--ifr-green)">
                  <Pen size={20} className="text-white" />
                </StatIcon>
              }
              value="—"
              label={t("Open Designs")}
            />
            <HeroStatCard
              icon={
                <StatIcon bgColor="var(--ifr-type-product)">
                  <Pen size={20} className="text-white" />
                </StatIcon>
              }
              value="—"
              label={t("Available as Product")}
            />
            <HeroStatCard
              icon={
                <StatIcon bgColor="var(--ifr-type-service)">
                  <Pen size={20} className="text-white" />
                </StatIcon>
              }
              value="—"
              label={t("Manufacturers")}
            />
          </>
        ),
      }}
      searchPlaceholder={t("Search designs...")}
      filter={filter}
    />
  );
};

Designs.publicPage = true;

export default Designs;
