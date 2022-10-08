import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Link from "next/link";
import { useRouter } from "next/router";
import AssetsTable from "../components/AssetsTable";
import NewProjectButton from "../components/NewProjectButton";
import devLog from "../lib/devLog";

const Assets = () => {
  const { conformTo, primaryAccountable } = useRouter().query;
  const filter: {
    primaryIntentsResourceInventoriedAsConformsTo?: string[];
    primaryIntentsResourceInventoriedAsPrimaryAccountable?: string[];
  } = {};
  conformTo &&
    (filter["primaryIntentsResourceInventoriedAsConformsTo"] = [].concat(
      // @ts-ignore
      conformTo.split(",")
    ));
  primaryAccountable &&
    (filter["primaryIntentsResourceInventoriedAsPrimaryAccountable"] =
      // @ts-ignore
      [].concat(primaryAccountable.split(",")));
  devLog("filters", filter);
  const { t } = useTranslation("lastUpdatedProps");
  return (
    <div className="p-8">
      <div className="mb-6 w-96">
        <h1>{t("title")}</h1>
        <p className="my-2">{t("description")}</p>
        <NewProjectButton />
        <Link href="https://github.com/dyne/interfacer-gui/issues/new">
          <a target="_blank" className="ml-2 normal-case btn btn-accent btn-outline btn-md">
            {t("Report a bug")}
          </a>
        </Link>
      </div>
      <AssetsTable filter={filter} />
    </div>
  );
};

export async function getStaticProps({ locale }: any) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["signInProps", "lastUpdatedProps", "SideBarProps"])),
    },
  };
}

export default Assets;
