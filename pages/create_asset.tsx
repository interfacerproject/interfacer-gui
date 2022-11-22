import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { ReactElement, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import type { NextPageWithLayout } from "./_app";

// Partials
import { Banner } from "@bbtgnn/polaris-interfacer";
import CreateAssetForm, { CreateAssetNS } from "components/partials/create_asset/CreateAssetForm";

// Layout
import Layout from "../components/layout/CreateAssetLayout";

// Queries
import { useMutation, useQuery } from "@apollo/client";
import useStorage from "hooks/useStorage";
import { prepFilesForZenflows, uploadFiles } from "lib/fileUpload";
import {
  CREATE_ASSET,
  CREATE_INTENT,
  CREATE_LOCATION,
  CREATE_PROPOSAL,
  LINK_PROPOSAL_AND_INTENT,
  QUERY_UNIT_AND_CURRENCY,
} from "lib/QueryAndMutation";
import {
  CreateAssetMutation,
  CreateAssetMutationVariables,
  CreateIntentMutation,
  CreateIntentMutationVariables,
  CreateLocationMutation,
  CreateLocationMutationVariables,
  CreateProposalMutation,
  CreateProposalMutationVariables,
  GetUnitAndCurrencyQuery,
  LinkProposalAndIntentMutation,
  LinkProposalAndIntentMutationVariables,
} from "lib/types";

// Utils
import devLog from "lib/devLog";
import { errorFormatter } from "lib/errorFormatter";
import { useRouter } from "next/router";

//

export async function getStaticProps({ locale }: any) {
  return {
    props: {
      ...(await serverSideTranslations(locale, [
        "createProjectProps",
        "signInProps",
        "SideBarProps",
        "SideBarProps",
        "BrImageUploadProps",
      ])),
    },
  };
}

//

const CreateProject: NextPageWithLayout = () => {
  const { t } = useTranslation("createProjectProps");

  const router = useRouter();
  const { user, loading } = useAuth();
  const { getItem } = useStorage();
  const [error, setError] = useState<string>("");

  /* Getting all the needed mutations */

  const unitAndCurrency = useQuery<GetUnitAndCurrencyQuery>(QUERY_UNIT_AND_CURRENCY).data?.instanceVariables;
  const [createAsset] = useMutation<CreateAssetMutation, CreateAssetMutationVariables>(CREATE_ASSET);
  const [createLocation] = useMutation<CreateLocationMutation, CreateLocationMutationVariables>(CREATE_LOCATION);
  const [createProposal] = useMutation<CreateProposalMutation, CreateProposalMutationVariables>(CREATE_PROPOSAL);
  const [createIntent] = useMutation<CreateIntentMutation, CreateIntentMutationVariables>(CREATE_INTENT);
  const [linkProposalAndIntent] = useMutation<LinkProposalAndIntentMutation, LinkProposalAndIntentMutationVariables>(
    LINK_PROPOSAL_AND_INTENT
  );

  /* Location Creation */

  type SpatialThingRes = CreateLocationMutation["createSpatialThing"]["spatialThing"];

  async function handleCreateLocation(formData: CreateAssetNS.FormValues): Promise<SpatialThingRes | undefined> {
    try {
      const { data } = await createLocation({
        variables: {
          name: formData.locationName,
          addr: formData.location?.address.label!,
          lat: formData.location?.position.lat!,
          lng: formData.location?.position.lng!,
        },
      });
      const st = data?.createSpatialThing.spatialThing;
      devLog("success: location created", st);
      return st;
    } catch (e) {
      devLog("error: location not created", e);
      throw e;
    }
  }

  async function handleAssetCreation(formData: CreateAssetNS.FormValues) {
    try {
      const location = await handleCreateLocation(formData);
      // devLog is in handleCreateLocation
      const images = await prepFilesForZenflows(formData.images, getItem("eddsa"));
      devLog("info: images prepared", images);
      const tags = formData.tags.map(t => encodeURI(t.value));
      devLog("info: tags prepared", tags);
      const contributors = formData.contributors.map(c => c.value);
      devLog("info: contributors prepared", contributors);

      const variables: CreateAssetMutationVariables = {
        resourceSpec: formData.type,
        agent: user?.ulid!,
        name: formData.name,
        note: formData.description,
        metadata: JSON.stringify({ repositoryOrId: formData.repositoryOrId, contributors }),
        location: location?.id!,
        oneUnit: unitAndCurrency?.units.unitOne.id!,
        creationTime: new Date().toISOString(),
        images,
        tags,
      };
      devLog("info: asset variables created", variables);

      // Create asset
      const { data: createAssetData, errors } = await createAsset({ variables });
      if (errors) throw new Error("AssetNotCreated");

      const economicEvent = createAssetData?.createEconomicEvent.economicEvent!;
      const asset = economicEvent?.resourceInventoriedAs!;
      devLog("success: asset created");
      devLog("info: economicEvent", economicEvent);
      devLog("info: asset", asset);

      // Upload images
      await uploadFiles(formData.images);
      devLog("success: images uploaded");

      // Create proposal & intent
      const { data: createProposalData } = await createProposal();
      devLog("info: created proposal", createProposalData?.createProposal.proposal);

      const { data: createIntentData } = await createIntent({
        variables: {
          agent: user?.ulid!,
          resource: asset?.id!,
          oneUnit: unitAndCurrency?.units.unitOne.id!,
          howMuch: 1,
          currency: unitAndCurrency?.specs.specCurrency.id!,
        },
      });
      devLog("info: created intent", createIntentData);

      // Linking the two of them
      const { data: linkData } = await linkProposalAndIntent({
        variables: {
          proposal: createProposalData?.createProposal.proposal.id!,
          item: createIntentData?.item.intent.id!,
          payment: createIntentData?.payment.intent.id!,
        },
      });
      devLog("info: created link", linkData);

      // TODO: Send message
      // ...

      // Redirecting user
      await router.replace(`/asset/${createProposalData?.createProposal.proposal.id}`);
    } catch (e) {
      devLog(e);
      let err = errorFormatter(e);
      if (err.includes("has already been taken"))
        err = `${t("One of the images you selected already exists on the server, please upload a different file")}.`;
      setError(err);
    }
  }

  //

  return (
    <>
      {loading && <div>creating...</div>}

      {!loading && (
        <div className="mx-auto p-8 max-w-xl">
          {/* Heading */}
          <div>
            <h2 className="text-primary">{t("Create a new asset")} </h2>
            <p>{t("Make sure you read the Comunity Guidelines before you create a new asset")}.</p>
            <p>{t("Fields marked with a red asterisk are mandatory")}.</p>
          </div>

          <CreateAssetForm
            onSubmit={async data => {
              await handleAssetCreation(data);
            }}
          >
            {error && (
              <Banner
                title={t("Error in Asset creation")}
                status="critical"
                onDismiss={() => {
                  setError("");
                }}
              >
                <p className="whitespace-pre-wrap">{error}</p>
              </Banner>
            )}
          </CreateAssetForm>
          {/* {createdAssetId ? (
        <Link href={createdAssetId}>
          <a className="btn btn-accent">{t("go to the asset")}</a>
        </Link> */}
        </div>
      )}
    </>
  );
};

//

CreateProject.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};

