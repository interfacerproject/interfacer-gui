import { useQuery } from "@apollo/client";
import { useAuth } from "hooks/useAuth";
import useStorage from "hooks/useStorage";
import devLog from "lib/devLog";
import { QUERY_RESOURCE } from "lib/QueryAndMutation";
import { EconomicResource } from "lib/types";
import { GetStaticPaths } from "next";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";

// Components
import { Button, Card, Icon, Stack, Tabs, Text } from "@bbtgnn/polaris-interfacer";
import AddStar from "components/AddStar";
import AssetDetailOverview from "components/AssetDetailOverview";
import BrBreadcrumb from "components/brickroom/BrBreadcrumb";
import BrDisplayUser from "components/brickroom/BrDisplayUser";
import Dpp from "components/Dpp";
import WatchButton from "components/WatchButton";
import Link from "next/link";

// Icons
import { LinkMinor, MergeMinor, PlusMinor } from "@shopify/polaris-icons";

//

const Asset = () => {
  const { getItem, setItem } = useStorage();
  const router = useRouter();
  const { user } = useAuth();
  const { id } = router.query;
  const { t } = useTranslation("common");
  const [asset, setAsset] = useState<EconomicResource | undefined>();
  const [inList, setInList] = useState<boolean>(false);
  const [images, setImages] = useState<string[]>([]);
  const { loading, data, startPolling, refetch } = useQuery<{ economicResource: EconomicResource }>(QUERY_RESOURCE, {
    variables: { id: id },
  });
  startPolling(120000);

  devLog("trace", data?.economicResource.trace);
  devLog("traceDpp", data?.economicResource.traceDpp);

  useEffect(() => {
    const _asset: EconomicResource | undefined = data?.economicResource;
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

  // Tabs setup

  const [selected, setSelected] = useState(0);

  const handleTabChange = useCallback((selectedTabIndex: number) => setSelected(selectedTabIndex), []);

  //

  if (!asset) return null;

  return (
    <>
      <div className="flex flex-row p-4">
        <BrBreadcrumb
          crumbs={[
            { name: t("Assets"), href: "/assets" },
            { name: asset.conformsTo.name, href: `/assets?conformTo=${asset.conformsTo.id}` },
          ]}
        />
      </div>

      {/* Main */}
      <div className="p-4 sm:max-w-xl mx-auto md:max-w-none md:flex md:flex-row md:space-x-12 md:justify-center">
        {/* Content */}
        <div className="grow max-w-xl mb-16 md:mb-0">
          <Stack vertical spacing="extraLoose">
            {/* Title */}
            <Stack vertical spacing="tight">
              <Text as="p" variant="bodyMd">
                {t("This is a")}
                <Link href={`/assets?conformTo=${asset.conformsTo.id}`}>
                  <a className="ml-1 font-bold text-primary hover:underline">{asset.conformsTo.name}</a>
                </Link>
              </Text>
              <Text as="h1" variant="heading2xl">
                {asset.name}
              </Text>
            </Stack>

            {/* Image placeholder */}
            <div className="block h-80 bg-gray-300 rounded-lg"></div>
            {/* {images && <BrThumbinailsGallery images={images} />} */}

            {/* Content */}
            <Stack vertical spacing="loose">
              <Tabs
                tabs={[
                  {
                    id: "overview",
                    content: t("Overview"),
                    accessibilityLabel: t("Asset overview"),
                    panelID: "overview-content",
                  },
                  {
                    id: "dpp",
                    content: "DPP",
                    accessibilityLabel: "Digital Product Passport",
                    panelID: "dpp-content",
                  },
                ]}
                selected={selected}
                onSelect={handleTabChange}
              />

              {selected == 0 && <AssetDetailOverview asset={asset} />}
              {selected == 1 && <Dpp dpp={data?.economicResource.traceDpp} />}
              {/* <ContributorsTable
                contributors={asset.metadata?.contributors}
                title={t("Contributors")}
                // @ts-ignore
                data={asset.trace?.filter((t: any) => !!t.hasPointInTime)[0].hasPointInTime}
              /> */}
            </Stack>
          </Stack>
        </div>

        {/* Sidebar */}
        <div>
          {/* Asset info */}
          <Card sectioned>
            <Stack vertical>
              <div>
                <Text as="h2" variant="headingMd">
                  {"ID"}
                </Text>
                <p className="text-primary font-mono">{asset.id}</p>
              </div>

              <div className="space-y-1">
                <Text as="h2" variant="headingMd">
                  {t("Owner")}
                </Text>
                <BrDisplayUser
                  id={asset.primaryAccountable.id}
                  name={asset.primaryAccountable.name}
                  location={asset.currentLocation?.name}
                />
              </div>
            </Stack>
          </Card>

          {/* Actions */}
          <Card sectioned>
            <Stack vertical>
              {asset.repo && (
                <Button url={asset.repo} icon={<Icon source={LinkMinor} />} fullWidth size="large">
                  {t("Go to source")}
                </Button>
              )}

              <Button size="large" onClick={handleCollect} fullWidth icon={<Icon source={PlusMinor} />}>
                {inList ? t("remove from list") : t("add to list")}
              </Button>

              <WatchButton id={asset.id} metadata={asset.metadata} />

              <AddStar
                id={asset.id}
                metadata={asset.metadata}
                userId={user?.ulid}
                onStarred={refetch}
                onDestarred={refetch}
              />
            </Stack>
          </Card>

          {/* Contributions */}
          <Card sectioned>
            <Stack vertical>
              <Text as="h2" variant="headingMd">
                {t("Contributions")}
              </Text>
              <Button
                icon={<Icon source={MergeMinor} />}
                size="large"
                fullWidth
                primary
                onClick={() => router.push(`/create/contribution/${id}`)}
              >
                {t("Make a contribution")}
              </Button>
            </Stack>
          </Card>
        </div>
      </div>
    </>
  );
};

//

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

//

export default Asset;
