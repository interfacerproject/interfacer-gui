import AssetsTable from "../components/AssetsTable";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import React from "react";
import NewProjectButton from "../components/NewProjectButton";
import Link from "next/link";
import { useRouter } from "next/router";

const Assets = () => {
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
