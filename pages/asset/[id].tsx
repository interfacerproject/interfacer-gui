import { gql, useQuery } from "@apollo/client";
import { GetStaticPaths } from "next";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import BrDisplayUser from "../../components/brickroom/BrDisplayUser";
import Link from "next/link";
import devLog from "../../lib/devLog";
import Tabs from "../../components/Tabs";
import AssetDetailOverview from "../../components/AssetDetailOverview";
import Spinner from "../../components/brickroom/Spinner";
import { EconomicResource } from "../../lib/types";
import BrBreadcrumb from "../../components/brickroom/BrBreadcrumb";
import BrThumbinailsGallery from "../../components/brickroom/BrThumbinailsGallery";

const Asset = () => {
  const router = useRouter();
  const { id } = router.query;
  const { t } = useTranslation("common");
  const [mainImage, setMainImage] = useState("");
  const [asset, setAsset] = useState<EconomicResource | undefined>();
  const QUERY_ASSET = gql`
    query ($id: ID!) {
      proposal(id: $id) {
        primaryIntents {
          resourceInventoriedAs {
            conformsTo {
              name
              id
            }
            currentLocation {
              name
            }
            name
            id
            note
            classifiedAs
            primaryAccountable {
              name
              id
            }
            onhandQuantity {
              hasUnit {
                label
              }
            }
            images {
              hash
              name
              mimeType
              bin
            }
          }
        }
        reciprocalIntents {
          resourceQuantity {
            hasNumericalValue
            hasUnit {
              label
              symbol
            }
          }
        }
      }
    }
  `;
  const { data, startPolling } = useQuery(QUERY_ASSET, { variables: { id } });
  startPolling(2000);

  useEffect(() => {
    const _asset: EconomicResource = data?.proposal.primaryIntents[0].resourceInventoriedAs;
    // @ts-ignore
    const _image = _asset?.images[0];
    setMainImage(`data:${_image?.mimeType};base64,${_image?.bin}`);
    setAsset(_asset);
  }, [data]);

  devLog("images", asset?.images);

  return (
    <>
      {asset && (
        <>
          <div className="w-full p-2 md:p-8">
            <BrBreadcrumb
              crumbs={[
                { name: t("assets"), href: "/assets" },
                { name: asset.conformsTo.name, href: `/assets?conformTo=${asset.conformsTo.id}` },
              ]}
            />
          </div>
          <div className="grid grid-cols-1 px-2 md:grid-cols-3 md:gap-4 md:px-0 md:mx-32">
            <div id="left-col" className="flex flex-col col-span-2">
              <div className="flex flex-col content-end mb-4">
                <p>
                  {t("This is a")}
                  <Link href={`/assets?conformTo=${asset.conformsTo.id}`}>
                    <a className="ml-1 font-bold text-primary hover:underline">{asset.conformsTo.name}</a>
                  </Link>
                </p>
                <h2 className="my-2">{asset.name}</h2>
                <p className="text-primary">ID: {asset.id}</p>
              </div>
              <BrThumbinailsGallery
                images={asset?.images
                  ?.filter(image => !!image.bin)
                  .map(image => `data:${image.mimeType};base64,${image.bin}`)}
              />
              <div id="tabs" className="my-6">
                <Tabs
                  tabsArray={[
                    { title: t("Overview"), component: <AssetDetailOverview asset={asset} /> },
                    { title: t("Contributions"), component: <Spinner /> },
                    { title: t("DPP"), component: <Spinner /> },
                  ]}
                />
              </div>
            </div>
            <div id="right-col" className="flex flex-col mt-16">
              <button className="px-20 mb-4 btn btn-accent btn-block">{t("Buy this asset")}</button>
              <button className="btn btn-accent btn-outline btn-block" tabIndex={-1} role="button" aria-disabled="true">
                {t("Add to list +")}
              </button>
              <p className="mt-8 mb-2">{t("Owner")}:</p>
              <BrDisplayUser
                id={asset.primaryAccountable.id}
                name={asset.primaryAccountable.name}
                location={asset.currentLocation?.name}
              />
            </div>
          </div>
        </>
      )}
    </>
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
      ...(await serverSideTranslations(locale, ["common", "signInProps", "SideBarProps"])),
    },
  };
}

export default Asset;
