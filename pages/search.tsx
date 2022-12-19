import { Checkbox, Select } from "@bbtgnn/polaris-interfacer";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { ReactElement, useState } from "react";
import Layout from "../components/layout/SearchLayout";
import SearchBar from "../components/SearchBar";
import { NextPageWithLayout } from "./_app";
import AssetsTable from "../components/AssetsTable";
import useFilters from "../hooks/useFilters";
import AgentsTable from "../components/AgentsTable";
import devLog from "../lib/devLog";

const Search: NextPageWithLayout = () => {
  const { q } = useRouter().query;
  const [checked, setChecked] = useState(false);
  const [searchType, setSearchType] = useState("assets");
  const { proposalFilter } = useFilters();
  const { t } = useTranslation("common");

  //This is an hugly hack to make the search work until we fix the boolean logic at backend
  const isNotEmptyObj = (obj: any) => Boolean(Object.keys(obj).find(key => obj[key]?.length > 0));
  delete proposalFilter.notCustodian;
  const assetsOrFilter = {
    orName: q?.toString(),
    ...(!checked && { orNote: q?.toString() }),
  };
  const assetsFilter = {
    name: q?.toString(),
    ...(!checked && { orNote: q?.toString() }),
  };
  const filters = isNotEmptyObj(proposalFilter) ? { ...proposalFilter, ...assetsFilter } : assetsOrFilter;

  //

  const searchTypes = ["assets", "people"];
  const onChangeSearch = (value: string) => {
    setSearchType(value);
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
        {searchType === "assets" && (
          <AssetsTable
            filter={filters}
            hideHeader
            searchFilter={
              <Select
                options={searchTypes}
                value={searchType}
                onChange={onChangeSearch}
                label={t("Select search type")}
                placeholder={t("Select search type")}
              />
            }
          />
        )}
        {searchType === "people" && (
          <AgentsTable
            hideHeader
            searchTerm={q?.toString() || ""}
            searchFilter={
              <Select
                options={searchTypes}
                value={searchType}
                onChange={onChangeSearch}
                label={t("Select search type")}
                placeholder={t("Select search type")}
              />
            }
          />
        )}
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
