import { Checkbox } from "@bbtgnn/polaris-interfacer";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { ReactElement, useState } from "react";
import AssetsCards from "../components/AssetsCards";
import Layout from "../components/layout/SearchLayout";
import ResourcesCards from "../components/ResourcesCards";
import SearchBar from "../components/SearchBar";
import { NextPageWithLayout } from "./_app";
import AssetsTable from "../components/AssetsTable";

const Search: NextPageWithLayout = () => {
  const { q } = useRouter().query;
  const [checked, setChecked] = useState(false);
  const { t } = useTranslation("common");
  const Assetfilter = {
    orName: q?.toString(),
    ...(!checked && { orNote: q?.toString() }),
  };
  const Resourcefilter = {
    primaryAccountable: [process.env.NEXT_PUBLIC_LOSH_ID!],
    name: q?.toString(),
    ...(!checked && { note: !checked && q?.toString() }),
  };

  return (
    <div>
      <div className="p-8">
        <div className="mb-6">
          <h1>
            <span className="text-[#5DA091]">{t("Search result for") + ": "}</span>
            {`"${q}"`}
          </h1>
          <div className="flex flex-col gap-2 my-8">
            <SearchBar />
            <Checkbox label={t("do not search inside the the description")} checked={checked} onChange={setChecked} />
          </div>
        </div>
        <AssetsTable filter={Assetfilter} hideHeader />
        {/*<AssetsCards filter={Assetfilter} />*/}
        {/*<ResourcesCards filter={Resourcefilter} />*/}
      </div>
    </div>
  );
};

Search.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};

export default Search;
