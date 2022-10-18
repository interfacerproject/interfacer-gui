import { gql, useQuery } from "@apollo/client";
import { LinkIcon } from "@heroicons/react/solid";
import BrBreadcrumb from "components/brickroom/BrBreadcrumb";
import { EconomicResource } from "lib/types";
import type { GetStaticPaths, NextPage } from "next";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Link from "next/link";
import { useRouter } from "next/router";
import Spinner from "../../components/brickroom/Spinner";
import MdParser from "../../lib/MdParser";

const Resource: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { t } = useTranslation("ResourceProps");

  const QUERY_RESOURCE = gql`
    query getResourceTable($id: ID!) {
      economicResource(id: $id) {
        id
        name
        note
        metadata
        conformsTo {
          id
          name
        }
        onhandQuantity {
          hasUnit {
            id
            symbol
            label
          }
          hasNumericalValue
        }
        accountingQuantity {
          hasUnit {
            label
            symbol
          }
          hasNumericalValue
        }
        primaryAccountable {
          id
          name
        }
        currentLocation {
          name
          mappableAddress
        }
        primaryAccountable {
          id
          name
        }
        images {
          hash
          name
          mimeType
          bin
        }
      }
    }
  `;
  const { loading, data } = useQuery<{ economicResource: EconomicResource }>(QUERY_RESOURCE, {
    variables: { id: id },
  });
  const e = data?.economicResource;

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

          <div className="grid grid-cols-1 gap-2 md:grid-cols-12 pt-14">
            <div className="md:col-start-2 md:col-end-7">
              <h2>{data?.economicResource.name}</h2>
              <p className="pt-4 text-gray-500">
                This is a &nbsp;
                <Link href={`/resources`}>
                  <a className="text-primary">{t("Losh asset")}</a>
                </Link>
              </p>
              <div className="pt-12 text-primary">
                <Link href={e.metadata.repo}>
                  <a target="_blank" className="flex items-center">
                    <LinkIcon className="h-4" /> &nbsp; {e.metadata.repo}
                  </a>
                </Link>
              </div>
              <div className="pt-12 prose" dangerouslySetInnerHTML={{ __html: MdParser.render(e.metadata.function) }} />
            </div>

            <div className="md:col-start-8 md:col-end-13">
              <div className="flex flex-col">
                <span className="font-semibold">{e.metadata.license}</span>
                <span className="italic text-primary">
                  {t("by")} {e.metadata.licensor}
                </span>

                <span className="pt-8">
                  {t("Version")}: {e.metadata.version}
                </span>
                {e.metadata.okhv}
                <h4>{t("assigned to:")}</h4>
                <p className="text-gray-500">{data?.economicResource.primaryAccountable?.name}</p>
              </div>

              <div>
                <h4>{t("current location:")}</h4>
                <p className="text-gray-500">{data?.economicResource.currentLocation?.name}</p>
              </div>
            </div>
          </div>
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
