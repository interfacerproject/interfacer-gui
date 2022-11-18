import { useRouter } from "next/router";
import AssetsTable from "../components/AssetsTable";
import ResourceTable from "../components/ResourceTable";

const Search = () => {
  const { q } = useRouter().query;
  const Assetfilter = {
    orPrimaryIntentsResourceInventoriedAsName: q,
    orPrimaryIntentsResourceInventoriedAsNote: q,
  };
  const Resourcefilter = {
    orName: q,
    orNote: q,
  };

  return (
    <div>
      <h1>{"Search"}</h1>
      <AssetsTable filter={Assetfilter} />
      <ResourceTable filter={Resourcefilter} />
    </div>
  );
};

export default Search;
