import { useMutation, useQuery } from "@apollo/client";
import { EconomicResource } from "lib/types";
import type { GetStaticPaths, NextPage } from "next";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";
import Spinner from "components/brickroom/Spinner";
import { CREATE_LOCATION, QUERY_RESOURCE } from "lib/QueryAndMutation";
import { ReactElement, useState } from "react";
import Layout from "components/layout/CreateAssetLayout";
import { NextPageWithLayout } from "../../_app";
import LoshPresentation from "../../../components/LoshPresentation";
import TypeTagsGeoContributors from "../../../components/TypeTagsGeoContributors";
import devLog from "../../../lib/devLog";

const ClaimAsset: NextPageWithLayout = () => {
  const router = useRouter();
  const { id } = router.query;
  const [projectName, setAssetName] = useState("");
  const [assetTags, setAssetTags] = useState([] as string[]);
  const [locationName, setLocationName] = useState("");
  const [contributors, setContributors] = useState([] as { id: string; name: string }[]);
  const [projectType, setAssetType] = useState("");
  const [locationId, setLocationId] = useState("");

  const { t } = useTranslation("ResourceProps");
  const { loading, data } = useQuery<{ economicResource: EconomicResource }>(QUERY_RESOURCE, {
    variables: { id: id },
  });
  const e = data?.economicResource;

  const [createLocation, { data: spatialThing }] = useMutation(CREATE_LOCATION);

  const handleCreateLocation = async (loc: any) => {
    const name = locationName === "" ? "*untitled*" : locationName;
    await createLocation({
      variables: {
        name: name,
        addr: loc.address.label,
        lat: loc.lat,
        lng: loc.lng,
      },
    })
      .then(r => {
        setLocationId(r.data.createSpatialThing.spatialThing.id);
      })
      .catch(e => {
        devLog("createLocation error", e);
      });
  };

  return (
    <div>
      <div className="grid grid-cols-1 gap-2 md:grid-cols-12 pt-14">
        <div className="md:col-start-2 md:col-end-7">
          <h2>{t("claim your ownership over this asset")}</h2>
        </div>
      </div>
      {loading && <Spinner />}
      {!loading && e && (
        <>
          <LoshPresentation economicResource={data?.economicResource} />
        </>
      )}
      <div className="grid grid-cols-1 gap-2 md:grid-cols-12 pt-14">
        <div className="md:col-start-2 md:col-end-7">
          <TypeTagsGeoContributors
            setAssetTags={setAssetTags}
            setLocationName={setLocationName}
            handleCreateLocation={handleCreateLocation}
            locationName={locationName}
            setContributors={setContributors}
            contributors={contributors}
            setAssetType={setAssetType}
            projectType={projectType}
          />
        </div>
      </div>
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
      ...(await serverSideTranslations(locale, ["ResourceProps", "createProjectProps"])),
    },
  };
}
ClaimAsset.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};

export default ClaimAsset;
