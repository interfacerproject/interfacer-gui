import { NextPage } from "next";
import ResourceTable from "../components/ResourceTable";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";

const Resources: NextPage = () => {
  const { conformTo, primaryAccountable } = useRouter().query;
  const filter: { conformsTo?: string[]; primaryAccountable?: string[] } = {
    primaryAccountable: [process.env.NEXT_PUBLIC_LOASH_ID!],
  };
  // @ts-ignore
  conformTo && (filter["conformsTo"] = [].concat(conformTo));
  // @ts-ignore
  primaryAccountable && (filter["primaryAccountable"] = [].concat(primaryAccountable));
  const { t } = useTranslation("resourcesProps");
  return (
    <div className="p-8">
      <div className="mb-6 w-80">
        <h1>{t("title")}</h1>
        <p>{t("description")}</p>
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
