import { useRouter } from "next/router";
import ResourceTable from "../components/ResourceTable";
import AssetsCards from "../components/AssetsCards";
import ResourcesCards from "../components/ResourcesCards";

const Search = () => {
  const { q } = useRouter().query;
  const Assetfilter = {
    orPrimaryIntentsResourceInventoriedAsName: q?.toString(),
    orPrimaryIntentsResourceInventoriedAsNote: q?.toString(),
  };
  const Resourcefilter = {
    orName: q?.toString(),
    orNote: q?.toString(),
  };

  return (
    <div>
      <h1>{"Search"}</h1>
      <AssetsCards filter={Assetfilter} />
      {/*<AssetsTable filter={Assetfilter} />*/}
      <ResourcesCards filter={Resourcefilter} />
    </div>
  );
};

export default Search;
