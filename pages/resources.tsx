import { NextPage } from "next";
import ResourceTable from "../components/ResourceTable";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import useFilters from "../hooks/useFilters";
import devLog from "../lib/devLog";

const Resources: NextPage = () => {
  const { resourceFilter } = useFilters();
  devLog("Resources", resourceFilter);
  const { t } = useTranslation("resourcesProps");
  return (
    <div className="p-8">
      <div className="mb-6 w-80">
        <h1>{t("Resources")}</h1>
        <p>{t("Use this page to generate digital product passports of resources")}</p>
      </div>
      <ResourceTable filter={resourceFilter} />
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
