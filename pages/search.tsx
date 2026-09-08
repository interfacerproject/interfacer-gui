// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2022-2023 Dyne.org foundation <foundation@dyne.org>.

import Layout from "components/layout/SearchLayout";
import SearchResults from "components/search/SearchResults";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { ReactElement } from "react";
import { NextPageWithLayout } from "./_app";

export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      publicPage: true,
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
}

const Search: NextPageWithLayout = () => {
  return (
    <div className="min-h-screen bg-ifr-surface">
      <SearchResults />
    </div>
  );
};

Search.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};

Search.publicPage = true;

export default Search;
