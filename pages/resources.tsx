import { NextPage } from "next";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";
import ResourceTable from "../components/ResourceTable";

const Resources: NextPage = () => {
  const { conformTo } = useRouter().query;
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
  return (
    <div className="p-8">
      <div className="mb-6 w-80">
        <h1>{t("Resources")}</h1>
        <p>{t("Use this page to generate digital product passports of resources")}</p>
      </div>
      <ResourceTable filter={filter} />
    </div>
  );
};

export async function getStaticProps({ locale }: any) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["resourcesProps", "signInProps", "SideBarProps"])),
    },
  };
}

export default Resources;
