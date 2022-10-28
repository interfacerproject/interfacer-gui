import { gql, useQuery } from "@apollo/client";
import { LinkIcon } from "@heroicons/react/solid";
import BrBreadcrumb from "components/brickroom/BrBreadcrumb";
import BrDisplayUser from "components/brickroom/BrDisplayUser";
import BrTags from "components/brickroom/BrTags";
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
  const m = e?.metadata;
  !loading && loading !== undefined && console.log("e", e);

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
              <h2>{e.name}</h2>
              <p className="pt-4 text-gray-500">
                This is a &nbsp;
                <Link href={`/resources`}>
                  <a className="text-primary">{t("Losh asset")}</a>
                </Link>
              </p>
              <span className="pt-4 text-primary">ID: {e.id}</span>
              {m && (
                <>
                  <div className="pt-12 text-primary">
                    <Link href={m.repo}>
                      <a target="_blank" className="flex items-center">
                        <LinkIcon className="h-4" /> &nbsp; {m.repo}
                      </a>
                    </Link>
                  </div>
                  <div className="pt-12 prose" dangerouslySetInnerHTML={{ __html: MdParser.render(m.function) }} />
                  <img src={m.image} className="w-full py-10" />
                  <BrTags tags={m.tags} />
                </>
              )}
            </div>

            <div className="md:col-start-8 md:col-end-13">
              <div className="flex flex-col">
                <span className="font-semibold">{m?.license}</span>
                <span className="italic text-primary">
                  {t("by")} {m?.licensor}
                </span>

                <span className="pt-8">
                  {t("Version")}: {m?.version}
                </span>
                {m?.okhv}

                <button type="button" className="mt-16 mr-8 w-72 btn btn-accent">
                  {t("CLAIM OWNERSHIP")}
                </button>
                <button type="button" className="mt-3 mr-8 w-72 btn btn-outline">
                  {t("add to list +")}
                </button>
                <span className="pt-9">{t("Owner")}</span>
                <BrDisplayUser
                  id={e.primaryAccountable.id}
                  name={e.primaryAccountable.name}
                  location={e.currentLocation?.name}
                />
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
