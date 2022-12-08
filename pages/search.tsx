import { useRouter } from "next/router";
import AssetsCards from "../components/AssetsCards";
import ResourcesCards from "../components/ResourcesCards";
import { NextPageWithLayout } from "./_app";
import { ReactElement, useState } from "react";
import Layout from "../components/layout/SearchLayout";
import SearchBar from "../components/SearchBar";
import { Checkbox } from "@bbtgnn/polaris-interfacer";
import { useTranslation } from "next-i18next";

const Search: NextPageWithLayout = () => {
  const { q } = useRouter().query;
  const [checked, setChecked] = useState(false);
  const { t } = useTranslation("common");
  const Assetfilter = {
    notCustodian: [process.env.NEXT_PUBLIC_LOASH_ID!],
    orName: q?.toString(),
    ...(!checked && { orNote: q?.toString() }),
  };
  const Resourcefilter = {
    primaryAccountable: [process.env.NEXT_PUBLIC_LOASH_ID!],
    orName: q?.toString(),
    ...(!checked && { orNote: !checked && q?.toString() }),
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