export default CreateProject;

//

// async function onSubmit(e: any) {
//   e.preventDefault();
//   const variables = {
//     resourceSpec: resourceSpec,
//     agent: user?.ulid,
//     name: assetName,
//     note: assetDescription,
//     metadata: JSON.stringify({ repositoryOrId: repositoryOrId, contributors: contributors }),
//     location: locationId,
//     oneUnit: instanceVariables?.units?.unitOne.id,
//     creationTime: dayjs().toISOString(),
//     images: images,
//     tags: assetTags?.map(t => encodeURI(t)),
//   };
//   let logsText = logs.concat("info:Creating raise resource economicEvent").concat(JSON.stringify(variables, null, 2));

//   images.forEach((i, index) => {
//     logsText = logsText.concat(`info:Uploading image ${index + 1} of ${images.length}`);
//     setLogs(logsText);
//     const filesArray = new FormData();
//     filesArray.append(i.hash, imagesFiles[index]);
//     fetch(process.env.NEXT_PUBLIC_ZENFLOWS_FILE_URL!, {
//       method: "post",
//       body: filesArray,
//     })
//       .catch(error => {
//         logsText = logsText.concat([`error:${error}`]);
//         setLogs(logsText);
//       })
//       .then((r: any) => {
//         devLog("image upload response", r);
//       });
//   });

//   const proposal = await createProposal().then(proposal => {
//     logsText = logsText.concat([
//       `success: Created proposal with id: ${proposal.data?.createProposal.proposal.id}`,
//       "info: Creating intents",
//     ]);
//     setLogs(logsText);
//     devLog("3", proposal);
//     return proposal.data;
//   });

//   const intent = await createIntent({
//     variables: {
//       agent: user?.ulid,
//       resource: asset?.createEconomicEvent.economicEvent.resourceInventoriedAs.id,
//       oneUnit: instanceVariables?.units.unitOne.id,
//       howMuch: parseFloat(price),
//       currency: instanceVariables?.specs.specCurrency.id,
//     },
//   }).then(intent => {
//     logsText = logsText.concat([
//       `success: Created intent with id: ${intent.data?.item.intent.id}`,
//       "info: Linking proposal and intent",
//     ]);
//     setLogs(logsText);
//     devLog("4", intent);
//     return intent.data;
//   });

//   linkProposalAndIntent({
//     variables: {
//       proposal: proposal?.createProposal.proposal.id,
//       item: intent?.item.intent.id,
//       payment: intent?.payment.intent.id,
//     },
//   }).then(() => {
//     logsText = logsText.concat(["success: Asset succesfull created!!!"]);
//     setLogs(logsText);
//     setAssetCreatedId(`/asset/${proposal?.createProposal.proposal.id}`);
//   });
// }
