import { useRouter } from "next/router";

const useFilters = () => {
  const { conformTo, primaryAccountable, tags } = useRouter().query;
  const filter: {
    primaryIntentsResourceInventoriedAsConformsTo?: string[];
    primaryIntentsResourceInventoriedAsPrimaryAccountable?: string[];
    primaryIntentsResourceInventoriedAsClassifiedAs?: string[];
  } = {};
  const primaryAccountableList =
    typeof primaryAccountable === "string" ? primaryAccountable.split(",") : primaryAccountable;
  const tagsList = typeof tags === "string" ? tags.split(",") : tags;
  const conformToList = typeof conformTo === "string" ? conformTo.split(",") : conformTo;
  conformTo && (filter["primaryIntentsResourceInventoriedAsConformsTo"] = conformToList);
  primaryAccountable && (filter["primaryIntentsResourceInventoriedAsPrimaryAccountable"] = primaryAccountableList);
  tags && (filter["primaryIntentsResourceInventoriedAsClassifiedAs"] = tagsList);

  return { filter };
};

export default useFilters;
