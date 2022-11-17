import { useMutation, useQuery } from "@apollo/client";
import Spinner from "components/brickroom/Spinner";
import Layout from "components/layout/CreateAssetLayout";
import LoshPresentation from "components/LoshPresentation";
import TagsGeoContributors from "components/TagsGeoContributors";
import dayjs from "dayjs";
import { useAuth } from "hooks/useAuth";
import devLog from "lib/devLog";
import {
  CREATE_INTENT,
  CREATE_LOCATION,
  CREATE_PROPOSAL,
  LINK_PROPOSAL_AND_INTENT,
  QUERY_RESOURCE,
  QUERY_VARIABLES,
  TRANSFER_ASSET,
} from "lib/QueryAndMutation";
import { EconomicResource } from "lib/types";
import type { GetStaticPaths } from "next";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";
import { ReactElement, useState } from "react";
import { NextPageWithLayout } from "../../_app";

const ClaimAsset: NextPageWithLayout = () => {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  const [assetTags, setAssetTags] = useState([] as string[]);
  const [locationName, setLocationName] = useState("");
  const [locationAddress, setLocationAddress] = useState("");
  const [contributors, setContributors] = useState([] as { id: string; name: string }[]);
  const [locationId, setLocationId] = useState("");

  const { t } = useTranslation("ResourceProps");
  const { loading, data } = useQuery<{ economicResource: EconomicResource }>(QUERY_RESOURCE, {
    variables: { id: id },
  });
  const e = data?.economicResource;

  const instanceVariables = useQuery(QUERY_VARIABLES).data?.instanceVariables;
  const [createLocation, { data: spatialThing }] = useMutation(CREATE_LOCATION);
  const [transferAsset, { data: economicResource, error }] = useMutation(TRANSFER_ASSET);
  const [createProposal, { data: proposal }] = useMutation(CREATE_PROPOSAL);
  const [createIntent, { data: intent }] = useMutation(CREATE_INTENT);
  const [linkProposalAndIntent, { data: link }] = useMutation(LINK_PROPOSAL_AND_INTENT);

  const handleCreateLocation = async (loc?: any) => {
    const name = locationName === "" ? "*untitled*" : locationName;
    if (loc) {
      createLocation({
        variables: {
          name: name,
          addr: loc.address.label,
          lat: loc.lat,
          lng: loc.lng,
        },
      })
        .then(r => {
          setLocationId(r.data.createSpatialThing.spatialThing.id);
          setLocationAddress(loc.address.label);
        })
        .catch(e => {
          devLog("createLocation error", e);
        });
    } else {
      setLocationId("");
      setLocationAddress("");
    }
  };

  const handleClaim = async () => {
    const metadata = { ...e!.metadata, repositoryOrId: e!.metadata.repo, contributors: contributors };

    const variables = {
      resource: e!.id,
      agent: user?.ulid,
      name: e!.name,
      note: e!.note,
      metadata: JSON.stringify(metadata),
      location: locationId,
      oneUnit: e!.onhandQuantity.hasUnit?.id,
      creationTime: dayjs().toISOString(),
      tags: assetTags?.map(encodeURI),
    };
    const asset = await transferAsset({
      variables: variables,
    })
      .catch(error => {})
      .then((re: any) => {
        devLog("2", re?.data?.createEconomicEvent.economicEvent.toResourceInventoriedAs.id);
        return re?.data;
      });

    const proposal = await createProposal().then(proposal => {
      devLog("3", proposal);
      return proposal.data;
    });

    const intent = await createIntent({
      variables: {
        agent: user?.ulid,
        resource: asset?.createEconomicEvent.economicEvent.toResourceInventoriedAs.id,
        oneUnit: instanceVariables?.units.unitOne.id,
        howMuch: 1,
        currency: instanceVariables?.specs.specCurrency.id,
      },
    }).then(intent => {
      devLog("4", intent);
      return intent.data;
    });

    linkProposalAndIntent({
      variables: {
        proposal: proposal?.createProposal.proposal.id,
        item: intent?.item.intent.id,
        payment: intent?.payment.intent.id,
      },
    }).then(() => {
      router.push(`/asset/${proposal?.createProposal.proposal.id}`);
    });
  };

  return (
    <div className="pb-6">
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
          <TagsGeoContributors
            setAssetTags={setAssetTags}
            setLocationName={setLocationName}
            handleCreateLocation={handleCreateLocation}
            locationName={locationName}
            locationAddress={locationAddress}
            setContributors={setContributors}
            contributors={contributors}
            assetTags={assetTags}
          />
          <button className="btn btn-accent my-4" onClick={handleClaim}>
            {t("Claim Ownership")}
          </button>
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
