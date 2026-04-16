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
      ...(await serverSideTranslations(locale, ["common", "productsProps"])),
    },
  };
}

const Products: NextPageWithLayout = () => {
  const { t } = useTranslation("common");
  const { productId, specsLoading } = useFilters();
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [manufacturerCount, setManufacturerCount] = useState<number | null>(null);

  const handleDataLoaded = useCallback(
    ({
      totalCount,
      distinctPrimaryAccountableCount,
    }: {
      totalCount: number;
      distinctPrimaryAccountableCount: number;
      loading: boolean;
    }) => {
      setTotalCount(totalCount);
      setManufacturerCount(distinctPrimaryAccountableCount);
    },
    []
  );

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
            <HeroStatCard value={totalCount ?? "—"} label={t("Total Products")} />
            <HeroStatCard value={manufacturerCount ?? "—"} label={t("Manufacturers")} />
          </>
        ),
      }}
      searchPlaceholder={t("Search products, manufacturers, materials...")}
      filter={filter}
      onDataLoaded={handleDataLoaded}
    />
  );
};

Products.publicPage = true;

export default Products;
