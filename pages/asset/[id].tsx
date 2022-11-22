import { gql, useQuery } from "@apollo/client";
import cn from "classnames";
import { GetStaticPaths } from "next";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import AddStar from "../../components/AddStar";
import AssetDetailOverview from "../../components/AssetDetailOverview";
import BrBreadcrumb from "../../components/brickroom/BrBreadcrumb";
import BrDisplayUser from "../../components/brickroom/BrDisplayUser";
import BrTabs from "../../components/brickroom/BrTabs";
import BrThumbinailsGallery from "../../components/brickroom/BrThumbinailsGallery";
import Spinner from "../../components/brickroom/Spinner";
import ContributorsTable from "../../components/ContributorsTable";
import { useAuth } from "../../hooks/useAuth";
import useStorage from "../../hooks/useStorage";
import { EconomicResource } from "../../lib/types";
import WatchButton from "../../components/WatchButton";

const Asset = () => {
  const { getItem, setItem } = useStorage();
  const router = useRouter();
  const { user } = useAuth();
  const { id } = router.query;
  const { t } = useTranslation("common");
  const [asset, setAsset] = useState<EconomicResource | undefined>();
  const [inList, setInList] = useState<boolean>(false);
  const [images, setImages] = useState<string[]>([]);
  const [isWatching, setIsWatching] = useState(asset?.metadata?.watchers?.some((w: any) => w.id === user?.ulid));
  const QUERY_ASSET_PAGE = gql`
    query GetAssetPage($id: ID!) {
      proposal(id: $id) {
        created
        primaryIntents {
          hasPointInTime
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
            metadata
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
      }
    }
  `;

  const { data, startPolling } = useQuery(QUERY_ASSET_PAGE, { variables: { id } });
  startPolling(2000);

  useEffect(() => {
    const _asset: EconomicResource = data?.proposal.primaryIntents[0].resourceInventoriedAs;
    setAsset(_asset);
    const singleImage = typeof _asset?.metadata?.image === "string";
    const metadataImage = singleImage ? [_asset?.metadata?.image] : _asset?.metadata?.image || [];
    const _images =
      _asset && _asset.images!.length > 0
        ? _asset?.images?.filter(image => !!image.bin).map(image => `data:${image.mimeType};base64,${image.bin}`)
        : metadataImage;
    setImages(_images);
  }, [data]);

  const handleCollect = () => {
    const _list = getItem("assetsCollected");
    const _listParsed = _list ? JSON.parse(_list) : [];
    if (_listParsed.includes(asset!.id)) {
      setItem("assetsCollected", JSON.stringify(_listParsed.filter((a: string) => a !== asset!.id)));
      setInList(false);
    } else {
      const _listParsedUpdated = [..._listParsed, asset?.id];
      setItem("assetsCollected", JSON.stringify(_listParsedUpdated));
      setInList(true);
    }
  };

  useEffect(() => {
    const _list = getItem("assetsCollected");
    const _listParsed = _list ? JSON.parse(_list) : [];
    setInList(_listParsed.includes(asset?.id));
  }, [asset, getItem]);

  return (
    <>
      {asset && (
        <>
          <div className="w-full p-2 md:p-8 flex flex-row">
            <div className="flex-grow">
              <BrBreadcrumb
                crumbs={[
                  { name: t("assets"), href: "/assets" },
                  { name: asset.conformsTo.name, href: `/assets?conformTo=${asset.conformsTo.id}` },
                ]}
              />
            </div>
            <AddStar id={asset.id} metadata={asset.metadata} userId={user?.ulid} />
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
                <p className="text-primary">
                  {"ID:"} {asset.id}
                </p>
              </div>
              {images && <BrThumbinailsGallery images={images} />}
              <div id="tabs" className="my-6">
                <BrTabs
                  tabsArray={[
                    { title: t("Overview"), component: <AssetDetailOverview asset={asset} /> },
                    {
                      title: t("Contributions"),
                      component: (
                        <ContributorsTable
                          contributors={asset.metadata?.contributors}
                          date={data?.proposal.created}
                          title={t("Contributors")}
                        />
                      ),
                    },
                    { title: t("DPP"), component: <Spinner /> },
                  ]}
                />
              </div>
            </div>
            <div id="right-col" className="flex flex-col mt-16">
              <button
                className={cn("px-20 mb-4 btn btn-block", {
                  "btn-accent": !inList,
                  "btn-outline": inList,
                })}
                onClick={handleCollect}
              >
                {t(inList ? "remove from list" : "add to list")}
              </button>
              <WatchButton id={asset.id} metadata={asset.metadata} />
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
