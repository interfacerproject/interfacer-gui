import { useQuery } from "@apollo/client";
import BrBreadcrumb from "components/brickroom/BrBreadcrumb";
import { EconomicResource } from "lib/types";
import type { GetStaticPaths, NextPage } from "next";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";
import Spinner from "../../components/brickroom/Spinner";
import { QUERY_RESOURCE } from "lib/QueryAndMutation";
import LoshPresentation from "../../components/LoshPresentation";
import devLog from "../../lib/devLog";

const Resource: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { t } = useTranslation("ResourceProps");

  const { loading, data } = useQuery<{ economicResource: EconomicResource }>(QUERY_RESOURCE, {
    variables: { id: id },
  });
  devLog("data", data);
  const e = data?.economicResource;

  const handleClaim = () => router.push(`/resource/claim/${id}`);

  return (
    <div>
      {loading && <Spinner />}
      {!loading && e && (
        <>
          <div className="">
            <div className="w-full p-2 md:p-8">
              <BrBreadcrumb
                crumbs={[
                  { name: t("Assets"), href: "/assets" },
                  { name: e.conformsTo.name, href: `/assets?conformTo=${e.conformsTo.id}` },
                  { name: t("Imported from Losh"), href: `/resources` },
                ]}
              />
            </div>
          </div>
          <LoshPresentation economicResource={data?.economicResource} goToClaim={handleClaim} />
        </>
      )}
    </div>
  );
};

export const getStaticPaths: GetStaticPaths<{ slug: string }> = async () => {
  return {
    paths: [], //indicates that no page needs be created at build time
    fallback: "blocking", //indicates the type of fallback
  };
};

export async function getStaticProps({ locale }: any) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["ResourceProps"])),
    },
  };
}

export default Resource;
