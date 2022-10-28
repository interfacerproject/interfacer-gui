import ResourceTable from "components/ResourceTable";
import { EconomicResourceFilterParams } from "lib/types";
import { NextPage } from "next";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";

const Resources: NextPage = () => {
  const { conformTo, primaryAccountable } = useRouter().query;
  const filter: {
    conformsTo?: string[];
    primaryAccountable?: string[];
    gtOnhandQuantityHasNumericalValue: number;
  } = {
    primaryAccountable: [process.env.NEXT_PUBLIC_LOASH_ID!],
    gtOnhandQuantityHasNumericalValue: 0,
  };
  // @ts-ignore
  conformTo && (filter["conformsTo"] = [].concat(conformTo));
  const { t } = useTranslation("resourcesProps");

  // Getting filters from url
  const { conformsTo, primaryAccountable } = useRouter().query;

  // Checking that env.NEXT_PUBLIC_LOSH_ID is set
  if (!process.env.NEXT_PUBLIC_LOSH_ID) throw new Error("missingEnvLoshID");

  // Adding filters to object
  const filter: EconomicResourceFilterParams = {
    primaryAccountable: [process.env.NEXT_PUBLIC_LOSH_ID!],
  };
  if (primaryAccountable) filter.primaryAccountable?.concat(primaryAccountable);
  if (conformsTo) filter.conformsTo = ([] as Array<string>).concat(conformsTo);

  return (
    <div className="p-8">
      {/* Intro */}
      <div className="mb-6 w-80">
        <h1>{t("title")}</h1>
        <p>{t("description")}</p>
      </div>

      {/* The table */}
      <ResourceTable filter={filter} last={10} />
    </div>
  );
};

export default Resources;
