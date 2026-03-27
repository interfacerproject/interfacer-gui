// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2022-2023 Dyne.org foundation <foundation@dyne.org>.

import { Cube } from "@carbon/icons-react";
import CatalogLayout, { HeroStatCard, StatIcon } from "components/CatalogLayout";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import useFilters from "../hooks/useFilters";
import { NextPageWithLayout } from "./_app";

export async function getStaticProps({ locale }: any) {
  return {
    props: {
      publicPage: true,
      ...(await serverSideTranslations(locale, ["common", "productsProps"])),
    },
  };
}

const Products: NextPageWithLayout = () => {
  const { t } = useTranslation("common");
  const { productId, specsLoading } = useFilters();

  const filter = {
    conformsTo: productId ? [productId] : undefined,
    notCustodian: [process.env.NEXT_PUBLIC_LOSH_ID!],
  };

  return (
    <CatalogLayout
      variant="products"
      hero={{
        title: t("Open Hardware Products"),
        description: t(
          "Ready-made products built on open source designs by local FabLabs and manufacturers. Transparent, traceable, and community-rooted."
        ),
        stats: (
          <>
            <HeroStatCard
              icon={
                <StatIcon bgColor="var(--ifr-type-product)">
                  <Cube size={20} className="text-white" />
                </StatIcon>
              }
              value="—"
              label={t("Total Products")}
            />
            <HeroStatCard
              icon={
                <StatIcon bgColor="var(--ifr-green)">
                  <Cube size={20} className="text-white" />
                </StatIcon>
              }
              value="—"
              label={t("Available Now")}
            />
            <HeroStatCard
              icon={
                <StatIcon bgColor="var(--ifr-type-service)">
                  <Cube size={20} className="text-white" />
                </StatIcon>
              }
              value="—"
              label={t("Manufacturers")}
            />
          </>
        ),
      }}
      searchPlaceholder={t("Search products, manufacturers, materials...")}
      filter={filter}
    />
  );
};

Products.publicPage = true;

export default Products;
