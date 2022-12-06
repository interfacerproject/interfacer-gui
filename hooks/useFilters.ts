import { useRouter } from "next/router";
import { EconomicResourceFilterParams } from "../lib/types";
import { useEffect, useState } from "react";

const useFilters = () => {
  const [resourceFilter, setResourceFilter] = useState<EconomicResourceFilterParams>({
    primaryAccountable: [process.env.NEXT_PUBLIC_LOSH_ID!],
    gtOnhandQuantityHasNumericalValue: 0,
  });
  const [proposalFilter, setProposalFilter] = useState<EconomicResourceFilterParams>({});
  const { conformsTo, primaryAccountable, tags } = useRouter().query;
  useEffect(() => {
    const primaryAccountableList =
      typeof primaryAccountable === "string" ? primaryAccountable.split(",") : primaryAccountable;
    const tagsList = typeof tags === "string" ? tags.split(",") : tags;
    const conformToList = typeof conformsTo === "string" ? conformsTo.split(",") : conformsTo;

    setProposalFilter({
      conformsTo: conformToList,
      primaryAccountable: primaryAccountableList,
      classifiedAs: tagsList,
      notCustodian: [process.env.NEXT_PUBLIC_LOSH_ID!],
    });
    setResourceFilter({ ...resourceFilter, conformsTo: conformToList });
  }, [conformsTo, primaryAccountable, tags]);

  return { proposalFilter, resourceFilter };
};

export default useFilters;
