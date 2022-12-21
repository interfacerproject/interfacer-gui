import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { ReactElement, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import type { NextPageWithLayout } from "./_app";

// Partials
import { Banner, Button } from "@bbtgnn/polaris-interfacer";
import CreateProjectForm, { CreateProjectNS } from "components/partials/create_project/CreateProjectForm";

// Layout
import Layout from "../components/layout/Layout";

// Queries
import { useMutation, useQuery } from "@apollo/client";
import useStorage from "hooks/useStorage";
import { prepFilesForZenflows, uploadFiles } from "lib/fileUpload";
import {
  ASK_RESOURCE_PRIMARY_ACCOUNTABLE,
  CITE_PROJECT,
  CREATE_PROJECT,
  CREATE_LOCATION,
  CREATE_PROCESS,
  QUERY_UNIT_AND_CURRENCY,
  CONTRIBUTE_TO_PROJECT,
} from "lib/QueryAndMutation";
import {
  CreateProjectMutation,
  CreateProjectMutationVariables,
  CreateLocationMutation,
  CreateLocationMutationVariables,
  GetUnitAndCurrencyQuery,
} from "lib/types";

// Utils
import devLog from "lib/devLog";
import { errorFormatter } from "lib/errorFormatter";
import { useRouter } from "next/router";
import useInBox from "../hooks/useInBox";
import { ProposalNotification } from "./notification";
import { string } from "yup";

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
  const { sendMessage } = useInBox();
  const { getItem } = useStorage();
  const [error, setError] = useState<string>("");

  /* Getting all the needed mutations */

  const unitAndCurrency = useQuery<GetUnitAndCurrencyQuery>(QUERY_UNIT_AND_CURRENCY).data?.instanceVariables;
  const [citeProject] = useMutation(CITE_PROJECT);
  const [contributeToProject] = useMutation(CONTRIBUTE_TO_PROJECT);
  const [createProject] = useMutation<CreateProjectMutation, CreateProjectMutationVariables>(CREATE_PROJECT);
  const [createLocation] = useMutation<CreateLocationMutation, CreateLocationMutationVariables>(CREATE_LOCATION);
  const [createProcess] = useMutation(CREATE_PROCESS);
  const { refetch } = useQuery(ASK_RESOURCE_PRIMARY_ACCOUNTABLE);

  /* Location Creation */

  type SpatialThingRes = CreateLocationMutation["createSpatialThing"]["spatialThing"];

  async function handleCreateLocation(formData: CreateProjectNS.FormValues): Promise<SpatialThingRes | undefined> {
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

  async function handleProjectCreation(formData: CreateProjectNS.FormValues) {
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
        const citeVariables = {
          agent: user!.ulid,
          resource: resource.value.id,
          process: processData?.createProcess.process.id,
          creationTime: new Date().toISOString(),
          unitOne: unitAndCurrency?.units.unitOne.id!,
        };
        await citeProject({ variables: citeVariables });
        const { data } = await refetch({ id: resource.value.id });
        const message: ProposalNotification = {
          proposalID: resource.value.id,
          proposerName: user!.name,
          originalResourceID: resource.value.id,
          originalResourceName: resource.value.name,
          text: formData.description,
        };
        await sendMessage(message, [data.economicResource.primaryAccountable.id], "Project cited");
      }

      for (const contributor of contributors) {
        const contributeVariables = {
          agent: contributor.id,
          process: processData?.createProcess.process.id,
          creationTime: new Date().toISOString(),
          unitOne: unitAndCurrency?.units.unitOne.id!,
          conformTo: formData.type,
        };
        devLog("info: contributor variables", contributeVariables);
        await contributeToProject({ variables: contributeVariables });
      }

      const variables: CreateProjectMutationVariables = {
        resourceSpec: formData.type,
        process: processData.createProcess.process.id,
        agent: user?.ulid!,
        name: formData.name,
        note: formData.description,
        metadata: JSON.stringify({ contributors: contributors }),
        location: location?.id!,
        oneUnit: unitAndCurrency?.units.unitOne.id!,
        creationTime: new Date().toISOString(),
        repo: formData.repo,
        license: formData.license,
        images,
        tags,
      };
      devLog("info: project variables created", variables);

      // Create project
      const { data: createProjectData, errors } = await createProject({ variables });
      if (errors) throw new Error("ProjectNotCreated");

      // Upload images
      await uploadFiles(formData.images);
      devLog("success: images uploaded");

      // Redirecting user
      await router.replace(
        `/project/${createProjectData?.createEconomicEvent?.economicEvent?.resourceInventoriedAs?.id}`
      );
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
      <div className="p-4 text-text-primary">
        <Button
          onClick={() => {
            router.back();
          }}
          plain
          monochrome
          id="#back"
        >
          {t("← Discard and go back")}
        </Button>
      </div>

      {loading && <div>creating...</div>}

      {!loading && (
        <div className="mx-auto p-8 max-w-xl">
          {/* Heading */}
          <div>
            <h2 className="text-primary">{t("Create a new project")} </h2>
            <p>{t("Make sure you read the Comunity Guidelines before you create a new project")}.</p>
            <p>{t("Fields marked with a red asterisk are mandatory")}.</p>
          </div>

          <CreateProjectForm
            onSubmit={async data => {
              await handleProjectCreation(data);
            }}
          >
            {error && (
              <Banner
                title={t("Error in Project creation")}
                status="critical"
                onDismiss={() => {
                  setError("");
                }}
              >
                <p className="whitespace-pre-wrap">{error}</p>
              </Banner>
            )}
          </CreateProjectForm>
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
