import React, { useState } from "react";
import AddContributors from "./AddContributors";
import SelectAssetType from "./SelectAssetType";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import SelectTags from "./SelectTags";

type Filter = {
  primaryIntentsResourceInventoriedAsConformsTo: string[];
  primaryIntentsResourceInventoriedAsPrimaryAccountable: string[];
  primaryIntentsResourceInventoriedAsClassifiedAs: string[];
};

const Filters = ({
  noPrimaryAccountableFilter = false,
  filter,
}: {
  noPrimaryAccountableFilter: boolean;
  filter: Filter;
}) => {
  const [contributors, setContributors] = useState<Array<{ name: string; id: string }>>([]);
  const [conformsTo, setConformsTo] = useState<Array<{ value: string; label: string }>>([]);
  const [tags, setTags] = useState<Array<string>>([]);
  const { t } = useTranslation("lastUpdatedProps");
  const router = useRouter();
  const applyFilters = () => {
    const query = router.query;
    query.primaryAccountable = contributors.map(c => c.id).join(",");
    query.conformTo = conformsTo.map((c: any) => c.value).join(",");
    const tagString = tags.join(",");
    query.tags = tagString;
    router.push({
      pathname: router.pathname,
      query,
    });
  };
  const clearFilters = () => {
    const query = router.query;
    delete query.primaryAccountable;
    delete query.conformTo;
    delete query.tags;
    setContributors([]);
    setConformsTo([]);
    setTags([]);
    router.push({
      pathname: router.pathname,
      query,
    });
  };
  return (
    <div className="p-4 bg-white border rounded-lg shadow">
      <h4 className="mb-4 text-2xl font-bold">{t("filters.filter for")}:</h4>
      {!noPrimaryAccountableFilter && (
        <AddContributors
          initialContributors={filter?.primaryIntentsResourceInventoriedAsPrimaryAccountable}
          contributors={contributors}
          setContributors={setContributors}
          label={t("filters.contributors")}
        />
      )}
      <SelectAssetType
        onChange={setConformsTo}
        label={t("filters.type")}
        assetType={conformsTo}
        initialTypes={filter?.primaryIntentsResourceInventoriedAsConformsTo}
      />
      <SelectTags
        label={t("filters.tags")}
        onChange={setTags}
        selectedTags={tags}
        initialTags={filter?.primaryIntentsResourceInventoriedAsClassifiedAs}
      />
      <div className="grid grid-cols-2 gap-2 mt-4">
        <div>
          <button className="btn btn-outline btn-error btn-block" onClick={clearFilters}>
            {t("filters.reset")}
          </button>
        </div>
        <div>
          <button onClick={applyFilters} className="btn btn-accent btn-block">
            {t("filters.apply")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Filters;
