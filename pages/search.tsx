import { Checkbox } from "@bbtgnn/polaris-interfacer";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { ReactElement, useState } from "react";
import AssetsCards from "../components/AssetsCards";
import Layout from "../components/layout/SearchLayout";
import ResourcesCards from "../components/ResourcesCards";
import SearchBar from "../components/SearchBar";
import { NextPageWithLayout } from "./_app";

const Search: NextPageWithLayout = () => {
  const { q } = useRouter().query;
  const [checked, setChecked] = useState(false);
  const { t } = useTranslation("common");
  const Assetfilter = {
    notCustodian: [process.env.NEXT_PUBLIC_LOASH_ID!],
    name: q?.toString(),
    ...(!checked && { note: q?.toString() }),
  };
  const Resourcefilter = {
    primaryAccountable: [process.env.NEXT_PUBLIC_LOASH_ID!],
    name: q?.toString(),
    ...(!checked && { note: !checked && q?.toString() }),
  };

  return (
    <div>
      <div className="p-8">
        <div className="mb-6 w-96">
          <h1>{"Search"}</h1>
          <p className="my-2">{"Search results for " + q}</p>
          <SearchBar />
          <Checkbox label={t("do not search inside the the description")} checked={checked} onChange={setChecked} />
        </div>
        <AssetsCards filter={Assetfilter} />
        {/*<AssetsTable filter={Assetfilter} />*/}
        <ResourcesCards filter={Resourcefilter} />
      </div>
    </div>
  );
};

Search.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};

export default Search;
