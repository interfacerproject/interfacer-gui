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
  CITE_ASSET,
  CREATE_ASSET,
  CREATE_LOCATION,
  CREATE_PROCESS,
  QUERY_UNIT_AND_CURRENCY,
} from "lib/QueryAndMutation";
import {
  CreateAssetMutation,
  CreateAssetMutationVariables,
  CreateLocationMutation,
  CreateLocationMutationVariables,
  GetUnitAndCurrencyQuery,
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
  const { user, loading } = useAuth();
  const router = useRouter();
  const { getItem } = useStorage();
  const [error, setError] = useState<string>("");

  /* Getting all the needed mutations */

  const unitAndCurrency = useQuery<GetUnitAndCurrencyQuery>(QUERY_UNIT_AND_CURRENCY).data?.instanceVariables;
  const [citeAsset] = useMutation(CITE_ASSET);
  const [createAsset] = useMutation<CreateAssetMutation, CreateAssetMutationVariables>(CREATE_ASSET);
  const [createLocation] = useMutation<CreateLocationMutation, CreateLocationMutationVariables>(CREATE_LOCATION);
  const [createProcess] = useMutation(CREATE_PROCESS);

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
      const processName = `creation of ${formData.name} by ${user!.name}`;
      const { data: processData } = await createProcess({ variables: { name: processName } });
      devLog("success: process created", processData);

      const location = await handleCreateLocation(formData);
      // devLog is in handleCreateLocation
      const images = await prepFilesForZenflows(formData.images, getItem("eddsa"));
      devLog("info: images prepared", images);
      const tags = formData.tags.map(t => encodeURI(t.value));
      devLog("info: tags prepared", tags);
      const contributors = formData.contributors.map(c => c.value);
      devLog("info: contributors prepared", contributors);

      for (const resource of formData.resources) {
        devLog("pp", resource.value);
        const citeVariables = {
          agent: user!.ulid,
          resource: resource.value.id,
          process: processData?.createProcess.process.id,
          creationTime: new Date().toISOString(),
          unitOne: unitAndCurrency?.units.unitOne.id!,
        };
        await citeAsset({ variables: citeVariables });
      }

      const variables: CreateAssetMutationVariables = {
        resourceSpec: formData.type,
        process: processData.createProcess.process.id,
        agent: user?.ulid!,
        name: formData.name,
        note: formData.description,
        metadata: JSON.stringify({ contributors: contributors }),
        location: location?.id!,
        oneUnit: unitAndCurrency?.units.unitOne.id!,
        creationTime: new Date().toISOString(),
        repo: formData.repositoryOrId,
        license: formData.license,
        images,
        tags,
      };
      devLog("info: asset variables created", variables);

      // Create asset
      const { data: createAssetData, errors } = await createAsset({ variables });
      if (errors) throw new Error("AssetNotCreated");

      // Redirecting user
      await router.replace(`/asset/${createAssetData?.createEconomicEvent?.economicEvent?.resourceInventoriedAs?.id}`);
    } catch (e) {
      devLog(e);
      let err = errorFormatter(e);
      if (err.includes("has already been taken"))
        err = `${t("One of the images you selected already exists on the server, please upload a different file")}.`;
      setError(err);
    }
  }

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
